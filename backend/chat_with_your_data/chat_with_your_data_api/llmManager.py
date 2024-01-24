# Import the openai package
import openai
from pprint import pprint 
from .models import Room, ContextEntry, AnonymizeEntitie
import uuid;

# Set openai.api_key to the OPENAI environment variable
openai.api_key = "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"

class ContextEntry:
    """ represents one context line in the form:
        "role": Message role, "content": Message content
    """
    def __init__(self, role, content):
            self.role = role
            self.content = content

class Room_:
    """ room class holds the context and anonymization data 
        atm just saves the data in memory. 
        TODO
            implement persistent memory (db)
    """
    def __init__(self, userID, roomID):
        self.userID: str = userID    # owner
        self.roomID: str = roomID    # identifier
        self.anonymizeCompleteContext: bool = False
        self.anonymizeMap: List[Dict] = []
        self.context: List[ContextEntry] = []

    def appendContext(self,role, content):
        self.context.append(ContextEntry(role, content))

    def createFullMessage(self,question):
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

    def run(self, room: Room, context: str, question: str):
        
        room.appendContext(room, "user", context + "; Frage: " + question)
       

        print(room.createFullMessage(room))
        response = openai.ChatCompletion.create(
                model="gpt-3.5-turbo",
                messages=room.createFullMessage(room)
                )

        room.appendContext(room, "assistant", response["choices"][0]["message"]["content"])
        return response

class llmManager:
    def __init__(self, llm):
        self.llm: LLM = llm

    def addRoom(self, userID_, roomName_):
        #self.roomList[room.roomID] = room
        roomID = uuid.uuid4()
        myRoom = Room(userID = userID_, roomID = roomID, roomName = roomName_ )
        myRoom.save()

    def getRoom(self, userID, roomID):
        myRoom = Room.objects.filter(
            userID=userID,
            roomID=roomID
        )
        return myRoom