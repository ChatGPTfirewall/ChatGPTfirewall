from django.core.management.base import BaseCommand
from chat_with_your_data_api.models import User, Document
from chat_with_your_data_api.qdrant import delete_text, delete_collection

class Command(BaseCommand):
    help = 'Deletes demo users and their documents, sections, and collections'

    def handle(self, *args, **options):
        demo_users = User.objects.filter(email__in=['demo@demo.de', 'demo@demo.com'])

        for user in demo_users:
            documents = Document.objects.filter(user=user)
            document_ids = []

            for document in documents:
                document_ids.append(document.id)
                [_, id] = user.auth0_id.split("|")
                formatted_document = {
                    "id": document.id,
                    "user": {
                        "auth0_id": user.auth0_id,
                    },
                }
                delete_text(id, formatted_document)

            Document.objects.filter(id__in=document_ids).delete()

            [_, id] = user.auth0_id.split("|")
            delete_collection(id)

            user.delete()

            self.stdout.write(self.style.SUCCESS(f'Successfully deleted user: {user.username}'))