from django.shortcuts import render

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework import permissions
from .models import User, Section
from .serializers import UserSerializer, DocumentSerializer
from pathlib import Path
import os
from .file_importer import extract_text, save_file
from .qdrant import get_or_create_collection, insert_text, search
from .embedding import prepare_text, vectorize
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

            # Insert text into postgres db
            serializer = DocumentSerializer(data=document)
            
            if serializer.is_valid():
                result = serializer.save()
                documents.append(serializer.data)
            else:
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            
            # Insert text into qdrant db
            [_, id] = user.auth0_id.split("|")
            qdrant_result= insert_text(id, result)
            if qdrant_result == True:
                return Response(documents, status=status.HTTP_201_CREATED)
            else:
                return Response(qdrant_result, status=status.HTTP_400_BAD_REQUEST)

    
class CollectionApiView(APIView):

    def post(self, request, *args, **kwargs):
        '''
        Create collection in vector database.
        '''
        [_, id] = request.data.get('user_auth0_id').split("|")

        collection = get_or_create_collection(id)
        if collection == True:
            return Response(status=status.HTTP_201_CREATED)
        return Response(collection, status=status.HTTP_400_BAD_REQUEST)
    
class ChatApiView(APIView):

    def post(self, request,  *args, **kwargs):
        '''
        Convert user question into qdrant db.
        '''

        question = request.data.get('question')
        [_, id] = request.data.get('user_auth0_id').split("|")

        # tokenize text
        prepared_text = prepare_text(question)
        # vectorize tokens
        vector = vectorize(prepared_text)
        # similarity search
        try: 
            facts = search(id, vector, 3)
        except Exception as exception:
            return Response(exception.content, status.HTTP_400_BAD_REQUEST)
        
        response = []
        for fact in facts:
            section = Section.objects.get(id=fact.payload.get("section_id"))
            fact = {
                "answer": section.content,
                "file": section.document.filename,
                "score": fact.score,
                "full_text":section.document.text
            }
            response.append(fact)

        return Response({"facts": response}, status.HTTP_200_OK)
       