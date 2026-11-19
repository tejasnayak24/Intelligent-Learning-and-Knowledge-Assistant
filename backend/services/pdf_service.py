from bisect import bisect_right
from pypdf import PdfReader
from database import documents_collection
from datetime import datetime

def extract_text_from_pdf(pdf_path):

    reader = PdfReader(pdf_path)

    text = ""

    # Offset in text where each page's text starts, so chunks can be traced
    # back to their pages for citations.
    page_starts = []

    for page in reader.pages:
        page_starts.append(len(text))
        page_text = page.extract_text()

        if page_text:
            text += page_text

    return {
        "text": text,
        "pages": len(reader.pages),
        "characters": len(text),
        "page_starts": page_starts
    }

def get_page_range(page_starts, start, end):
    """First and last page number (from 1) of the text from start to end."""

    first_page = bisect_right(page_starts, start)
    last_page = bisect_right(page_starts, max(start, end - 1))

    return first_page, last_page

def save_document_metadata(filename, pages, characters, document_id, owner):

    documents_collection.insert_one({
        "document_id": document_id,
        "owner": owner,
        "filename": filename,
        "pages": pages,
        "characters": characters,
        "uploaded_at": datetime.utcnow()
    })