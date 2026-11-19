"""Regression tests for PDF question answering: upload -> FAISS -> /search.

They run the real FastAPI app with real PDF parsing, chunking and FAISS files in a
temporary working directory. MongoDB, the embedding model and Gemini are replaced by
in-memory stand-ins, so no network, database or API key is needed.

Run from the backend folder:
    python -m unittest discover -s tests -v
"""
import contextlib
import io
import os
import pickle
import re
import sys
import tempfile
import textwrap
import types
import unittest
import zlib
from unittest import mock

import numpy as np

BACKEND_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if BACKEND_DIR not in sys.path:
    sys.path.insert(0, BACKEND_DIR)

# An origin allowed by the CORS settings in main.py. The browser only lets the
# chat read a response (and its error detail) when it carries this origin.
ORIGIN = "https://intelligent-learning-and-knowledge.vercel.app"


class FakeCollection:
    """The MongoDB calls the app makes, kept in memory."""

    def __init__(self):
        self.docs = []

    def insert_one(self, doc):
        self.docs.append(dict(doc, _id=f"id{len(self.docs) + 1}"))

    def find(self, query=None):
        return [dict(d) for d in self.docs
                if all(d.get(k) == v for k, v in (query or {}).items())]

    def find_one(self, query=None):
        found = self.find(query)
        return found[0] if found else None


class FakeEmbeddingModel:
    """Stand-in for the FastEmbed model: normalized 384-dimension word-hash vectors."""

    def encode(self, texts):
        vectors = np.zeros((len(texts), 384), dtype=np.float32)
        for row, text in enumerate(texts):
            for word in re.findall(r"[a-z0-9]+", text.lower()):
                vectors[row, zlib.crc32(word.encode()) % 384] += 1.0
        norms = np.linalg.norm(vectors, axis=1, keepdims=True)
        return vectors / np.where(norms == 0, 1, norms)


def make_pdf(pages):
    """A text PDF. Each page is a list of lines; an empty list gives a page without text."""
    objects = {
        1: b"<< /Type /Catalog /Pages 2 0 R >>",
        3: b"<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
    }
    kids, number = [], 4
    for lines in pages:
        operators = ["BT", "/F1 11 Tf", "14 TL", "72 740 Td"]
        for line in lines:
            escaped = line.replace("\\", "\\\\").replace("(", "\\(").replace(")", "\\)")
            operators.append(f"({escaped}) Tj T*")
        stream = "\n".join(operators + ["ET"]).encode("latin-1")
        objects[number + 1] = (b"<< /Length %d >>\nstream\n" % len(stream)
                               + stream + b"\nendstream")
        objects[number] = (b"<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] "
                           b"/Resources << /Font << /F1 3 0 R >> >> /Contents %d 0 R >>"
                           % (number + 1))
        kids.append(number)
        number += 2
    kid_refs = " ".join(f"{kid} 0 R" for kid in kids)
    objects[2] = f"<< /Type /Pages /Kids [{kid_refs}] /Count {len(kids)} >>".encode()

    pdf, offsets = bytearray(b"%PDF-1.4\n"), {}
    for obj in sorted(objects):
        offsets[obj] = len(pdf)
        pdf += f"{obj} 0 obj\n".encode() + objects[obj] + b"\nendobj\n"
    xref = len(pdf)
    pdf += f"xref\n0 {number}\n0000000000 65535 f \n".encode()
    pdf += b"".join(f"{offsets[obj]:010d} 00000 n \n".encode() for obj in range(1, number))
    pdf += f"trailer\n<< /Size {number} /Root 1 0 R >>\nstartxref\n{xref}\n%%EOF\n".encode()
    return bytes(pdf)


def topic_pages(topic, count, empty=()):
    """`count` pages of about 1,300 characters about `topic`; page numbers in `empty` have no text."""
    pages = []
    for page in range(1, count + 1):
        if page in empty:
            pages.append([])
            continue
        sentences = [f"Page {page} of the {topic} notes: the {topic} code for page {page} is {topic}{page}."]
        while sum(len(s) + 1 for s in sentences) < 1300:
            sentences.append(f"{topic} detail {page}.{len(sentences)}: more about {topic} on page {page}.")
        pages.append(textwrap.wrap(" ".join(sentences), 80))
    return pages


# Each uploaded PDF uses its own topic word, so any text from another PDF is easy to spot.
TOPICS = ("zubrovia", "orvalle", "halcyon", "fennimore", "kestrel", "lumentra",
          "quellar", "corvane", "penhallow")


