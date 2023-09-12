from django.urls import path
from .views import (
    UserApiView, FileApiView, CollectionApiView, ChatApiView, ContextApiView, NextCloudApiView
)

urlpatterns = [
    path('users/create', UserApiView.as_view()),
    path('upload', FileApiView.as_view()),
    path('collections/create', CollectionApiView.as_view()),
    path('question', ChatApiView.as_view()),
    path('context', ContextApiView.as_view()),
    path('upload/nextcloud', NextCloudApiView.as_view()),
    path('upload/nextcloud/redirect', NextCloudApiView.as_view())
]