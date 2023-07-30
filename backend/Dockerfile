FROM python:3.11.4-slim-bookworm
WORKDIR /app
COPY requirements.txt requirements.txt
RUN apt update -y
RUN apt-get install ocrmypdf wget unzip -y
RUN pip3 install --upgrade setuptools
RUN pip3 install spacy
RUN python -m spacy download en_core_web_lg
COPY . .
RUN ["chmod", "+x", "entrypoint.sh"]
ENTRYPOINT ["/app/entrypoint.sh"]