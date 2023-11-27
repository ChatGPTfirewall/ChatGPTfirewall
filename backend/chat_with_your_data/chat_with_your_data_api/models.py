from django.db import models
from django.db.models import JSONField
from .user_settings import UserSettings


class User(models.Model):
    auth0_id = models.CharField(max_length=255, unique=True, null=False)
    username = models.CharField(max_length=255)
    email = models.CharField(max_length=255)
    lang = models.CharField(max_length=2, default="en")  # using ISO 639-1 codes
    settings = JSONField(default=UserSettings().to_dict)

    def __str__(self):
        return self.auth0_id


class Document(models.Model):
    filename = models.CharField(max_length=255)
    text = models.TextField()
    user = models.ForeignKey(User, on_delete=models.CASCADE, blank=True, null=False)
    lang = models.CharField(max_length=2, default="en")
    fileSize = models.PositiveIntegerField(default=0)

    def __str__(self):
        return self.filename


class Section(models.Model):
    document = models.ForeignKey(
        Document, on_delete=models.CASCADE, blank=True, null=False
    )
    content = models.TextField()
    doc_index = models.IntegerField()

    def __str__(self):
        return self.document.filename
