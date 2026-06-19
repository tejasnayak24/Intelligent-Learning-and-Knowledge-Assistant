from services.chunking_service import chunk_text
from services.embedding_service import create_embeddings
from services.vector_service import create_index

text = """
Database Management Systems are used to store data.
SQL is used to query databases.
MongoDB is a NoSQL database.
"""

chunks = chunk_text(text)

embeddings = create_embeddings(chunks)

index = create_index(embeddings)

print("Chunks:", len(chunks))
print("Embeddings Shape:", embeddings.shape)
print("FAISS Vectors:", index.ntotal)