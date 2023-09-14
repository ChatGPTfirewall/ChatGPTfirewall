from django.urls import path
from .views import (
    UserApiView, UploadApiView, CollectionApiView, ChatApiView, ContextApiView, NextCloudApiView, DocumentApiView
)

urlpatterns = [
    path('users/create', UserApiView.as_view()),
    path('documents', DocumentApiView.as_view()),
    path('documents/upload', UploadApiView.as_view()),
    path('collections/create', CollectionApiView.as_view()),
    path('collections/delete', CollectionApiView.as_view()),
    path('question', ChatApiView.as_view()),
    path('context', ContextApiView.as_view()),
    path('upload/nextcloud', NextCloudApiView.as_view()),
    path('upload/nextcloud/redirect', NextCloudApiView.as_view()),
]