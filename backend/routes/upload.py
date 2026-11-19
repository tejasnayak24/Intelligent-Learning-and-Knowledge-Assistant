from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from services.pdf_service import (
    extract_text_from_pdf,
    get_page_range,
    save_document_metadata
)
import os
import uuid
from database import documents_collection
from services.chunking_service import chunk_text
from services.embedding_service import create_embeddings
from services.vector_service import (
    append_to_index,
    save_chunks
)
from utils.jwt_handler import get_current_user_email

router = APIRouter()

UPLOAD_FOLDER = "uploads"
VECTORSTORE_FOLDER = "vectorstore"

os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(VECTORSTORE_FOLDER, exist_ok=True)


@router.post("/upload")
async def upload_pdf(
    file: UploadFile = File(...),
    user_email: str = Depends(get_current_user_email)
):

    # Each upload is a separate document. Its ID and owner are stored with
    # every chunk, so questions are answered from this PDF only and no other
    # user can retrieve it.
    document_id = uuid.uuid4().hex

    # Saved under the document ID rather than the uploaded name, so PDFs with
    # the same name never overwrite each other.
    file_path = os.path.join(
        UPLOAD_FOLDER,
        f"{document_id}.pdf"
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

    # Chunks are consecutive slices of the text; offset is where each starts.
    offset = 0

    for chunk in chunks:
        page_start, page_end = get_page_range(
            pdf_data["page_starts"],
            offset,
            offset + len(chunk)
        )

        chunk_records.append({
            "document_id": document_id,
            "owner": user_email,
            "filename": file.filename,
            "text": chunk,
            "page_start": page_start,
            "page_end": page_end
        })

        offset += len(chunk)

    save_chunks(
        chunk_records
    )

    save_document_metadata(
        file.filename,
        pdf_data["pages"],
        pdf_data["characters"],
        document_id,
        user_email
    )

    return {
        "message": "PDF uploaded successfully",
        "document_id": document_id,
        "filename": file.filename,
        "pages": pdf_data["pages"],
        "characters": pdf_data["characters"],
        "chunks_created": len(chunks)
    }


@router.get("/documents")
def get_documents(user_email: str = Depends(get_current_user_email)):

    documents = []

    # Only the signed-in user's documents.
    for doc in documents_collection.find({"owner": user_email}):

        documents.append({
            "id": str(doc["_id"]),
            "document_id": doc.get("document_id"),
            "filename": doc["filename"],
            "pages": doc["pages"],
            "characters": doc["characters"]
        })

    return documents