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

class Room(models.Model):
    userID = models.CharField(max_length=255, null=False)    # owner
    roomID = models.CharField(max_length=255, unique=True, null=False)    # identifier
    roomName = models.CharField(max_length=255, default="Room")
    anonymizeCompleteContext= models.BooleanField('Anonymize Switch', default=True)
    prompt = models.TextField(default="Beantworte die folgende Frage ausschließlich mit folgenden Informationen:")
    # TODO prompt per Room in Settings
    
    def __str__(self):
        return self.userID +" + " + self.roomID

    def appendContext(self, room, role, content):
        myContext = ContextEntry(roomID=room,role=role,content=content)
        myContext.save()

    def createFullMessage(self, room):
        context = ContextEntry.objects.all()

        fullMessage: List[Dict] = []

        systemLine = {"role": "system", "content": room.prompt}
        fullMessage.append(systemLine)

        for line in context:
            messageLine = {"role": line.role, "content": line.content}
            fullMessage.append(messageLine)

        return fullMessage


class ContextEntry(models.Model):
    roomID = models.ForeignKey(Room, on_delete=models.CASCADE)
    role = models.CharField(max_length=255)
    content = models.TextField()

class AnonymizeEntitie(models.Model):
    roomID = models.ForeignKey(Room, on_delete=models.CASCADE)
    anonymized = models.CharField(max_length=255, null=False)
    deanonymized = models.CharField(max_length=255, unique=True, null=False)
    entityType = models.CharField(max_length=255, null=False)


