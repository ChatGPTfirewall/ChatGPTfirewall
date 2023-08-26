FROM python:3.11.4-slim-bookworm
WORKDIR /app
COPY requirements.txt requirements.txt
RUN apt update -y
RUN apt-get install wget unzip -y
RUN apt update -y
RUN apt-get install ocrmypdf -y
RUN pip install --upgrade pip
RUN pip3 install -r requirements.txt
RUN pip3 install ocrmypdf
RUN pip3 install striprtf
RUN pip3 install --upgrade setuptools
RUN pip3 install spacy
RUN python -m spacy download de_core_news_lg
COPY . .
RUN ["chmod", "+x", "entrypoint.sh"]
ENTRYPOINT ["/app/entrypoint.sh"]
