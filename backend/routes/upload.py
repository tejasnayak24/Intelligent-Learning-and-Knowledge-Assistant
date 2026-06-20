from fastapi import APIRouter, UploadFile, File
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
VECTORSTORE_FOLDER = "vectorstore" # FIXED: Defined the vector storage target name

# Initialize directories automatically on server spin-up
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(VECTORSTORE_FOLDER, exist_ok=True) # FIXED: Bulletproof safety check creating the directory if missing


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

    chunks = chunk_text(
        pdf_data["text"]
    )

    embeddings = create_embeddings(
        chunks
    )

    # This downstream service call will now successfully locate the parent directory
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
        "characters": pdf_data["characters"]
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