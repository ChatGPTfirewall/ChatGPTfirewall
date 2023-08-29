#!/bin/sh

cd /app
pip install --upgrade pip
pip3 install -r requirements.txt

cd chat_with_your_data

python manage.py migrate

gunicorn --bind [::]:8000 --workers 2 chat_with_your_data.wsgi

exec "$@"