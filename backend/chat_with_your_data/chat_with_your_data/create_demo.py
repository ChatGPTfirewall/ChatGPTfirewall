from django.contrib.auth.models import User
import os

from django.conf import settings

settings.configure()
def create_demo_user():
    
    demo_user, created = User.objects.get_or_create(
        username='demouser',
        email='demo@example.com',
        password='Test1234', 
    )
    if created:
        print('Demo user created')
    else:
        print('Demo user already exists')
if __name__ == '__main__':
    settings.configure()
    create_demo_user()
