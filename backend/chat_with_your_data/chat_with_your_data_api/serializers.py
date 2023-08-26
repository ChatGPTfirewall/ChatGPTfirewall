from rest_framework import serializers
from .models import User, Document
class ChatWithYourDataSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["auth0_id", "username", "email"]