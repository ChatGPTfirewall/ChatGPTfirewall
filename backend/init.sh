#!/bin/sh

python -m spacy download $SPACY_NLP_MODEL

cd chat_with_your_data
python manage.py migrate