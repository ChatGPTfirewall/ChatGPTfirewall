import os

from django.shortcuts import render, redirect
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from pathlib import Path

from .models import User, Section, Document
from .serializers import UserSerializer, DocumentSerializer, ReadDocumentSerializer
from .file_importer import extract_text, save_file
from .qdrant import get_or_create_collection, insert_text, search
from .embedding import prepare_text, vectorize
from .llm import count_tokens, run_llm
from .nextcloud import get_access_token, get_files, download_file
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

class UploadApiView(APIView):

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
                'user': user.id,
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
            
class DocumentApiView(APIView):

    def post(self, request, *args, **kwargs):
        auth0_id = request.data.get('auth0_id')
        user = User.objects.get(auth0_id=auth0_id)

        documents = Document.objects.filter(user_id=user.id)

        serializer = ReadDocumentSerializer(documents, many=True)
        
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    def delete(self, request, *args, **kwargs):
        document_data = request.data.get('documents', [])
        document_ids = [doc['id'] for doc in document_data]

        Document.objects.filter(id__in=document_ids).delete()
        return Response(status=status.HTTP_200_OK)
        
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
    
class ContextApiView(APIView):

    def post(self, request, *args, **kwargs):
        '''
        Send context to chatgpt.
        '''
        question = request.data.get('question')
        contexts = request.data.get('contexts')
        content = ""
        for context in contexts:
            content = content + context["file"] + "\n"
            content = content + context["editedText"] + "\n\n"

        tokens = count_tokens(question, content)

        # max 4097 tokens!

        if tokens < 4098:
            answer = run_llm({"context": content, "question": question})
        else:
            answer = "Uh, die Frage war zu lang!"
        return Response({"result": answer}, status.HTTP_200_OK)
    
class NextCloudApiView(APIView):

    def post(self, request, *args, **kwargs):
        '''
        Creates a connection to an nextcloud instance.
        '''
        session = request.session
        nextcloud_user = request.data.get("nextCloudUserName")
        nextcloud_client_id = request.data.get("clientId")
        nextcloud_client_secret = request.data.get("clientSecret")
        nextcloud_authorization_url = request.data.get("authorizationUrl")
        redirect_uri = request.data.get("redirectUri")

        FILES_URL = f"{nextcloud_authorization_url}/remote.php/dav/files/{nextcloud_user}/"
        TOKEN_URL = f"{nextcloud_authorization_url}/index.php/apps/oauth2/api/v1/token"
        AUTHORIZATION_URL = f"{nextcloud_authorization_url}/index.php/apps/oauth2/authorize"

        data = {
        "client_id": nextcloud_client_id,
        "redirect_uri": redirect_uri,
        "response_type": "code",
        "scope": "read",
        }
        
        session["clientSecret"] = nextcloud_client_secret  
        session["authorizationUrl"] = nextcloud_authorization_url 
        session["clientId"] = nextcloud_client_id  
        session["nextcloudUser"] = nextcloud_user  
        session["token_url"] = TOKEN_URL  
        session["files_url"] = FILES_URL  
        session["redirect_uri"] = redirect_uri  
        
        url = (
        AUTHORIZATION_URL
        + "?"
        + "&".join([f"{key}={value}" for key, value in data.items()])
        )
        return redirect(url)
    
    def get(self, request, *args, **kwargs):
        session = request.session
        code = request.GET.get("code")
        nextcloud_authorization_url = session.get("authorizationUrl")
        nextcloud_client_secret = session.get("clientSecret")
        nextcloud_client_id = session.get("clientId")
        nextcloud_user = session.get("nextcloudUser")
        TOKEN_URL = session.get("token_url")
        FILES_URL = session.get("files_url")
        REDIRECT_URI = session.get("redirect_uri")

        Path("temp").mkdir(parents=True, exist_ok=True)

        payload = {
            "grant_type": "authorization_code",
            "code": code,
            "redirect_uri": REDIRECT_URI,
            "client_id": nextcloud_client_id,
            "client_secret": nextcloud_client_secret,
        }

        access_token = get_access_token(TOKEN_URL, payload)

        files = get_files(access_token, FILES_URL)

        text_content = ""
        for file in files:
            filename = file.split("/")[-1]  # Dateiname aus der URL extrahieren
            temp_file_path = save_file("../temp", filename)

            downloaded_file = download_file(access_token, nextcloud_authorization_url, file)
            with open(temp_file_path, "wb") as f:
                f.write(downloaded_file.content)

            text = extract_text(temp_file_path, file)

            # Text zur Textinhalt hinzufügen
            text_content += f"<h3>{filename}</h3><pre>{text}</pre>"

            # Temporäre Datei löschen
            os.remove(temp_file_path)

        return f"""
            <!DOCTYPE html>
            <html>
            <head>
                <title>Nextcloud File Explorer</title>
            </head>
            <body>
                <h1>Nextcloud File Explorer</h1>
                {text_content}
            </body>
            </html>
        """


