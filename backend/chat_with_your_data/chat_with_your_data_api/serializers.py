from rest_framework import serializers
from .models import User, Document, Section
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "auth0_id", "username", "email", "lang"]

class DocumentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Document
        fields = ["filename", "text", "user", "fileSize"]

class ReadDocumentSerializer(serializers.ModelSerializer):
    user = UserSerializer()
    class Meta:
        model = Document
        fields = ["id", "filename", "user", "fileSize"]

class SectionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Section
        fields = ["document", "content", "doc_index"]