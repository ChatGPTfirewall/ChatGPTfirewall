#!/bin/sh

cd /app

cd chat_with_your_data/

python manage.py migrate

python manage.py runserver 0.0.0.0:8000

exec "$@"