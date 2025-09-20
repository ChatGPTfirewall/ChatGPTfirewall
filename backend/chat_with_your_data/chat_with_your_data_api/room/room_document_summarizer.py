from chat_with_your_data_api.models import RoomDocuments
from chat_with_your_data_api.service.anonymization_util import AnonymizationUtil
from chat_with_your_data_api.service.hierarchical_summarizer import HierarchicalSummarizer

import re
import unicodedata


class RoomDocumentSummarizer:
    @staticmethod
    def create_summarize_msg(document, user, room):
        if user is None or not user.lang:
            raise ValueError("User language is not defined")

        #TODO: Raise exception
        if not document.text:
            return "" #or rais exception

        if not RoomDocumentSummarizer.is_doc_in_room(document, room):
            RoomDocuments.objects.create(room=room, document=document)

        summarizer = HierarchicalSummarizer("sshleifer/distilbart-cnn-12-6")
        text = RoomDocumentSummarizer.clean_text(document.text)
        #TODO: Add check if text is empty
        summary = summarizer.summarize(text)
        message = "Dies ist die Zusammenfassung für ein Dokument:" if user.lang == 'de' else "This is the summary for a document:"
        message += " " + document.filename + "\n" + summary

        return RoomDocumentSummarizer._append_anonymized_to_room(message, user.lang, room)

    @staticmethod
    def _append_anonymized_to_room(message, lang, room) -> str:
        entity_counts, entities_map = AnonymizationUtil.generate_maps_from_existing_entities(room)
        new_placeholders = []
        anon_msg = AnonymizationUtil.anonymize_text(message, lang, entities_map, entity_counts,
                                                           new_placeholders)
        room.appendContext(room, "user", anon_msg, is_demo=False, anonymized=True)

        AnonymizationUtil.save_new_anonymized_entities(room, entities_map, new_placeholders)

        return anon_msg

    @staticmethod
    def is_doc_in_room(doc, room) -> bool:
        return bool(RoomDocuments.objects.filter(room=room, document=doc).first())

    @staticmethod
    def add_doc_to_room(doc, room):
        RoomDocuments.objects.create(room=room, document=doc)

    @staticmethod
    def clean_text(text: str, max_length: int = None) -> str:
        """
        Prepare document content for LLM summarization:
        - Remove control characters
        - Normalize whitespace
        """
        # 1. Normalize unicode
        text = unicodedata.normalize("NFKC", text)

        # 2. Remove control characters (except newline/tab)
        text = re.sub(r"[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]", "", text)

        # 3. Replace multiple newlines/tabs/spaces with single space
        text = re.sub(r"[\r\n\t]+", " ", text)
        text = re.sub(r" {2,}", " ", text)

        # 4. Strip leading/trailing spaces
        text = text.strip()

        return text
