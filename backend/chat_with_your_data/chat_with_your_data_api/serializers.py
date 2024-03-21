from rest_framework import serializers

from .models import (AnonymizeEntitie, ContextEntry, Document, Room,
                     RoomDocuments, Section, User)


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "auth0_id", "username", "email", "lang", "max_api_calls"]


class DocumentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Document
        fields = ["id", "filename", "text", "user", "fileSize", "lang"]


class ReadDocumentSerializer(serializers.ModelSerializer):
    user = UserSerializer()

    class Meta:
        model = Document
        fields = ["id", "filename", "user", "fileSize", "lang"]


class SectionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Section
        fields = ["document", "content", "doc_index"]


class ContextEntrySerializer(serializers.ModelSerializer):
    class Meta:
        model = ContextEntry
        fields = ["id", "role", "content", "created_at"]


class AnonymizationMappingSerializer(serializers.ModelSerializer):
    class Meta:
        model = AnonymizeEntitie
        fields = ["roomID", "anonymized", "deanonymized", "entityType"]


class RoomDocumentSerializer(serializers.ModelSerializer):
    document = DocumentSerializer(read_only=True)

    class Meta:
        model = RoomDocuments
        fields = ["document"]


class RoomSettingsSerializer(serializers.Serializer):
    templates = serializers.DictField(child=serializers.CharField())
    prompt_template = serializers.CharField(allow_blank=True)
    pre_phrase_count = serializers.IntegerField(min_value=0, max_value=8, default=2)
    post_phrase_count = serializers.IntegerField(min_value=0, max_value=8, default=2)


class RoomSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    messages = ContextEntrySerializer(
        source="contextentry_set", many=True, read_only=True
    )
    files = serializers.SerializerMethodField()
    anonymizationMappings = AnonymizationMappingSerializer(
        source="anonymizeentitie_set", many=True, read_only=True
    )
    settings = serializers.JSONField()

    class Meta:
        model = Room
        fields = [
            "id",
            "user",
            "name",
            "anonymizeCompleteContext",
            "messages",
            "files",
            "created_at",
            "settings",
            "anonymizationMappings",
        ]

    def get_files(self, obj):
        room_documents = RoomDocuments.objects.filter(room=obj)
        documents = [rd.document for rd in room_documents]
        return DocumentSerializer(documents, many=True).data

    def update(self, instance, validated_data):
        instance.name = validated_data.get("name", instance.name)
        instance.anonymizeCompleteContext = validated_data.get(
            "anonymizeCompleteContext", instance.anonymizeCompleteContext
        )
        if "settings" in validated_data:
            instance.settings = validated_data.get("settings", instance.settings)
        instance.save()
        return instance
