from qdrant_client import QdrantClient, http
from qdrant_client.models import PointStruct
from qdrant_client.http.models import Distance, VectorParams
from .embedding import prepare_text, vectorize
from .serializers import SectionSerializer

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


__collection_vec_size = os.getenv("VEC_SIZE", 512)
__collection_vec_distance = __get_vec_distance()


def get_or_create_collection(name):
    try:
        __client.get_collection(collection_name=name)
        return True
    except http.exceptions.UnexpectedResponse as e:
        try:
            error = json.loads(e.content)["status"]["error"]
        except json.JSONDecodeError:
            error = e.content

        if error == "Not found: Collection `" + name + "` doesn't exist!":
            status = __client.recreate_collection(
                collection_name=name,
                vectors_config=VectorParams(
                    size=__collection_vec_size, distance=__collection_vec_distance
                ),
            )
            return status
        else:
            return error

    except Exception as exception:
        return exception.content


def search(collection_name, vector, limit):
    result = __client.search(
        collection_name=collection_name, query_vector=vector[0].tolist(), limit=3
    )
    return result


def insert_text(collection_name, document):
    tokens = prepare_text(document.text)
    points = []
    for token in tokens:
        content = ''.join(token)
        section = {"document": document.id, "content": content}
        serializer = SectionSerializer(data=section)
        if serializer.is_valid():
            result = serializer.save()
        else:
            return serializer.errors
        

        vector = vectorize(token)
        point = PointStruct(
            id=str(uuid.uuid4()),
            vector=vector[0].tolist(),
            payload={"section_id": result.id},
        )
        points.append(point)
    __insert_points(collection_name, points)
    return True


def __insert_points(collection_name, points):
    __client.upsert(collection_name=collection_name, points=points)
