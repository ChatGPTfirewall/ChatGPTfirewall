import os

from chat_with_your_data_api.file_importer import extract_text
from chat_with_your_data_api.models import Document, Room, RoomDocuments, User
from chat_with_your_data_api.qdrant import create_collection, insert_text
from chat_with_your_data_api.room_settings import RoomSettings
from chat_with_your_data_api.serializers import DocumentSerializer
from django.core.management.base import BaseCommand
from django.db import IntegrityError


class Command(BaseCommand):
    help = "Create demo users and rooms with documents"

    def add_demo_files(self, user):
        root_path = os.path.join("./ExampleFiles", user.lang)
        added_files = []
        document_objects = []

        for dirpath, dirnames, filenames in os.walk(root_path):
            for file_name in filenames:
                file_path = os.path.join(dirpath, file_name)
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
                        document_objects.append(result)
                        [_, id] = user.auth0_id.split("|")
                        insert_text(id, result, user.lang)
                        added_files.append(file_name)
                        self.stdout.write(
                            self.style.SUCCESS(f"Added file: {file_name}")
                        )
                else:
                    self.stdout.write(f"Skipped file: {file_name}")

        return document_objects

    def create_room_with_documents(self, user, document_objects):
        room_name = f"Demo Room ({user.lang.upper()})"

        room_settings = RoomSettings(prompt_template_lang=user.lang)

        room = Room.objects.create(
            user=user, name=room_name, settings=room_settings.to_dict()
        )
        for document in document_objects:
            RoomDocuments.objects.create(room=room, document=document)
        self.stdout.write(
            self.style.SUCCESS(
                f"Created room: {room_name} with {len(document_objects)} documents."
            )
        )

    def create_user(self, auth0_id, username, email, lang):
        try:
            user = User.objects.create(
                auth0_id=auth0_id, username=username, email=email, lang=lang
            )
            [_, id] = auth0_id.split("|")
            create_collection(id)

            document_objects = self.add_demo_files(user)
            self.create_room_with_documents(user, document_objects)

            self.stdout.write(
                self.style.SUCCESS(
                    f"Successfully created user: {username} with language: {lang}"
                )
            )

        except IntegrityError:
            self.stdout.write(
                self.style.WARNING(
                    f"User with auth0_id {auth0_id} already exists: {username}"
                )
            )

    def handle(self, *args, **kwargs):
        self.create_user("auth0|demo_user_de", "demo_de", "demo@demo.de", "de")
        self.create_user("auth0|demo_user_en", "demo_en", "demo@demo.com", "en")
