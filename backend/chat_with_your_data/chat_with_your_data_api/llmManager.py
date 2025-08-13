import os
from duckduckgo_search import DDGS

from openai import OpenAI  

from .models import ContextEntry, Room, RoomSettings, User

from .embedding import embed_text
from collections import defaultdict

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
    SUPPORTED_ENTITY_TYPES = ("CARDINAL", "DATE", "EVENT", "FAC", "GPE", "LANGUAGE", "LAW", "LOC", "MONEY", "NORP", "ORDINAL", "ORG", "PERCENT", "PERSON", "PRODUCT", "QUANTITY", "TIME", "WORK_OF_ART", "PER", "MISC")
    def __init__(self, apiKey):
        self.apiKey = apiKey
        self.client = OpenAI(api_key=apiKey)

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
            return ''

    def system_search_tpl(self, lang: str, anonymized: bool) -> str:
        """
        Returns a system search template string based on language and anonymization setting.

        :param lang: Language code (e.g., "en", "de", "fr").
        :param anonymized: Whether the template should use anonymized placeholders.
        :return: The template string.
        """
        templates = {
            ("en", True): """
                You are a helpful assistant that can provide up-to-date information based on web search results.

                The question and any related text may contain anonymized placeholders such as PERSON_1, ORG_1, GPE_2, etc.
                These placeholders represent named entities (people, organizations, locations, dates, money amounts) that were replaced to protect privacy.
                
                IMPORTANT:
                - Always keep the placeholders exactly as they appear in the input.
                - Do not attempt to guess, replace, or expand placeholders with real names.
                - If you need to refer to the same entity multiple times, always use the same placeholder from the input text.
                - Do not introduce new placeholder formats.
            """,
            ("en", False): """
                "You are a helpful assistant that can provide up-to-date information based on web search results. 
                Please analyze the search results and provide a comprehensive answer."
            """,
            ("de", True): """
                Sie sind ein hilfreicher Assistent, der aktuelle Informationen basierend auf Websuchergebnissen bereitstellen kann.

                Die Frage und der zugehörige Text können anonymisierte Platzhalter wie PERSON_1, ORG_1, GPE_2 usw. enthalten.
                Diese Platzhalter stellen benannte Entitäten (Personen, Organisationen, Orte, Daten, Geldbeträge) dar, die zum Schutz der Privatsphäre ersetzt wurden.
                
                WICHTIG:
                - Behalten Sie die Platzhalter immer genau so bei, wie sie in der Eingabe erscheinen.
                - Versuchen Sie nicht, Platzhalter durch echte Namen zu erraten, zu ersetzen oder zu erweitern.
                - Wenn Sie mehrmals auf dieselbe Entität verweisen müssen, verwenden Sie immer denselben Platzhalter aus dem Eingabetext.
                - Führen Sie keine neuen Platzhalterformate ein.
            """,
            ("de", False): """
                Sie sind ein hilfreicher Assistent, der auf dem neuesten Stand der Informationen basierend auf den Suchergebnissen im Web ist. 
                Bitte analysieren Sie die Suchergebnisse und geben Sie eine umfassende Antwort.
            """
        }

        return templates.get(
            (lang.lower(), anonymized),
            templates[("en", anonymized)]
        )

    def user_search_tpl(self, lang: str, anonymized: bool, question: str, search_results: str) -> str:
        """
        Returns a user search template string based on language and anonymization setting.

        :param lang: Language code (e.g., "en", "de", "fr").
        :param anonymized: Whether the template should use anonymized placeholders.
        :return: The template string.
        """
        templates = {
            ("en", True): f"""
                Based on the following search results, answer the question:

                Question: {question}
                
                Search Results:
                {search_results}
                
                Remember: Keep all placeholders (e.g., PERSON_1, ORG_1) exactly as in the text.
            """,
            ("en", False): f"Based on the following search results, answer the question:\n\nQuestion: {question}\n\nSearch Results:\n{search_results}",
            ("de", True): f"""
                Beantworten Sie die Frage anhand der folgenden Suchergebnisse:

                Frage: {question}
                
                Suchergebnisse:
                {search_results}
                
                Hinweis: Alle Platzhalter (z. B. PERSON_1, ORG_1) müssen exakt wie im Text verwendet werden.
            """,
            ("de", False): f"Basierend auf den folgenden Suchergebnissen beantworten Sie die Frage:\n\nFrage: {question}\n\nSuchergebnisse:\n{search_results}"
        }

        return templates.get(
            (lang.lower(), anonymized),
            templates[("en", anonymized)]
        )


    def run(self, room: Room, question: str, model: str, search_mode: str = "document", is_demo: bool = False, user: User = None, anonymized = False):
        """
        Run a chat request to the selected OpenAI model.
        :param room: Room object containing chat context.
        :param question: The user's question.
        :param model: The OpenAI model to use ("gpt-3.5-turbo", "gpt-4o", "gpt-4o-mini").
        :param search_mode: The search mode to use.
        :param is_demo: Flag to indicate if it's a demo mode.
        :param user: The user object.
        :param anonymized: If the user input should be anonymized
        :return: The assistant's response.
        """
        # Ensure the selected model is valid and not injected by malicious users
        valid_models = ["gpt-3.5-turbo", "gpt-4o", "gpt-4o-mini"]
        
        if model not in valid_models:
            raise ValueError(f"Invalid model '{model}'. Choose from {valid_models}")

        room.appendContext(room, "user", question, is_demo)

        # if user is not defined/none or does not have a language, throw error and return
        if user is None or not user.lang:
            raise ValueError("User language is not defined")
        

        if search_mode == "web":
            search_results = self.perform_web_search(question)

            if anonymized:
                question, search_results, placeholder_map = self.anonymize_text(question, search_results, user.lang)

            messages = [
                {
                    "role": "system",
                    "content": self.system_search_tpl(user.lang, anonymized=True),
                },
                {
                    "role": "user",
                    "content": self.user_search_tpl(user.lang, anonymized=True, question=question, search_results=search_results),
                }
            ]
        else:
            messages = room.createFullMessage(room, False, is_demo, question)

        response = self.client.chat.completions.create(
            model=model,
            messages=messages,
        )
        response_content = response.choices[0].message.content

        if not response_content:
            response_content = "I apologize, I cannot generate an appropriate response. Please try rephrasing your question."

        # Add the response to context
        room.appendContext(room, "assistant", response_content, is_demo)
        return response_content

    def anonymize_text(self, question: str, answer: str, lang: str):
        # Wrap question/answer in tags for later splitting
        wrapped_text = f"<<QUESTION>> {question} <<ANSWER>> {answer}"

        doc = embed_text(wrapped_text, lang)

        placeholder_map = {}
        entity_counts = defaultdict(int)

        anonymized_text = wrapped_text

        # We replace entities from the end so indices don't shift
        for ent in sorted(doc.ents, key=lambda e: e.start_char, reverse=True):
            # if ent.label_ in self.SUPPORTED_ENTITY_TYPES:
            if ent.text not in placeholder_map:
                entity_counts[ent.label_] += 1
                placeholder = f"{ent.label_}_{entity_counts[ent.label_]}"
                placeholder_map[ent.text] = placeholder
            placeholder = placeholder_map[ent.text]
            anonymized_text = (
                    anonymized_text[:ent.start_char] + placeholder + anonymized_text[ent.end_char:]
            )

        return *self.split_anonymized_text(anonymized_text), placeholder_map #, reverse_map

    def split_anonymized_text(self, anonymized_text: str):
        """
        Splits anonymized text back into Q & A using the wrapping tags.
        """
        q_part = anonymized_text.split("<<ANSWER>>")[0].replace("<<QUESTION>>", "").strip()
        a_part = anonymized_text.split("<<ANSWER>>")[1].strip()
        return q_part, a_part



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
