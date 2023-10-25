
from django.db import IntegrityError
from rest_framework.response import Response
from rest_framework import status
import os

from serializers import UserSerializer, DocumentSerializer, ReadDocumentSerializer

from qdrant import create_collection, insert_text, search, delete_text
from xml.etree import ElementTree as ET

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'chat_with_your_data.settings')

def createDemoUser():
        """
        Create a user and his collection.
        """
        os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'chat_with_your_data.settings')
        data = {
            "auth0_id": "demoUser",
            "username": "demo",
            "email": "demo@demo.demo",
        }
        serializer = UserSerializer(data=data)

        try:
            if serializer.is_valid():
                serializer.save()
                [_, id] = data.get("auth0_id").split("|")
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

createDemoUser()