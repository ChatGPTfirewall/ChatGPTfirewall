from django.urls import path
from .views import (
    UserApiView, FileApiView
)

urlpatterns = [
    path('users/create', UserApiView.as_view()),
    path('upload', FileApiView.as_view()),
]