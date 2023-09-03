from django.urls import path
from .views import (
    UserApiView, FileApiView, CollectionApiView, ChatApiView
)

urlpatterns = [
    path('users/create', UserApiView.as_view()),
    path('upload', FileApiView.as_view()),
    path('collections/create', CollectionApiView.as_view()),
    path('question', ChatApiView.as_view())
]