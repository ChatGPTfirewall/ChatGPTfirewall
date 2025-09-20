from collections import defaultdict
from typing import Tuple, Dict

from chat_with_your_data_api.embedding import embed_text
from chat_with_your_data_api.models import AnonymizeEntitie


class AnonymizationUtil:
    SUPPORTED_ENTITY_TYPES = (
    "CARDINAL", "DATE", "EVENT", "FAC", "GPE", "LANGUAGE", "LAW", "LOC", "MONEY", "NORP", "ORDINAL", "ORG", "PERCENT",
    "PERSON", "PRODUCT", "QUANTITY", "TIME", "WORK_OF_ART", "PER", "MISC")

    @staticmethod
    def generate_maps_from_existing_entities(room) -> Tuple[Dict, Dict]:
        entity_counts = defaultdict(int)
        entities_map = defaultdict(lambda: defaultdict(str))

        entities = AnonymizeEntitie.objects.filter(
            roomID=room,
            entityType__in=AnonymizationUtil.SUPPORTED_ENTITY_TYPES
        ).order_by('entityType', '-counter').values('entityType', 'counter', 'anonymized', 'deanonymized')

        current_type = None
        for entity in entities:
            entity_type = entity['entityType']
            entities_map[entity_type][entity['deanonymized']] = entity['anonymized']
            if current_type != entity_type:
                current_type = entity_type
                entity_counts[entity_type] = entity['counter']

        for label in AnonymizationUtil.SUPPORTED_ENTITY_TYPES:
            if label not in entity_counts:
                entity_counts[label] = 0

        return entity_counts, entities_map

    @staticmethod
    def anonymize_text(text: str, lang: str, entities_map: dict, entity_counts: dict,
                       new_placeholders: list) -> str:
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
            if not ent.label_ in AnonymizationUtil.SUPPORTED_ENTITY_TYPES or len(ent.text) > 1024:
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

    @staticmethod
    def save_new_anonymized_entities(room, entities_map, new_placeholders) -> None:
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
