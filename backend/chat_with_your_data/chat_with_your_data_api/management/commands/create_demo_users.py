from django.core.management.base import BaseCommand
from chat_with_your_data_api.models import User, Document
from django.db import IntegrityError
from chat_with_your_data_api.serializers import UserSerializer, DocumentSerializer
from chat_with_your_data_api.file_importer import extract_text
from chat_with_your_data_api.qdrant import create_collection, insert_text
import os

class Command(BaseCommand):
    help = 'Create demo users'

    def add_demo_files(self, user):
        root_path = os.path.join("./ExampleFiles", user.lang)

        for dirpath, dirnames, filenames in os.walk(root_path):
            for file_name in filenames:
                file_path = os.path.join(dirpath, file_name)
                file_size = os.path.getsize(file_path)

                text = extract_text(file_path, file_name)

                existing_document = Document.objects.filter(filename=file_name, user=user).first()

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
                        [_, id] = user.auth0_id.split("|")
                        insert_text(id, result, user.lang)

    def create_user(self, auth0_id, username, email, lang):
        try:
            user = User.objects.create(
                auth0_id=auth0_id,
                username=username,
                email=email,
                lang=lang
            )

            [_, id] = auth0_id.split("|")
            create_collection(id)

            # Add files for demo users
            if email == "demo@demo.de" or email == "demo@demo.com":
                self.add_demo_files(user)

            self.stdout.write(self.style.SUCCESS(f'Successfully created user: {user.username} with language: {lang}'))

        except IntegrityError:
            self.stdout.write(self.style.WARNING(f'User with auth0_id {auth0_id} already exists: {username}'))

    def handle(self, *args, **kwargs):
        # Create demo 'de' user
        self.create_user("auth0|demo_user_de", "demo_de", "demo@demo.de", "de")

        # Create demo 'en' user
        self.create_user("auth0|demo_user_en", "demo_en", "demo@demo.com", "en")
