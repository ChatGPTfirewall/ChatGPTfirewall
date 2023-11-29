from rest_framework import serializers
from .models import User, Document, Section
from .user_settings import UserSettings


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "auth0_id", "username", "email", "lang", "settings"]


class DocumentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Document
        fields = ["filename", "text", "user", "fileSize", "lang"]


class ReadDocumentSerializer(serializers.ModelSerializer):
    user = UserSerializer()

    class Meta:
        model = Document
        fields = ["id", "filename", "user", "fileSize", "lang"]


class SectionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Section
        fields = ["document", "content", "doc_index"]


class UserSettingsSerializer(serializers.Serializer):
    prompt_template = serializers.CharField(allow_blank=True, default="")
    pre_phrase_count = serializers.IntegerField(min_value=0, max_value=8, default=2)
    post_phrase_count = serializers.IntegerField(min_value=0, max_value=8, default=2)
    fact_count = serializers.IntegerField(min_value=1, max_value=5, default=3)

    def create(self, validated_data):
        return UserSettings(**validated_data)

    def update(self, instance, validated_data):
        instance.prompt_template = validated_data.get(
            "prompt_template", instance.prompt_template
        )
        instance.pre_phrase_count = validated_data.get(
            "pre_phrase_count", instance.pre_phrase_count
        )
        instance.post_phrase_count = validated_data.get(
            "post_phrase_count", instance.post_phrase_count
        )
        instance.fact_count = validated_data.get("fact_count", instance.fact_count)
        return instance
