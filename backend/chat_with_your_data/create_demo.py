from chat_with_your_data_api.serializers import UserSerializer
from chat_with_your_data_api.qdrant import create_collection

import os

    
data = {
            "id": 999,
            "auth0_id": "demoUser",
            "username": "demoNewUser",
            "email": "demo@demo.demo123",
            "lang": "en"
        }
serializer = UserSerializer(data=data)
if serializer.is_valid():
    serializer.save()
    create_collection(data.get('auth0_id'))

# run this with: python manage.py shell < create_demo.py