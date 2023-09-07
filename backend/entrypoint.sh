#!/bin/sh

cd /app

export PATH="/opt/venv/bin:$PATH"

cd chat_with_your_data/

# tail -f /dev/null

python manage.py migrate

gunicorn --bind [::]:8000 --workers 1 --worker-class=eventlet chat_with_your_data.wsgi

exec "$@"