from fastapi import APIRouter
from pydantic import BaseModel

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
    }