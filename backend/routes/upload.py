from fastapi import APIRouter, UploadFile, File, HTTPException
from services.pdf_service import (
    extract_text_from_pdf,
    save_document_metadata
)
import os
from database import documents_collection
from services.chunking_service import chunk_text
from services.embedding_service import create_embeddings
from services.vector_service import (
    append_to_index,
    save_chunks
)

router = APIRouter()

UPLOAD_FOLDER = "uploads"
VECTORSTORE_FOLDER = "vectorstore"

os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(VECTORSTORE_FOLDER, exist_ok=True)


@router.post("/upload")
async def upload_pdf(file: UploadFile = File(...)):

    file_path = os.path.join(
        UPLOAD_FOLDER,
        file.filename
    )

    with open(file_path, "wb") as buffer:
        buffer.write(await file.read())

    pdf_data = extract_text_from_pdf(
        file_path
    )

    # Check if text was extracted
    if not pdf_data["text"].strip():
        raise HTTPException(
            status_code=400,
            detail="No text could be extracted from this PDF."
        )

    chunks = chunk_text(
        pdf_data["text"]
    )

    print("PDF Text Length:", len(pdf_data["text"]))
    print("Chunks Generated:", len(chunks))

    # Check if chunking failed
    if not chunks:
        raise HTTPException(
            status_code=400,
            detail="No chunks generated from PDF."
        )

    embeddings = create_embeddings(
        chunks
    )

    print("Embeddings Shape:", embeddings.shape)

    append_to_index(
        embeddings
    )

    chunk_records = []

    for chunk in chunks:
        chunk_records.append({
            "filename": file.filename,
            "text": chunk
        })

    save_chunks(
        chunk_records
    )

    save_document_metadata(
        file.filename,
        pdf_data["pages"],
        pdf_data["characters"]
    )

    return {
        "message": "PDF uploaded successfully",
        "filename": file.filename,
        "pages": pdf_data["pages"],
        "characters": pdf_data["characters"],
        "chunks_created": len(chunks)
    }


@router.get("/documents")
def get_documents():

    documents = []

    for doc in documents_collection.find():

        documents.append({
            "id": str(doc["_id"]),
            "filename": doc["filename"],
            "pages": doc["pages"],
            "characters": doc["characters"]
        })

    return documents