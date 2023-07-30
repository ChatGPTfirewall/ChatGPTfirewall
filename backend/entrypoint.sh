#!/bin/sh

cd /app
pip install --upgrade pip
#pip3 install -r requirements.txt
#pip3 install ocrmypdf
#pip3 install striprtf
python app.py

exec "$@"
