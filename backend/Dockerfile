ARG PYTHON_VERSION=3.11-slim-bullseye

FROM python:${PYTHON_VERSION}

WORKDIR /app

ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

COPY requirements.txt requirements.txt
RUN set -ex && \
    pip install --upgrade pip && \
    pip install -r requirements.txt && \
    rm -rf /root/.cache/
COPY . /code

EXPOSE 8000

CMD [ "tail", "-f", "/dev/null" ]

# CMD ["gunicorn", "--bind", ":8000", "--workers", "2", "hello_django.wsgi"]
