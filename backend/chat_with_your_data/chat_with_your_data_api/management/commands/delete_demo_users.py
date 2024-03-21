from chat_with_your_data_api.models import Document, Room, RoomDocuments, User
from chat_with_your_data_api.qdrant import delete_collection, delete_text
from django.core.management.base import BaseCommand


class Command(BaseCommand):
    help = "Deletes demo users and their documents, sections, collections, rooms, and room documents"

    def handle(self, *args, **options):
        demo_users = User.objects.filter(email__in=["demo@demo.de", "demo@demo.com"])

        for user in demo_users:
            documents = Document.objects.filter(user=user)
            document_ids = []

            rooms = Room.objects.filter(user=user)
            for room in rooms:
                room_documents = RoomDocuments.objects.filter(room=room)
                room_documents.delete()
                room.delete()

            for document in documents:
                document_ids.append(document.id)
                [_, id] = user.auth0_id.split("|")
                delete_text(id, document)

            Document.objects.filter(id__in=document_ids).delete()

            [_, id] = user.auth0_id.split("|")
            delete_collection(id)

            user.delete()

            self.stdout.write(
                self.style.SUCCESS(
                    f"Successfully deleted user: {user.username} and associated rooms and documents"
                )
            )
