from django.shortcuts import render

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework import permissions
from .models import User
from .serializers import UserSerializer

class UserApiView(APIView):

    # # 1. List all
    # def get(self, request, *args, **kwargs):
    #     '''
    #     List all the todo items for given requested user
    #     '''
    #     todos = Todo.objects.filter(user = request.user.id)
    #     serializer = TodoSerializer(todos, many=True)
    #     return Response(serializer.data, status=status.HTTP_200_OK)

    # 2. Create
    def post(self, request, *args, **kwargs):
        '''
        Create a user.
        '''
        data = {
            'auth0_id': request.data.get('auth0_id'), 
            'username': request.data.get('username'), 
            'email': request.data.get('email')
        }
        serializer = UserSerializer(data=data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
