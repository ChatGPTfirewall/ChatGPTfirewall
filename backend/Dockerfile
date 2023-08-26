ARG PYTHON_VERSION=3.11-slim-bullseye

FROM python:${PYTHON_VERSION}

WORKDIR /app

ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

RUN apt-get update && \
    apt-get install -y libpq-dev gcc

COPY requirements.txt requirements.txt
RUN set -ex && \
    pip install --upgrade pip && \
    pip install --upgrade setuptools && \
    pip install -r requirements.txt && \
    rm -rf /root/.cache/
COPY . /code

COPY entrypoint.sh entrypoint.sh

EXPOSE 8000

# ENTRYPOINT ["/app/entrypoint.sh"]
