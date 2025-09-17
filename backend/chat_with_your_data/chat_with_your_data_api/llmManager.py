import os
from duckduckgo_search import DDGS

from openai import OpenAI  

from .models import Room, RoomSettings, User, AnonymizeEntitie

from .embedding import embed_text
from collections import defaultdict
from typing import Tuple, Dict

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
                Give comprehensive answer to the last user question using only the provided web search results. Use prior messages only for context.
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
                You are a helpful assistant that can provide up-to-date information based on web search results.
                Give comprehensive answer to the last user question using only the provided web search results. Use prior messages only for context.""",
            ("de", True): """
                Sie sind ein hilfreicher Assistent, der aktuelle Informationen basierend auf Websuchergebnissen bereitstellen kann.
                Beantworten Sie die letzte Nutzerfrage umfassend und verwenden Sie dabei ausschließlich die bereitgestellten Websuchergebnisse. Verwenden Sie vorherige Nachrichten nur zur Kontextualisierung.
                
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
                Sie sind ein hilfreicher Assistent, der aktuelle Informationen basierend auf Websuchergebnissen bereitstellen kann.
                Beantworten Sie die letzte Benutzerfrage umfassend und verwenden Sie dabei ausschließlich die bereitgestellten Websuchergebnisse. Verwenden Sie vorherige Nachrichten nur zur Kontextualisierung.
            """
        }

        return templates.get(
            (lang.lower(), anonymized),
            templates[("en", anonymized)]
        )

    def user_search_tpl(self, lang: str, search_results: str) -> str:
        """
        Returns a user search template string based on language.

        :param lang: Language code (e.g., "en", "de", "fr").
        :return: The template string.
        """
        if lang == 'de':
            return "Für die letzte Frage relevante Websuchergebnisse:\n" + search_results
        else:
            return "Web search results relevant to the last question:\n" + search_results


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

        # if user is not defined/none or does not have a language, throw error and return
        if user is None or not user.lang:
            raise ValueError("User language is not defined")

        if search_mode == "web":
            search_results = self.perform_web_search(question)
            entity_counts, entities_map = self.generate_maps_from_existing_entities(room)

            wrapped_text = f"<<QUESTION>> {question} <<ANSWER>> {search_results}"

            new_placeholders = []
            anonymized_text = self._anonymize_text(wrapped_text, user.lang, entities_map, entity_counts, new_placeholders)

            anon_question, anon_search = self._split_qa_text(anonymized_text)

            room.appendContext(room, "user", anon_question, is_demo, anonymized)

            messages = [
                {
                    "role": "system",
                    "content": self.system_search_tpl(user.lang, anonymized),
                }
            ]

            messages.extend(room.getConversation(room, False))
            messages.insert(-1, {
                                            "role": "user",
                                            "content": self.user_search_tpl(user.lang, search_results=anon_search if anonymized else search_results)
                                          })

            response_content = self._make_llm_request(
                model=model,
                messages=messages,
            )

            # Anonymize response if already not anonymized
            if not anonymized:
                response_content = self._anonymize_text(response_content, user.lang, entities_map, entity_counts,
                                                        new_placeholders)

            # Remove placeholders used in search_result but not used in question and answer
            if anonymized:
                self.remove_from_placeholders_unused_in_text(f"{anon_question}\n{response_content}", user.lang,
                                                             new_placeholders)

            self._save_new_anonymized_entities(room, entities_map, new_placeholders)
        else:
            room.appendContext(room, "user", question, is_demo)
            messages = room.createFullMessage(room, False, is_demo, question)

            response_content = self._make_llm_request(
                model=model,
                messages=messages,
            )

        # Add the response to context
        room.appendContext(room, "assistant", response_content, is_demo, anonymized=(search_mode == "web"))
        return response_content

    def _make_llm_request(self, model, messages):
        response = self.client.chat.completions.create(
            model=model,
            messages=messages,
        )
        response_content = response.choices[0].message.content

        if not response_content:
            response_content = "I apologize, I cannot generate an appropriate response. Please try rephrasing your question."

        return response_content

    def _save_new_anonymized_entities(self, room, entities_map, new_placeholders) -> None:
        for pl in new_placeholders:
            type, count = pl.rsplit("_", 1)
            # Find text label for placeholder in map
            entry = next((k for k, v in entities_map[type].items() if v == pl), None)

            AnonymizeEntitie.objects.create(
                roomID=room,
                anonymized=pl,
                deanonymized=entry,
                entityType=type,
                counter=count,
            )

    def generate_maps_from_existing_entities(self, room) -> Tuple[Dict, Dict]:
        entity_counts = defaultdict(int)
        entities_map = defaultdict(lambda: defaultdict(str))

        entities = AnonymizeEntitie.objects.filter(
            roomID=room,
            entityType__in=LLM.SUPPORTED_ENTITY_TYPES
        ).order_by('entityType', '-counter').values('entityType', 'counter', 'anonymized', 'deanonymized')

        current_type = None
        for entity in entities:
            entity_type = entity['entityType']
            entities_map[entity_type][entity['deanonymized']] = entity['anonymized']
            if current_type != entity_type:
                current_type = entity_type
                entity_counts[entity_type] = entity['counter']

        for label in LLM.SUPPORTED_ENTITY_TYPES:
            if label not in entity_counts:
                entity_counts[label] = 0

        return entity_counts, entities_map

    def remove_from_placeholders_unused_in_text(self, text, lang, new_placeholders) -> None:
        tokens = {token.text for token in embed_text(text, lang)}
        # Get unused placeholders
        unused = [ph for ph in new_placeholders if ph not in tokens]

        for pl in unused:
            new_placeholders.remove(pl)

    def _anonymize_text(self, text: str, lang: str, entities_map: dict, entity_counts: dict, new_placeholders: list) -> str:
        """
        Anonymization of provided text
        Args:
            text: Text for anonymization
            lang: Language of the text
            entities_map: Dict in form of {"PERSON": {"Alice": "PERSON_1"}} that was previously generated from anonymized previous conversations
            entity_counts: Previously generated map for label and counter {"PERSON": 1, "ORG": 2}
            new_placeholders: Newly generated placeholders from current text

        Returns:
            Anonymized text
        """
        doc = embed_text(text, lang)
        anonymized_text = text
        for ent in sorted(doc.ents, key=lambda e: e.start_char, reverse=True):
            if not ent.label_ in LLM.SUPPORTED_ENTITY_TYPES or len(ent.text) > 1024:
                continue
            if ent.text not in entities_map[ent.label_]:
                entity_counts[ent.label_] += 1
                placeholder = f"{ent.label_}_{entity_counts[ent.label_]}"
                entities_map[ent.label_][ent.text] = placeholder
                new_placeholders.append(placeholder)
            placeholder = entities_map[ent.label_][ent.text]
            anonymized_text = (
                    anonymized_text[:ent.start_char] + placeholder + anonymized_text[ent.end_char:]
            )

        return anonymized_text

    def _split_qa_text(self, anonymized_text: str):
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
