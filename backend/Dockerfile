FROM python:3.11-slim-bullseye AS base

WORKDIR /app

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

# Install dependencies and Python packages
RUN apt-get update && apt-get install -y --no-install-recommends \
    libpq-dev gcc curl python3-dev libmagic-dev tesseract-ocr ghostscript && \
    pip install --upgrade "pip<24.1" pipenv textract && \
    rm -rf /var/lib/apt/lists/*

COPY Pipfile Pipfile.lock ./

# Install dependencies with pipenv
RUN pipenv install --system --deploy

# Production Environment
FROM base AS production

# Download NLP model dependencies
RUN pip install --extra-index-url https://download.pytorch.org/whl/cpu torch && \
    python -m spacy download de_core_news_lg && \
    python -m spacy download en_core_web_lg

# Copy application code
COPY chat_with_your_data/ ./chat_with_your_data
COPY entrypoint.sh ./entrypoint.sh

EXPOSE 8000
ENTRYPOINT ["/app/entrypoint.sh"]

