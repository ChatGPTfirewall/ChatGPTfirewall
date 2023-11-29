template_de = """
Beantworten Sie die Frage anhand des unten stehenden Kontextes. Wenn die
Frage nicht mit den angegebenen Informationen beantwortet werden kann, antworten Sie
mit "Ich weiß es nicht".

{context}

Frage: 

{question}

Antwort: "" 
"""

template_en = """
Answer the question using the context below. If the
question cannot be answered with the information provided, answer with "I don't know".

{context}

Question: 

{question}

Answer: "" 
"""



# embedded model for user settings (saved as json field in the postgres db at the user)
class UserSettings:
    def __init__(
        self,
        prompt_template="",
        pre_phrase_count=2,
        post_phrase_count=2,
        fact_count=3,
        prompt_template_lang="en"
    ):
        if prompt_template_lang == "de":
            self.prompt_template = template_de
        else:
            self.prompt_template = template_en
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
    def from_dict(cls, settings_dict, prompt_template_lang="en"):
        defaults = {
            "prompt_template": template_de if prompt_template_lang == "de" else template_en,
            "pre_phrase_count": 2,
            "post_phrase_count": 2,
            "fact_count": 3,
            "prompt_template_lang": prompt_template_lang
        }

        if settings_dict:
            if "prompt_template" not in settings_dict:
                settings_dict["prompt_template"] = defaults["prompt_template"]
            defaults.update(settings_dict)

        return cls(**defaults)