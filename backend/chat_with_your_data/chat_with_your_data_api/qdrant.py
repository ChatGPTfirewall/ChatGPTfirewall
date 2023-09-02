from qdrant_client import QdrantClient, http
from qdrant_client.http.models import Distance, VectorParams

import os
import json

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
