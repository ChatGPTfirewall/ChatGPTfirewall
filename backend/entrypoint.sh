#!/bin/sh

cd /app
pip3 install -r requirements.txt
pip3 install ocrmypdf
python app.py

exec "$@"