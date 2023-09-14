#!/bin/sh

cd /app

export PATH="/opt/venv/bin:$PATH"

cd chat_with_your_data/

python manage.py migrate

python manage.py runserver 0.0.0.0:8000

exec "$@"