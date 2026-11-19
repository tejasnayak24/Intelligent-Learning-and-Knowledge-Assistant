from fastapi import APIRouter, Depends, HTTPException, status
import os
import traceback
from typing import Optional
from google.genai import errors as genai_errors
from pydantic import BaseModel
import google.generativeai as genai  

from services.search_service import get_document_chunks, search_documents
from services.gemini_service import generate_answer
from utils.jwt_handler import get_current_user_email

router = APIRouter()

NO_DOCUMENT_SELECTED = "No document selected. Please upload a PDF first."
NO_DOCUMENT_CONTENT = (
    "No content was found for the selected document. "
    "Please upload the PDF again."
)
SEARCH_FAILED = "The selected document could not be searched. Please try again."
AI_LIMIT_REACHED = (
    "The AI service has reached its usage limit. Please try again later."
)
AI_UNAVAILABLE = (
    "The AI service could not answer right now. Please try again in a moment."
)
AI_EMPTY_ANSWER = (
    "The AI service returned an empty answer. Please try asking again."
)


class SearchRequest(BaseModel):
    question: str
    # The PDF to answer from: the one the user uploaded and selected.
    document_id: Optional[str] = None


class SummaryRequest(BaseModel):
    document_id: Optional[str] = None


def format_sources(chunks):
    """Filename and page(s) of each chunk used, without repeats."""

    sources = []

    for chunk in chunks:
        start, end = chunk.get("page_start"), chunk.get("page_end")

        if start is None:
            source = chunk["filename"]
        elif start == end:
            source = f"{chunk['filename']} (p. {start})"
        else:
            source = f"{chunk['filename']} (pp. {start}-{end})"

        if source not in sources:
            sources.append(source)

    return sources


@router.post("/search")
def search(
    request: SearchRequest,
    user_email: str = Depends(get_current_user_email)
):

    if not request.document_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=NO_DOCUMENT_SELECTED
        )

    # Failures below are raised as HTTPException so the response keeps its CORS
    # headers and the chat can show the reason. An unhandled exception becomes
    # a bare 500 without them, which the browser hides from the frontend.

    # Only chunks of the selected document, and only if it belongs to this user.
    try:
        chunks = search_documents(
            request.question,
            request.document_id,
            user_email
        )
    except Exception:
        traceback.print_exc()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=SEARCH_FAILED
        )

    if not chunks:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=NO_DOCUMENT_CONTENT
        )

    context = "\n\n".join(
        chunk["text"]
        for chunk in chunks
    )

    try:
        answer = generate_answer(
            request.question,
            context
        )
    except Exception as e:
        traceback.print_exc()

        # For example the free tier's daily request limit.
        if isinstance(e, genai_errors.APIError) and e.code == 429:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail=AI_LIMIT_REACHED
            )

        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=AI_UNAVAILABLE
        )

    if not isinstance(answer, str) or not answer.strip():
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=AI_EMPTY_ANSWER
        )

    return {
        "question": request.question,
        "answer": answer,
        "document_id": request.document_id,
        "sources": format_sources(chunks)
    }

@router.post("/summarize")
def generate_summary(
    request: Optional[SummaryRequest] = None,
    user_email: str = Depends(get_current_user_email)
):
    try:
        document_id = request.document_id if request else None

        if not document_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=NO_DOCUMENT_SELECTED
            )

        # The selected document's chunks in their original order, and only
        # if it belongs to this user.
        chunk_records = [
            chunk
            for _, chunk in get_document_chunks(document_id, user_email)
        ]

        if not chunk_records:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=NO_DOCUMENT_CONTENT
            )

        extracted_texts = [doc["text"] for doc in chunk_records[:15]] 
        unified_context = " ".join(extracted_texts)

        api_key = os.getenv("GEMINI_API_KEY")
        if not api_key:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Backend configuration error: GEMINI_API_KEY missing from environment variables."
            )
            
        genai.configure(api_key=api_key)
        model = genai.GenerativeModel("gemini-3.5-flash")
        
        prompt = (
            "You are an expert study assistant. Create a highly structured, comprehensive, "
            "and high-yield summary blueprint of the following document text context. "
            "Organize it cleanly using logical headings and bullet points for key takeaways:\n\n"
            f"{unified_context}"
        )

        response = model.generate_content(prompt)
        ai_summary = response.text # Grabs real response string from Gemini nodes

        return {"summary": ai_summary}

    except HTTPException:
        # Keep 400/404 responses as they are instead of turning them into 500s.
        raise

    except Exception as e:
        print(f"Exception during summarization phase: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate summary: {str(e)}"
        )
