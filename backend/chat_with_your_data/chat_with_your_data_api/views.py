import os

from django.shortcuts import render, redirect
from django.db import IntegrityError
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.http import HttpResponseNotFound, HttpResponse
from pathlib import Path
import requests
import mimetypes

from .models import User, Section, Document
from .serializers import UserSerializer, DocumentSerializer, ReadDocumentSerializer
from .file_importer import extract_text, save_file
from .qdrant import create_collection, insert_text, search, delete_text
from .embedding import return_ents, vectorize
from .llm import count_tokens, run_llm, get_template, set_template
from xml.etree import ElementTree as ET

MAX_TOKENS = 4098


def download_file(request, filename):
    # Define the path to the directory where your files are stored
    files_path = "./ExampleFiles/JuraStudium"
    # Construct the full file path
    file_path = os.path.join(files_path, filename)

    # Check if the file exists
    if os.path.exists(file_path):
        # Determine the content type based on the file extension
        content_type, _ = mimetypes.guess_type(filename)

        # Open the file with appropriate headers for download
        with open(file_path, "rb") as file:
            response = HttpResponse(file, content_type=content_type)
            response["Content-Disposition"] = f'attachment; filename="{filename}"'
            return response
    else:
        # Return a 404 Not Found response if the file doesn't exist
        return HttpResponseNotFound("File not found")


