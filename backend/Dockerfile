FROM python:3.11.4-slim-bullseye
WORKDIR /app
COPY . .
RUN pip3 install --upgrade setuptools
RUN pip3 install -r requirements.txt
RUN python -m spacy download en_core_web_lg
CMD ["python3", "-m" , "flask", "run"]
# CMD [ "tail", "-f", "/dev/null"]