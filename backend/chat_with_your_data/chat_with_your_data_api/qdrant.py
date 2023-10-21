import json
import os
import uuid

from qdrant_client import QdrantClient, http
from qdrant_client.models import (
    PointStruct,
    FilterSelector,
    Filter,
    FieldCondition,
    MatchValue,
)
from qdrant_client.http.models import Distance, VectorParams

from .embedding import prepare_text, vectorize, embed_text
from .serializers import SectionSerializer


__client = QdrantClient(
    url=os.getenv("QDRANT_URL"),
    api_key=os.getenv("QDRANT_SECRET"),
)


def __get_vec_distance():
    match os.getenv("VEC_DISTANCE", "COSINE"):
        case "COSINE":
            return Distance.COSINE
        case "DOT":
            return Distance.DOT
        case "EUCLIDEAN":
            return Distance.EUCLIDEAN


__collection_vec_size = os.getenv("VEC_SIZE", 512)
__collection_vec_distance = __get_vec_distance()


def create_collection(name):
    __client.recreate_collection(
        collection_name=name,
        vectors_config=VectorParams(
            size=__collection_vec_size, distance=__collection_vec_distance
        ),
    )


def search(collection_name, vector, limit):
    result = __client.search(
        collection_name=collection_name, query_vector=vector.tolist(), limit=limit
    )
    return result


def insert_text(collection_name, document, lang):
    embedded_text = embed_text(document.text, lang)
    tokens = prepare_text(embedded_text)
    points = []
    for i, token in enumerate(tokens):
        content = " ".join(token)
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


def delete_text(collection_name, document):
    filter = Filter(
        must=[
            FieldCondition(
                key="document_id",
                match=MatchValue(value=int(document['id'])),
            ),
        ],
    )
    __delete_points(collection_name, filter)


def __delete_points(collection_name, filter):
    __client.delete(
        collection_name=collection_name, points_selector=FilterSelector(filter=filter)
    )