class SearchPipelineTest(unittest.TestCase):

    @classmethod
    def setUpClass(cls):
        cls._old_cwd = os.getcwd()
        cls._workdir = tempfile.TemporaryDirectory(ignore_cleanup_errors=True)
        # The app keeps uploads/ and vectorstore/ relative to the working directory.
        os.chdir(cls._workdir.name)

        os.environ["JWT_SECRET"] = "test-only-secret"
        os.environ["GEMINI_API_KEY"] = "not-a-real-key"

        database = types.ModuleType("database")
        database.users_collection = FakeCollection()
        database.documents_collection = FakeCollection()
        database.db = {"users": database.users_collection,
                       "documents": database.documents_collection}
        sys.modules["database"] = database

        import main
        import services.model_loader as model_loader
        from fastapi.testclient import TestClient
        from utils.jwt_handler import create_access_token

        model_loader._embedding_model = FakeEmbeddingModel()
        # Like production: an unhandled exception becomes a plain 500 response.
        cls.client = TestClient(main.app, raise_server_exceptions=False)
        cls.alice = {"Authorization": "Bearer " + create_access_token({"email": "alice@example.com"}),
                     "Origin": ORIGIN}
        cls.bob = {"Authorization": "Bearer " + create_access_token({"email": "bob@example.com"}),
                   "Origin": ORIGIN}

    @classmethod
    def tearDownClass(cls):
        os.chdir(cls._old_cwd)
        cls._workdir.cleanup()

    # ------------------------------------------------------------------ helpers

    def upload(self, headers, filename, pages):
        response = self.client.post(
            "/upload",
            files={"file": (filename, make_pdf(pages), "application/pdf")},
            headers=headers,
        )
        self.assertEqual(response.status_code, 200, response.text)
        self.assertRegex(response.json()["document_id"], r"^[0-9a-f]{32}$")
        return response.json()

    def ask(self, headers, document_id, question):
        return self.client.post(
            "/search",
            json={"question": question, "document_id": document_id},
            headers=headers,
        )

    def assert_error_shown_in_chat(self, response, status_code):
        """The chat shows `detail`, which the browser only exposes with the CORS header."""
        self.assertEqual(response.status_code, status_code, response.text)
        self.assertEqual(response.headers.get("access-control-allow-origin"), ORIGIN)
        self.assertIsInstance(response.json().get("detail"), str)

    def assert_context_only_from(self, context, topic):
        words = set(re.findall(r"[a-z]+", context.lower()))
        self.assertIn(topic, words)
        self.assertEqual(words & (set(TOPICS) - {topic}), set())

    def chunk_records(self, document_id):
        with open(os.path.join("vectorstore", "chunks.pkl"), "rb") as f:
            return [c for c in pickle.load(f) if c.get("document_id") == document_id]

    # ------------------------------------------------------------------ tests

    def test_several_questions_about_the_same_pdf(self):
        doc = self.upload(self.alice, "zubrovia.pdf", topic_pages("zubrovia", 3))
        self.upload(self.alice, "orvalle.pdf", topic_pages("orvalle", 3))  # another PDF in the index
        contexts = []

        def answer(question, context):
            contexts.append(context)
            return f"answer {len(contexts)}"

        with mock.patch("routes.search.generate_answer", side_effect=answer):
            for number in range(1, 9):
                page = (number - 1) % 3 + 1
                response = self.ask(self.alice, doc["document_id"],
                                     f"What is the zubrovia code for page {page}?")
                self.assertEqual(response.status_code, 200, response.text)
                body = response.json()
                self.assertEqual(body["answer"], f"answer {number}")
                self.assertEqual(body["document_id"], doc["document_id"])
                self.assertTrue(body["sources"])
                for source in body["sources"]:
                    self.assertRegex(source, r"^zubrovia\.pdf \(pp?\. [1-3](-[1-3])?\)$")

        self.assertEqual(len(contexts), 8)
        for context in contexts:
            self.assert_context_only_from(context, "zubrovia")

    def test_pdfs_with_different_page_counts(self):
        from pypdf import PdfReader

        # topic: (pages, pages without text)
        cases = {"halcyon": (1, ()), "fennimore": (2, ()), "kestrel": (5, (2,)), "lumentra": (8, (1, 8))}
        documents = {topic: self.upload(self.alice, f"{topic}.pdf", topic_pages(topic, count, empty))
                     for topic, (count, empty) in cases.items()}

        for topic, (count, empty) in cases.items():
            document_id = documents[topic]["document_id"]
            self.assertEqual(documents[topic]["pages"], count)

            # Each chunk's page range, checked against the PDF's own pages.
            path = os.path.join("uploads", f"{document_id}.pdf")
            page_ends, total = [], 0
            for page in PdfReader(path).pages:
                total += len(page.extract_text() or "")
                page_ends.append(total)
            offset = 0
            for chunk in self.chunk_records(document_id):
                first = next(i for i, end in enumerate(page_ends) if end > offset) + 1
                last = next(i for i, end in enumerate(page_ends) if end >= offset + len(chunk["text"])) + 1
                self.assertEqual((chunk["page_start"], chunk["page_end"]), (first, last))
                self.assertNotIn(chunk["page_start"], empty)
                self.assertNotIn(chunk["page_end"], empty)
                offset += len(chunk["text"])

            # Several questions, each answered from this PDF only, with pages inside it.
            pages_with_text = [p for p in range(1, count + 1) if p not in empty]
            for page in pages_with_text[:3]:
                with mock.patch("routes.search.generate_answer", return_value="ok") as llm:
                    response = self.ask(self.alice, document_id,
                                        f"What is the {topic} code for page {page}?")
                self.assertEqual(response.status_code, 200, response.text)
                self.assert_context_only_from(llm.call_args.args[1], topic)
                for source in response.json()["sources"]:
                    match = re.fullmatch(rf"{topic}\.pdf \(pp?\. (\d+)(?:-(\d+))?\)", source)
                    self.assertIsNotNone(match, source)
                    for value in filter(None, match.groups()):
                        self.assertIn(int(value), pages_with_text)

    def test_ai_service_errors_reach_the_chat(self):
        from google.genai import errors

        doc = self.upload(self.alice, "quellar.pdf", topic_pages("quellar", 2))
        question = "What is the quellar code for page 1?"

        with mock.patch("routes.search.generate_answer", return_value="first answer"):
            self.assertEqual(self.ask(self.alice, doc["document_id"], question).status_code, 200)

        failures = [
            (errors.ClientError(429, {"error": {"code": 429, "status": "RESOURCE_EXHAUSTED",
                                                "message": "Quota exceeded"}}), 429),
            (errors.ServerError(503, {"error": {"code": 503, "status": "UNAVAILABLE",
                                                "message": "The model is overloaded."}}), 502),
            (TimeoutError("timed out"), 502),
        ]
        for error, status_code in failures:
            with self.subTest(error=type(error).__name__), \
                    mock.patch("routes.search.generate_answer", side_effect=error), \
                    contextlib.redirect_stderr(io.StringIO()) as log:
                self.assert_error_shown_in_chat(self.ask(self.alice, doc["document_id"], question), status_code)
                # The full error still goes to the server log (Render's logs).
                self.assertIn(type(error).__name__, log.getvalue())

        for empty in (None, "", "   "):
            with self.subTest(answer=empty), \
                    mock.patch("routes.search.generate_answer", return_value=empty):
                self.assert_error_shown_in_chat(self.ask(self.alice, doc["document_id"], question), 502)

        with mock.patch("routes.search.generate_answer", return_value="working again"):
            response = self.ask(self.alice, doc["document_id"], question)
        self.assertEqual(response.status_code, 200, response.text)
        self.assertEqual(response.json()["answer"], "working again")

    def test_unexpected_search_failure_reaches_the_chat(self):
        doc = self.upload(self.alice, "corvane.pdf", topic_pages("corvane", 1))
        with mock.patch("routes.search.search_documents", side_effect=RuntimeError("index unreadable")), \
                mock.patch("routes.search.generate_answer") as llm, \
                contextlib.redirect_stderr(io.StringIO()) as log:
            self.assert_error_shown_in_chat(
                self.ask(self.alice, doc["document_id"], "What is the corvane code for page 1?"), 500)
        self.assertIn("index unreadable", log.getvalue())
        llm.assert_not_called()

    def test_document_and_user_isolation_still_enforced(self):
        doc = self.upload(self.alice, "private.pdf", topic_pages("penhallow", 2))
        question = "What is the penhallow code for page 1?"
        with mock.patch("routes.search.generate_answer", return_value="x") as llm:
            self.assert_error_shown_in_chat(self.ask(self.bob, doc["document_id"], question), 404)
            self.assert_error_shown_in_chat(self.ask(self.alice, "0" * 32, question), 404)
            self.assert_error_shown_in_chat(self.ask(self.alice, None, question), 400)
            self.assert_error_shown_in_chat(self.ask({"Origin": ORIGIN}, doc["document_id"], question), 401)
        llm.assert_not_called()


if __name__ == "__main__":
    unittest.main()
