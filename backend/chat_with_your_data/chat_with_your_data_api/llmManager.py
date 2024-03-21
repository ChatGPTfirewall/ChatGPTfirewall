# Import the openai package
import os
import uuid
from pprint import pprint

import openai

from .models import AnonymizeEntitie, ContextEntry, Room, RoomSettings, User

# Set openai.api_key to the OPENAI environment variable
openai.api_key = os.getenv("OPEN_AI_KEY")


class ContextEntry:
    """represents one context line in the form:
    "role": Message role, "content": Message content
    """

    def __init__(self, role, content):
        self.role = role
        self.content = content


class Room_:
    """room class holds the context and anonymization data
    atm just saves the data in memory.
    TODO
        implement persistent memory (db)
    """

    def __init__(self, userID):
        self.userID: str = userID  # owner
        self.anonymizeCompleteContext: bool = False
        self.anonymizeMap: List[Dict] = []
        self.context: List[ContextEntry] = []

    def appendContext(self, role, content):
        self.context.append(ContextEntry(role, content))

    def createFullMessage(self, question):
        tempMessage: List[Dict] = []

        for line in self.context:
            messageLine = {"role": line.role, "content": line.content}
            tempMessage.append(messageLine)

        tempMessage.append({"role": "user", "content": question})

        return tempMessage


class LLM:
    def __init__(self, apiKey):
        self.apiKey = apiKey
        openai.api_key = self.apiKey

    def run(self, room: Room, question: str, is_demo: bool = False):

        room.appendContext(room, "user", question, is_demo)

        # pprint(room.createFullMessage(room, False, is_demo, question))

        response = openai.ChatCompletion.create(
            model="gpt-3.5-turbo",
            messages=room.createFullMessage(room, False, is_demo, question),
        )

        response = response["choices"][0]["message"]["content"]

        room.appendContext(room, "assistant", response, is_demo)
        return response


class llmManager:
    def __init__(self, llm):
        self.llm: LLM = llm

    def addRoom(self, user_, name_):
        room_settings = RoomSettings(prompt_template_lang=user_.lang)
        new_room = Room(user=user_, name=name_, settings=room_settings.to_dict())
        new_room.save()

        return new_room

    def getRoom(self, auth0_id, room_id):
        try:
            user = User.objects.get(auth0_id=auth0_id)
            myRoom = Room.objects.get(user=user, id=room_id)
            return myRoom
        except (User.DoesNotExist, Room.DoesNotExist):
            return None
