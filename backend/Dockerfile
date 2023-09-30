ARG PYTHON_VERSION=3.11-slim-bullseye 

FROM python:${PYTHON_VERSION} as builder

WORKDIR /app

ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1


RUN python -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

RUN apt-get update && \
    apt-get install -y libpq-dev gcc python-dev python3-dev && \
    apt-get update && \
    rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN set -ex && \
    pip3 install --upgrade pip && \
    pip3 install --upgrade setuptools && \
    pip3 install --no-cache-dir -r requirements.txt --extra-index-url https://download.pytorch.org/whl/cpu && \
    python -m spacy download de_core_news_lg && \
    python -m spacy download en_core_web_lg && \
    rm -rf /root/.cache/

ENTRYPOINT [ "/app/entrypoint.dev.sh" ]

FROM python:${PYTHON_VERSION}

WORKDIR /app

COPY --from=builder /opt/venv /opt/venv

COPY chat_with_your_data chat_with_your_data
COPY entrypoint.sh .

EXPOSE 8000

ENTRYPOINT ["/app/entrypoint.sh"]

