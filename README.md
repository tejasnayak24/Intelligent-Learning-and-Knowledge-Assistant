# 🧠 Intelligent Learning & Knowledge Assistant (ILKA)

An AI-powered Retrieval-Augmented Generation (RAG) platform that enables users to upload multiple PDF documents, perform semantic search, and receive context-aware answers generated using Google Gemini. The system combines vector search, document intelligence, and generative AI to create an interactive learning assistant for students, researchers, and professionals.

---

## 🚀 Overview

ILKA transforms static learning materials into an intelligent knowledge base by:

* Extracting and processing content from PDF documents
* Generating semantic embeddings using transformer models
* Storing document vectors in FAISS for fast retrieval
* Retrieving relevant context for user queries
* Generating accurate answers using Google Gemini
* Displaying document citations for transparency and verification

---

## ✨ Key Features

### Authentication & User Management

* Secure User Registration
* JWT-based Authentication
* User Login & Session Management

### Document Processing

* Multi-PDF Upload Support
* PDF Text Extraction
* Automatic Document Chunking
* Metadata Storage
* Document Management Dashboard

### AI-Powered Retrieval

* Semantic Search
* Vector Similarity Search
* Context Retrieval using FAISS
* Multi-Document Knowledge Retrieval

### Generative AI

* Context-Aware Question Answering
* Google Gemini Integration
* Hallucination Reduction through RAG
* Source Citation Generation

### Learning Assistant

* Chat with Documents
* Knowledge Discovery
* Intelligent Document Exploration
* Context-Based Answers

---

# 🏗️ System Architecture

```text
User
 │
 ▼
React Frontend
 │
 ▼
FastAPI Backend
 │
 ├── Authentication Module
 │
 ├── PDF Processing Module
 │       │
 │       ├── Text Extraction
 │       ├── Chunking
 │       └── Metadata Storage
 │
 ├── Embedding Engine
 │       │
 │       └── Sentence Transformers
 │
 ├── Vector Database
 │       │
 │       └── FAISS
 │
 ├── Retrieval Layer
 │
 └── Gemini LLM
         │
         ▼
  Context-Aware Responses
```

---

# 🛠️ Technology Stack

## Frontend

| Technology        | Purpose               |
| ----------------- | --------------------- |
| React.js          | User Interface        |
| Vite              | Frontend Build Tool   |
| JavaScript (ES6+) | Application Logic     |
| CSS3              | Styling               |
| Fetch API         | Backend Communication |

---

## Backend

| Technology    | Purpose                         |
| ------------- | ------------------------------- |
| Python        | Core Backend Language           |
| FastAPI       | REST API Framework              |
| Uvicorn       | ASGI Server                     |
| Pydantic      | Request Validation              |
| Python Dotenv | Environment Variable Management |

---

## Database

| Technology    | Purpose        |
| ------------- | -------------- |
| MongoDB Atlas | Cloud Database |
| PyMongo       | MongoDB Driver |

---

## AI & Machine Learning

| Technology                           | Purpose                  |
| ------------------------------------ | ------------------------ |
| Google Gemini API                    | Answer Generation        |
| Sentence Transformers                | Embedding Generation     |
| all-MiniLM-L6-v2                     | Embedding Model          |
| FAISS                                | Vector Similarity Search |
| Retrieval-Augmented Generation (RAG) | Context-Aware QA         |

---

## Document Processing

| Technology               | Purpose             |
| ------------------------ | ------------------- |
| PyPDF                    | PDF Text Extraction |
| Custom Chunking Pipeline | Text Segmentation   |

---

## Development Tools

| Technology | Purpose                 |
| ---------- | ----------------------- |
| Git        | Version Control         |
| GitHub     | Repository Hosting      |
| VS Code    | Development Environment |
| Swagger UI | API Testing             |

---

# 📂 Project Structure

```text
Intelligent-Learning-and-Knowledge-Assistant
│
├── backend
│   │
│   ├── routes
│   │   ├── auth.py
│   │   ├── upload.py
│   │   └── search.py
│   │
│   ├── services
│   │   ├── auth_service.py
│   │   ├── pdf_service.py
│   │   ├── chunking_service.py
│   │   ├── embedding_service.py
│   │   ├── vector_service.py
│   │   ├── search_service.py
│   │   └── gemini_service.py
│   │
│   ├── uploads
│   ├── vectorstore
│   ├── database.py
│   ├── main.py
│   └── requirements.txt
│
├── frontend
│   ├── src
│   ├── public
│   └── package.json
│
└── README.md
```

---

# 🔄 Workflow

### Step 1: Upload Documents

User uploads one or more PDF files.

### Step 2: Document Processing

The system:

* Extracts text
* Splits text into chunks
* Generates embeddings

### Step 3: Vector Storage

Embeddings are stored in FAISS.

### Step 4: User Query

User asks a question.

### Step 5: Semantic Retrieval

Relevant chunks are retrieved using vector similarity search.

### Step 6: Answer Generation

Retrieved context is sent to Gemini.

### Step 7: Response Generation

Gemini generates:

* Context-aware answer
* Source citations

---

# 🔐 Environment Variables

Create a `.env` file inside the backend directory.

```env
MONGO_URI=your_mongodb_connection_string

JWT_SECRET=your_jwt_secret

GEMINI_API_KEY=your_gemini_api_key
```

---

# ⚙️ Installation & Setup

## Clone Repository

```bash
git clone https://github.com/tejasnayak24/Intelligent-Learning-and-Knowledge-Assistant.git

cd Intelligent-Learning-and-Knowledge-Assistant
```

---

## Backend Setup

```bash
cd backend

python -m venv venv

venv\Scripts\activate

pip install -r requirements.txt
```

Run Backend:

```bash
uvicorn main:app --reload
```

Backend URL:

```text
http://127.0.0.1:8000
```

API Documentation:

```text
http://127.0.0.1:8000/docs
```

---

## Frontend Setup

```bash
cd frontend

npm install

npm run dev
```

Frontend URL:

```text
http://localhost:5173
```

---

# 📡 API Endpoints

### Authentication

```http
POST /signup
POST /login
```

### Document Management

```http
POST /upload
GET /documents
```

### Semantic Search

```http
POST /search
```

Example Request:

```json
{
  "question": "What is machine learning?"
}
```

---

# 🎯 Current Capabilities

* Multi-document Retrieval
* Semantic Search
* RAG-based Question Answering
* Gemini Integration
* Source Citations
* MongoDB Storage
* JWT Authentication
* FAISS Vector Search

---

# 🔮 Future Enhancements

* OCR Support for Scanned PDFs
* AI Note Generation
* Quiz Generation
* Flashcard Generation
* Chat History
* Personalized Learning Paths
* Document Deletion & Reindexing
* Role-Based Access Control

---

# 📜 License

This project is developed for educational, research, and academic purposes.
