
from chat_with_your_data_api.serializers import UserSerializer

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

# run this with: python manage.py shell < create_demo.py