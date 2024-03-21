#!/bin/sh

cd /app

cd chat_with_your_data/

python manage.py migrate

gunicorn --bind [::]:8000 --workers 1 --worker-class=gevent  --timeout 120 chat_with_your_data.wsgi

exec "$@"