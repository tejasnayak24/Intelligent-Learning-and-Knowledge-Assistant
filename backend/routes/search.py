<<<<<<< HEAD
from fastapi import APIRouter
from pydantic import BaseModel
=======
from fastapi import APIRouter, HTTPException, status
import pickle
import os
from pydantic import BaseModel
import google.generativeai as genai  
>>>>>>> frontend

from services.search_service import search_documents
from services.gemini_service import generate_answer

router = APIRouter()


class SearchRequest(BaseModel):
    question: str


@router.post("/search")
def search(request: SearchRequest):

    chunks = search_documents(
        request.question
    )

    context = "\n\n".join(
        chunk["text"]
        for chunk in chunks
    )

    answer = generate_answer(
        request.question,
        context
    )

    return {
        "question": request.question,
        "answer": answer,
        "sources": list(
            set(
                chunk["filename"]
                for chunk in chunks
            )
        )
<<<<<<< HEAD
    }
=======
    }

@router.post("/summarize")
def generate_summary():
    try:
        chunks_path = "vectorstore/chunks.pkl"
        if not os.path.exists(chunks_path):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No active document context found. Please upload a PDF first."
            )

        with open(chunks_path, "rb") as f:
            chunk_records = pickle.load(f)

        if not chunk_records:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="The active document index contains no extractable text."
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

    except Exception as e:
        print(f"Exception during summarization phase: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate summary: {str(e)}"
        )
>>>>>>> frontend
