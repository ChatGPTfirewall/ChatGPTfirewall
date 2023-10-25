
from django.db import IntegrityError
from rest_framework.response import Response
from rest_framework import status
from rest_framework import serializers


from xml.etree import ElementTree as ET
from qdrant_client import QdrantClient, http
from qdrant_client.http.models import Distance, VectorParams
from django.db import models
from pathlib import Path
import sys
import os
import sys
print(sys.path)
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'settings')
import django
django.setup()

class User(models.Model):
    auth0_id = models.CharField(max_length=255, unique=True, null=False)
    username = models.CharField(max_length=255)
    email = models.CharField(max_length=255)
    lang = models.CharField(max_length=2, default='en')       #using ISO 639-1 codes

    def __str__(self):
        return self.auth0_id

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "auth0_id", "username", "email", "lang"]


__client = QdrantClient(
    url=os.getenv("QDRANT_URL"),
    api_key=os.getenv("QDRANT_SECRET"),
)

def createDemoUser(self, request, *args, **kwargs):
        """
        Create a user and his collection.
        """
        data = {
            "auth0_id": "demoUser",
            "username": "demo",
            "email": "demo@demo.demo",
        }
        serializer = UserSerializer(data=data)

        try:
            if serializer.is_valid():
                serializer.save()
                [_, id] = request.data.get("auth0_id").split("|")
                create_collection(id)
                response = Response(serializer.data, status=status.HTTP_201_CREATED)
            else:
                # Handle other validation errors
                response = Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        except IntegrityError as e:
            # Handle the IntegrityError (duplicate key error)
            response = Response(
                {"error": "User with this auth0_id already exists."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        return response

def create_collection(name):
    __client.recreate_collection(
        collection_name=name,
        vectors_config=VectorParams(
            size=__collection_vec_size, distance=__collection_vec_distance
        ),
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