from services.model_loader import get_embedding_model

def create_embeddings(chunks):

    embeddings = get_embedding_model().encode(chunks)

    return embeddings