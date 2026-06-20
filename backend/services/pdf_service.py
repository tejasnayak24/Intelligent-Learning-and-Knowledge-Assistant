from pypdf import PdfReader
from database import documents_collection
from datetime import datetime

def extract_text_from_pdf(pdf_path):

    reader = PdfReader(pdf_path)

    text = ""

    for page in reader.pages:
        page_text = page.extract_text()

        if page_text:
            text += page_text

    return {
        "text": text,
        "pages": len(reader.pages),
        "characters": len(text)
    }

def save_document_metadata(filename, pages, characters):

    documents_collection.insert_one({
        "filename": filename,
        "pages": pages,
        "characters": characters,
        "uploaded_at": datetime.utcnow()
    })