class UserApiView(APIView):
    def post(self, request, *args, **kwargs):
        """
        Create a user and his collection.
        """
        data = {
            "auth0_id": request.data.get("auth0_id"),
            "username": request.data.get("username"),
            "email": request.data.get("email"),
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
        UserApiView.putFilesDemoUser(
            request.data.get("auth0_id"), request.data.get("email")
        )
  
        return response

    def putFilesDemoUser(auth0, email):
        if email == "demo@demo.demo":
            user = User.objects.get(auth0_id=auth0)
            files_path = "./ExampleFiles/JuraStudium"
            file_names = os.listdir(files_path)

            for file_name in file_names:
                file_path = os.path.join(files_path, file_name)
                file_size = os.path.getsize(file_path)

                text = extract_text(file_path, file_name)

                existing_document = Document.objects.filter(
                    filename=file_name, user=user
                ).first()

                if existing_document is None:
                    document = {
                        "filename": file_name,
                        "text": text,
                        "user": user.id,
                        "lang": user.lang,
                        "fileSize": file_size,
                    }
                    serializer = DocumentSerializer(data=document)

                    if serializer.is_valid():
                        result = serializer.save()
                        # Insert text into qdrant db
                        [_, id] = user.auth0_id.split("|")
                        insert_text(id, result, user.lang)
                else:
                    # Check if the document is already in the database
                    pass

class DemoPageAPI(APIView):
    def get(self, request, *args, **kwargs):
        return Response("", status=status.HTTP_200_OK)


class UploadApiView(APIView):
    def post(self, request, *args, **kwargs):
        """
        Upload files.
        """
        auth0_id = request.POST.get("user")
        user = User.objects.get(auth0_id=auth0_id)
        files = request.FILES.getlist("files")

        documents = []
        Path("../temp").mkdir(parents=True, exist_ok=True)

        success = True

        for file in files:
            file_size = file.size
            # Save file temporary
            temp_file_path = save_file("../temp", file)

            # Extract the text from the file
            text = extract_text(temp_file_path, file.name)

            # Delete saved file
            os.remove(temp_file_path)

            document = {
                "filename": file.name,
                "text": text,
                "user": user.id,
                "lang": user.lang,
                "fileSize": file_size,
            }

            # Insert text into postgres db
            serializer = DocumentSerializer(data=document)

            if serializer.is_valid():
                result = serializer.save()
                documents.append(serializer.data)
            else:
                success = False
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

            # Insert text into qdrant db
            [_, id] = user.auth0_id.split("|")
            qdrant_result = insert_text(id, result, user.lang)
            if qdrant_result != True:
                success = False

        if success:
            return Response(documents, status=status.HTTP_201_CREATED)
        else:
            return Response("File upload failed", status=status.HTTP_400_BAD_REQUEST)


class DocumentApiView(APIView):
    def post(self, request, *args, **kwargs):
        auth0_id = request.data.get("auth0_id")
        user = User.objects.get(auth0_id=auth0_id)

        documents = Document.objects.filter(user_id=user.id)

        serializer = ReadDocumentSerializer(documents, many=True)

        return Response(serializer.data, status=status.HTTP_201_CREATED)

    def delete(self, request, *args, **kwargs):
        documents = request.data.get("documents", [])
        document_ids = []

        for document in documents:
            document_ids.append(document["id"])
            user = document["user"]
            [_, id] = user["auth0_id"].split("|")
            delete_text(id, document)
        Document.objects.filter(id__in=document_ids).delete()
        return Response("", status=status.HTTP_200_OK)


class ChatApiView(APIView):
    def post(self, request, *args, **kwargs):
        """
        Convert user question into qdrant db.
        """
        question = request.data.get("question")
        [_, id] = request.data.get("user_auth0_id").split("|")
        auth0 = request.data.get("user_auth0_id")
        user = User.objects.get(auth0_id=auth0)
        # tokenize text
        # prepared_text = prepare_text(question, user.lang)
        # vectorize tokens
        vector = vectorize(question)
        # similarity search
        try:
            search_result = search(id, vector, 3)
        except Exception as exception:
            return Response(exception.content, status.HTTP_400_BAD_REQUEST)
        facts = []
        for fact in search_result:
            section = Section.objects.get(id=fact.payload.get("section_id"))
            ents = return_ents(section.document.text, user.lang)
            entities = []
            for ent in ents:
                entities.append([ent.text, ent.start_char, ent.end_char, ent.label_])
            fact = {
                "answer": section.content,
                "file": section.document.filename,
                "score": fact.score,
                "full_text": section.document.text,
                "entities": entities,
            }
            facts.append(fact)

        response = {"facts": facts, "prompt_template": get_template()}

        return Response(response, status.HTTP_200_OK)


class ContextApiView(APIView):
    def post(self, request, *args, **kwargs):
        """
        Send context to chatgpt.
        """
        question = request.data.get("question")
        context = request.data.get("context")
        template = request.data.get("template")

        tokens = count_tokens(question, context)

        if tokens < MAX_TOKENS:
            set_template(template)
            answer = run_llm({"context": context, "question": question})
        else:
            answer = "Uh, die Frage war zu lang!"
        return Response({"result": answer}, status.HTTP_200_OK)


class NextCloudApiView(APIView):
    def get(self, request, *args, **kwargs):
        """
        Creates a connection to an nextcloud instance.
        """
        session = request.session
        nextcloud_user = request.GET.get("nextCloudUserName")
        nextcloud_client_id = request.GET.get("clientId")
        nextcloud_client_secret = request.GET.get("clientSecret")
        nextcloud_authorization_url = request.GET.get("authorizationUrl")
        redirect_uri = request.GET.get("redirectUri")

        FILES_URL = (
            f"{nextcloud_authorization_url}/remote.php/dav/files/{nextcloud_user}/"
        )
        TOKEN_URL = f"{nextcloud_authorization_url}/index.php/apps/oauth2/api/v1/token"
        AUTHORIZATION_URL = (
            f"{nextcloud_authorization_url}/index.php/apps/oauth2/authorize"
        )

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


class NextCloudFilesApiView(APIView):
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
        response = requests.post(TOKEN_URL, data=payload)
        access_token = response.json().get("access_token")
        if access_token:
            headers = {"Authorization": f"Bearer {access_token}"}
            response = requests.request("PROPFIND", FILES_URL, headers=headers)

            if response.status_code != 207:
                return "Fehler beim Abrufen der Dateien", 500

            root = ET.fromstring(response.content)
            files = [
                elem.text
                for elem in root.findall(".//{DAV:}href")
                if elem.text[-1] != "/"
            ]

        text_content = ""
        for file in files:
            filename = file.split("/")[-1]  # Dateiname aus der URL extrahieren
            file_ext = os.path.splitext(filename)[1].lower()

            download_url = f"{nextcloud_authorization_url}{file}"
            temp_file_path = os.path.join("../", "temp", filename)

            # Datei manuell herunterladen
            response = requests.get(
                download_url, headers={"Authorization": f"Bearer {access_token}"}
            )
            with open(temp_file_path, "wb") as f:
                f.write(response.content)

        return Response(
            f"""
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
        )


class LanguageAPI(APIView):
    def get(self, request, *args, **kwargs):
        try:
            auth0_id = request.GET["auth0_id"]
            user = User.objects.get(auth0_id=auth0_id)
            return Response(user.lang, status.HTTP_200_OK)
        except:
            return Response("Error!", status.HTTP_500_INTERNAL_SERVER_ERROR)

    def post(self, request, *args, **kwargs):
        try:
            lang = request.data.get("language")
            auth0 = request.data.get("auth0_id")
            user = User.objects.get(auth0_id=auth0)
            user.lang = lang["key"]
            user.save()

            return Response(user.lang, status=status.HTTP_200_OK)
        except User.DoesNotExist:
            return Response("User not found", status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response(str(e), status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class FilesApiView(APIView):
    def post(self, request, *args, **kwargs):
        auth0_id = request.data["auth0_id"]
        user = User.objects.get(auth0_id=auth0_id)
        [_, id] = auth0_id.split("|")
        create_collection(id)

        documents = Document.objects.filter(user=user)
        success = True
        for document in documents:
            Section.objects.filter(document=document).delete()

            qdrant_result = insert_text(id, document, document.lang)
            if qdrant_result != True:
                success = False

        if success:
            return Response([], status=status.HTTP_200_OK)
        else:
            return Response("File upload failed", status=status.HTTP_400_BAD_REQUEST)
