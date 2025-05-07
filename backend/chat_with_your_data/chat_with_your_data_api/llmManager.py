# Import the openai package
import os
from duckduckgo_search import DDGS

import openai

from .models import ContextEntry, Room, RoomSettings, User

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

    def perform_web_search(self, query, num_results=3):
        try:
            with DDGS() as ddgs:
                search_results = list(ddgs.text(query, max_results=num_results))
            formatted_results = "\n".join([
                f"- {result['title']}: {result['body']}"
                for result in search_results
            ])
            return formatted_results
        except Exception as e:
            print(f"Error: {str(e)}")
            return 

    def run(self, room: Room, question: str, model: str, search_mode: str = "document", is_demo: bool = False, user: User = None):
        """
        Run a chat request to the selected OpenAI model.
        :param room: Room object containing chat context.
        :param question: The user's question.
        :param model: The OpenAI model to use ("gpt-3.5-turbo", "gpt-4o", "gpt-4o-mini").
        :param search_mode: The search mode to use.
        :param is_demo: Flag to indicate if it's a demo mode.
        :param user: The user object.
        :return: The assistant's response.
        """
        # Ensure the selected model is valid and not injected by malicious users
        valid_models = ["gpt-3.5-turbo", "gpt-4o", "gpt-4o-mini"]
        systemSearchTemplateEN = "You are a helpful assistant that can provide up-to-date information based on web search results. Please analyze the search results and provide a comprehensive answer."
        systemSearchTemplateDE = "Sie sind ein hilfreicher Assistent, der auf dem neuesten Stand der Informationen basierend auf den Suchergebnissen im Web ist. Bitte analysieren Sie die Suchergebnisse und geben Sie eine umfassende Antwort."
        
        if model not in valid_models:
            raise ValueError(f"Invalid model '{model}'. Choose from {valid_models}")

        room.appendContext(room, "user", question, is_demo)

        # if user is not defined/none or does not have a language, throw error and return
        if user is None or not user.lang:
            raise ValueError("User language is not defined")
        

        if search_mode == "web":
           
            search_results = self.perform_web_search(question)


            userSearchTemplateEN = f"Based on the following search results, answer the question:\n\nQuestion: {question}\n\nSearch Results:\n{search_results}"
            userSearchTemplateDE = f"Basierend auf den folgenden Suchergebnissen beantworten Sie die Frage:\n\nFrage: {question}\n\nSuchergebnisse:\n{search_results}"

            
            messages = [
                {
                    "role": "system",
                    "content": systemSearchTemplateDE if user.lang == "de" else systemSearchTemplateEN
                },
                {
                    "role": "user",
                    "content": userSearchTemplateDE if user.lang == "de" else userSearchTemplateEN
                }
            ]
        else:
            messages = room.createFullMessage(room, False, is_demo, question)

        response = openai.ChatCompletion.create(
            model=model,
            messages=messages,
        )
        response_content = response["choices"][0]["message"]["content"]

        if not response_content:
            response_content = "I apologize, I cannot generate an appropriate response. Please try rephrasing your question."

        # Add the response to context
        room.appendContext(room, "assistant", response_content, is_demo)
        return response_content



class llmManager:
    def __init__(self, llm):
        self.llm: LLM = llm

    def addRoom(self, user_, name_):
        if user_.lang == "de":
            room_settings = RoomSettings(prompt_template_lang="de")
        else:
            room_settings = RoomSettings(prompt_template_lang="en")
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
