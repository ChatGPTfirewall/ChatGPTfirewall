from qdrant_client import QdrantClient, http
from qdrant_client.http.models import Distance, VectorParams, PointStruct
from .embedding import prepare_text, vectorize

import os
import json
import uuid

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

__collection_vec_size= os.getenv("VEC_SIZE", 512)
__collection_vec_distance= __get_vec_distance()


def get_or_create_collection(name):
    try:
        __client.get_collection(collection_name=name)
        return True
    except http.exceptions.UnexpectedResponse as e:

        try:
            error = json.loads(e.content)["status"]["error"]
        except json.JSONDecodeError:
            error = e.content

        if error == "Not found: Collection `" + name + "` doesn\'t exist!":
            status = __client.recreate_collection(
                collection_name=name,
                vectors_config=VectorParams(size=__collection_vec_size, distance=__collection_vec_distance),
            )
            return status
        else:
            return error

    except Exception as exception:
        return exception.content

def search(collection, vector, limit):
    result = __client.search(
        collection_name=collection,
        query_vector=vector[0].tolist(),
        limit=3
    )
    return result

def insert_text(collection, payload, text):
    tokens = prepare_text(text)
    idx = 0

    for sentence in tokens:
        vecSentence = vectorize(sentence)

        __client.upsert(
            collection_name=collection,
            points=[
                PointStruct(
                    id=str(uuid.uuid4()),
                    vector=vecSentence[0].tolist(),
                    payload=payload,
                )
            ],
        )
        idx = idx + 1