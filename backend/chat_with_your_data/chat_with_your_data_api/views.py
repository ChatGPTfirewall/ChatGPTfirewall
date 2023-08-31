from django.shortcuts import render

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework import permissions
from .models import User
from .serializers import UserSerializer, DocumentSerializer
from pathlib import Path
import os
from .file_importer import extract_text, save_file
class UserApiView(APIView):

    # # 1. List all
    # def get(self, request, *args, **kwargs):
    #     '''
    #     List all the todo items for given requested user
    #     '''
    #     todos = Todo.objects.filter(user = request.user.id)
    #     serializer = TodoSerializer(todos, many=True)
    #     return Response(serializer.data, status=status.HTTP_200_OK)

    # 2. Create
    def post(self, request, *args, **kwargs):
        '''
        Create a user.
        '''
        data = {
            'auth0_id': request.data.get('auth0_id'), 
            'username': request.data.get('username'), 
            'email': request.data.get('email')
        }
        serializer = UserSerializer(data=data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class FileApiView(APIView):

    def post(self, request, *args, **kwargs):
        '''
        Upload files.
        '''
        auth0_id = request.POST.get('user')
        user = User.objects.get(auth0_id=auth0_id)
        files = request.FILES.getlist('files')
        documents = []
        Path("../temp").mkdir(parents=True, exist_ok=True)
        
        for file in files:
            # Save file temporary
            temp_file_path = save_file("../temp", file)
            
            # Extract the text from the file
            text = extract_text(temp_file_path, file)
            
            # Delete saved file
            os.remove(temp_file_path)

            document = {
                'filename': file.name,
                'text': text,
                'user': user.id
            }

            serializer = DocumentSerializer(data=document)

            if serializer.is_valid():
                serializer.save()
                documents.append(serializer.data)
            else:
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        return Response(documents, status=status.HTTP_201_CREATED)