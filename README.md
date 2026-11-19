# 🧠 Cognify AI

**Turn documents into knowledge.**

Cognify AI is an AI-powered document intelligence and learning platform built with Retrieval-Augmented Generation (RAG). It lets users upload PDF documents, ask questions grounded in a selected document, and receive context-aware answers with page references.

**Live demo:** [Cognify AI](https://intelligent-learning-and-knowledge.vercel.app/)

> AI responses and note generation depend on the configured Google Gemini API quota and availability.

---

## ✨ Features

- **User accounts:** registration, login, and JWT-based authentication.
- **PDF ingestion:** upload PDFs, extract text, split content into chunks, and generate embeddings.
- **Document-scoped chat:** select a PDF and ask questions using only that document's retrieved content.
- **User-level isolation:** authenticated requests are scoped to the document owner.
- **Semantic retrieval:** FAISS similarity search over embeddings.
- **Source references:** answers can include the PDF name and page references.
- **AI answers:** Google Gemini generates responses using retrieved context.
- **Learning notes:** generate notes from the selected document.

## 🏗️ Architecture

```text
                         Cognify AI
                             │
                       React + Vite
                             │
                         FastAPI
                             │
              ┌──────────────┼──────────────┐
              │              │              │
        Authentication  PDF Processing   API Routes
           (JWT)        (PyPDF, chunks)  (Upload/Search)
                             │
                     Embedding Engine
                   all-MiniLM-L6-v2
                             │
                       FAISS Index
                (document + owner metadata)
                             │
                  Document-scoped Retrieval
                             │
                       Google Gemini
                             │
              Answer + source/page references
```

Each uploaded PDF receives a document identifier. Retrieval is restricted to the selected document and its owner before context is sent to Gemini.

## 🛠️ Tech Stack

| Area | Technologies |
|---|---|
| Frontend | React, Vite, JavaScript, CSS |
| Backend | Python, FastAPI, Uvicorn, Pydantic |
| Database | MongoDB Atlas, PyMongo |
| Embeddings | FastEmbed / ONNX Runtime, all-MiniLM-L6-v2 |
| Vector search | FAISS |
| LLM | Google Gemini API |
| PDF processing | PyPDF, custom chunking pipeline |
| Authentication | JWT |
| Deployment | Vercel (frontend), Render (backend) |

## 📂 Project Structure

```text
Intelligent-Learning-and-Knowledge-Assistant/
├── backend/
│   ├── routes/
│   │   ├── auth.py
│   │   ├── upload.py
│   │   └── search.py
│   ├── services/
│   │   ├── auth_service.py
│   │   ├── pdf_service.py
│   │   ├── chunking_service.py
│   │   ├── embedding_service.py
│   │   ├── model_loader.py
│   │   ├── vector_service.py
│   │   ├── search_service.py
│   │   └── gemini_service.py
│   ├── tests/
│   ├── database.py
│   ├── main.py
│   └── requirements.txt
├── frontend/
│   ├── src/
│   ├── public/
│   ├── vercel.json
│   └── package.json
└── README.md
```

## ⚙️ Run Locally

### Prerequisites

- Python 3.10+ (use the version supported by the backend dependencies)
- Node.js and npm
- MongoDB connection string
- Google Gemini API key

### 1. Clone the repository

```bash
git clone https://github.com/tejasnayak24/Intelligent-Learning-and-Knowledge-Assistant.git
cd Intelligent-Learning-and-Knowledge-Assistant
```

### 2. Configure the backend

Create `backend/.env`:

```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_long_random_secret
GEMINI_API_KEY=your_gemini_api_key
```

Install dependencies and start the API:

```bash
cd backend
python -m venv venv
# Windows
venv\Scripts\activate
# macOS/Linux
# source venv/bin/activate

pip install -r requirements.txt
uvicorn main:app --reload
```

Backend: http://127.0.0.1:8000  
API docs: http://127.0.0.1:8000/docs

### 3. Configure and start the frontend

In a second terminal:

```bash
cd frontend
npm install
npm run dev
```

Frontend: http://localhost:5173

Set `VITE_API_BASE_URL` in the frontend environment when pointing the frontend to a non-default backend. Never put backend secrets in frontend environment variables.

## 🔌 API

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/signup` | Register a user |
| POST | `/login` | Authenticate and obtain a token |
| POST | `/upload` | Upload and process a PDF |
| GET | `/documents` | List the authenticated user's documents |
| POST | `/search` | Ask a question about the selected document |
| POST | `/summarize` | Generate notes for the selected document |

Protected document endpoints require a valid bearer token. Search and summary requests must include the selected `document_id`.

## 🔄 How It Works

1. **Upload:** the user uploads a PDF.
2. **Extract and chunk:** text and page information are extracted and divided into chunks.
3. **Embed and index:** chunks are converted into vectors and added to FAISS with document and owner metadata.
4. **Select and ask:** the user selects a document and submits a question.
5. **Filter and retrieve:** retrieval considers only chunks belonging to that user and selected document.
6. **Generate:** retrieved context is sent to Gemini to produce a grounded answer.
7. **Reference:** the response includes source information and page references where available.

## 🔐 Security & Configuration

- Keep `.env` files and API credentials out of Git.
- Use a strong, unique `JWT_SECRET` in production.
- Do not share access tokens or API keys.
- Document retrieval is scoped by the authenticated owner and selected document.

## 🚧 Possible Enhancements

- OCR for scanned PDFs
- Quiz and flashcard generation
- Persistent chat history
- Personalized learning paths
- Document deletion and re-indexing
- More model-provider options

## 📜 License

Developed for educational, research, and academic purposes.
