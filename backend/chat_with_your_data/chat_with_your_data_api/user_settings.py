template = """
Beantworten Sie die Frage anhand des unten stehenden Kontextes. Wenn die
Frage nicht mit den angegebenen Informationen beantwortet werden kann, antworten Sie
mit "Ich weiß es nicht".

{context}

Frage: 

{question}

Antwort: "" 
"""


# embedded model for user settings (saved as json field in the postgres db at the user)
class UserSettings:
    def __init__(
        self,
        prompt_template=template,
        pre_phrase_count=2,
        post_phrase_count=2,
        fact_count=3,
    ):
        self.prompt_template = prompt_template
        self.pre_phrase_count = pre_phrase_count
        self.post_phrase_count = post_phrase_count
        self.fact_count = fact_count

    def to_dict(self):
        return {
            "prompt_template": self.prompt_template,
            "pre_phrase_count": self.pre_phrase_count,
            "post_phrase_count": self.post_phrase_count,
            "fact_count": self.fact_count,
        }

    @classmethod
    def from_dict(cls, settings_dict):
        defaults = {
            "prompt_template": template,
            "pre_phrase_count": 2,
            "post_phrase_count": 2,
            "fact_count": 3,
        }
        if settings_dict:
            defaults.update(settings_dict)
        return cls(**defaults)
