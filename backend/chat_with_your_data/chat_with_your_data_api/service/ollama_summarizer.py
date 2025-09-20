import requests
from django.conf import settings

class OllamaSummarizer:
    def __init__(self, base_url=None):
        self.base_url = base_url or getattr(settings, "LLM_SERVICE_URL", "http://llm-service:11434")
        self.model = 'smollm2:135m'

    def summarize(self, text: str) -> str:
        response = self._send_request(text)

        return response.get('response', '')

    def _send_request(self, text: str) -> dict:
        """
        Calls the Ollama service and returns the response JSON.
        """
        prompt = "Generate a short summary of the following text in the same language as the text:\n"+text
        url = f"{self.base_url}/api/generate"
        payload = {
            "stream": False,
            "model": self.model,
            "prompt": prompt,
        }

        response = requests.post(url, json=payload, timeout=360)
        response.raise_for_status()
        return response.json()