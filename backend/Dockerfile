ARG PYTHON_VERSION=3.11-slim-bullseye

FROM python:${PYTHON_VERSION} as base

WORKDIR /app

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

RUN apt-get update && apt-get install -y --no-install-recommends \
    libpq-dev gcc python3-dev tesseract-ocr ghostscript && \
    pip install --upgrade pip && pip install pipenv && \
    rm -rf /var/lib/apt/lists/*

COPY Pipfile Pipfile.lock ./

# Development Environment
FROM base as development

RUN pipenv install --dev --system

COPY chat_with_your_data/ ./chat_with_your_data
COPY entrypoint.dev.sh ./entrypoint.dev.sh

RUN pip install --extra-index-url https://download.pytorch.org/whl/cpu torch && \
    python -m spacy download de_core_news_lg && \
    python -m spacy download en_core_web_lg

EXPOSE 8000
ENTRYPOINT ["/app/entrypoint.dev.sh"]

# Production Environment
FROM base as production

RUN pipenv install --system

COPY chat_with_your_data/ ./chat_with_your_data
COPY entrypoint.sh ./entrypoint.sh

RUN pip install --extra-index-url https://download.pytorch.org/whl/cpu torch && \
    python -m spacy download de_core_news_lg && \
    python -m spacy download en_core_web_lg

EXPOSE 8000
ENTRYPOINT ["/app/entrypoint.sh"]