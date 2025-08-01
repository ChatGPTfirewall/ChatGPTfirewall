import json
import os
import uuid
import re

from qdrant_client import QdrantClient
from qdrant_client.http.models import Distance, VectorParams
from qdrant_client.models import (FieldCondition, Filter, FilterSelector,
                                  MatchValue, PointStruct)

from .embedding import embed_text, prepare_text, vectorize
from .serializers import SectionSerializer

__client = QdrantClient(
    url=os.getenv("QDRANT_URL"),
    api_key=os.getenv("QDRANT_SECRET"),
    prefer_grpc=True
)


def __get_vec_distance():
    match os.getenv("VEC_DISTANCE", "COSINE"):
        case "COSINE":
            return Distance.COSINE
        case "DOT":
            return Distance.DOT
        case "EUCLIDEAN":
            return Distance.EUCLIDEAN


__collection_vec_size = os.getenv("VEC_SIZE", 768)
__collection_vec_distance = __get_vec_distance()


def create_collection(name):
    __client.recreate_collection(
        collection_name=name,
        vectors_config=VectorParams(
            size=__collection_vec_size, distance=__collection_vec_distance
        ),
    )


def delete_collection(name):
    __client.delete_collection(collection_name=name)


def search(collection_name, vector, document_ids):
    # Konvertiere die Liste der Dokument-IDs in eine Liste von MatchValue Bedingungen
    document_id_conditions = [MatchValue(value=doc_id) for doc_id in document_ids]
    # Erstelle einen Filter, der nur Punkte zurückgibt, deren document_id in der Liste der ausgewählten Dokument-IDs enthalten ist
    filter = Filter(
        should=[
            FieldCondition(key="document_id", match=condition)
            for condition in document_id_conditions
        ],
        # should_score=True
    )

    # Führe die Suche mit dem definierten Filter aus
    result = __client.search(
        collection_name=collection_name,
        query_vector=vector.tolist(),
        limit=3,
        query_filter=filter,
    )
    return result


def insert_text(collection_name, document, lang):
    embedded_text = embed_text(document.text, lang)
    tokens = prepare_text(embedded_text)
    points = []
    for i, token in enumerate(tokens):
        content = clean_join(token)
        section = {"document": document.id, "content": content, "doc_index": i}
        serializer = SectionSerializer(data=section)
        if serializer.is_valid():
            result = serializer.save()
        else:
            return serializer.errors

        vector = vectorize(content)
        point = PointStruct(
            id=str(uuid.uuid4()),
            vector=vector.tolist(),
            payload={"section_id": result.id, "document_id": document.id},
        )
        points.append(point)
    __insert_points(collection_name, points)
    return True


def __insert_points(collection_name, points):
    __client.upsert(collection_name=collection_name, points=points)


def clean_join(tokens):
    text = " ".join(tokens)
    # Remove spaces before punctuation marks (commas, periods, etc.)
    text = re.sub(r"\s([,.?!)])", r"\1", text)
    text = re.sub(r"(\()\s", r"\1", text)
    return text

def delete_text(collection_name, document):
    filter = Filter(
        must=[
            FieldCondition(
                key="document_id",
                match=MatchValue(value=int(document.id)),
            ),
        ],
    )
    __delete_points(collection_name, filter)


def __delete_points(collection_name, filter):
    __client.delete(
        collection_name=collection_name, points_selector=FilterSelector(filter=filter)
    )
