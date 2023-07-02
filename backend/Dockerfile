FROM python:3.11.4-slim-bullseye
WORKDIR /app
COPY . .
RUN apt update -y
RUN apt-get install ocrmypdf wget unzip -y
RUN wget http://vectors.nlpl.eu/repository/20/193.zip
RUN unzip 193.zip -d ./193
RUN rm ./193.zip
RUN pip3 install --upgrade setuptools
RUN pip3 install -r requirements.txt
RUN python -m spacy download en_core_web_lg
CMD [ "python", "app.py"]
# CMD [ "tail", "-f", "/dev/null"]