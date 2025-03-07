template_de = """Beantworte die Frage anhand des unten stehenden Kontextes. Wenn die
Frage nicht mit den angegebenen Informationen beantwortet werden kann, antworte
mit "Ich weiß es nicht"."""

template_en = """Answer the question using the context below. If the
question cannot be answered with the information provided, answer with "I don't know"."""

# Default anonymization types
default_anonymization_types = [
    'CARDINAL', 'DATE', 'EVENT', 'FAC', 'GPE', 'LANGUAGE', 'LAW', 'LOC',
    'MONEY', 'NORP', 'ORDINAL', 'ORG', 'PERCENT', 'PERSON', 'PRODUCT',
    'QUANTITY', 'TIME', 'WORK_OF_ART', 'PER', 'MISC'
]

# embedded model for user settings (saved as json field in the postgres db at the user)
class RoomSettings:
    def __init__(
        self,
        _prompt_template="",
        pre_phrase_count=2,
        post_phrase_count=2,
        prompt_template_lang="en",
        active_anonymization_types=None,
    ):
        self.templates = {"de": template_de, "en": template_en}
        self.prompt_template = self.templates[prompt_template_lang]
        self.pre_phrase_count = pre_phrase_count
        self.post_phrase_count = post_phrase_count
        self.active_anonymization_types = active_anonymization_types or default_anonymization_types  # Set default

    def to_dict(self):
        return {
            "templates": self.templates,
            "prompt_template": self.prompt_template,
            "pre_phrase_count": self.pre_phrase_count,
            "post_phrase_count": self.post_phrase_count,
            "active_anonymization_types": self.active_anonymization_types,
        }

    @classmethod
    def from_dict(cls, settings_dict, prompt_template_lang="en"):
        return cls(
            **settings_dict,
            prompt_template_lang=prompt_template_lang,
            active_anonymization_types=settings_dict.get('active_anonymization_types', default_anonymization_types)  # Handle default
        )
