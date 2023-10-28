from django.urls import path
from .views import (
    UserApiView, UploadApiView, ChatPageAPI, ChatApiView, ContextApiView, NextCloudApiView, DocumentApiView, NextCloudFilesApiView, LanguageAPI, FilesApiView, DemoPageAPI
)
from . import views

urlpatterns = [
    path('users/create', UserApiView.as_view()),
    path('files/reload', FilesApiView.as_view()),
    path('documents', DocumentApiView.as_view()),
    path('documents/upload', UploadApiView.as_view()),
    path('documents/download/<str:filename>/', views.download_file, name='download_file'),
    path('question', ChatApiView.as_view()),
    path('context', ContextApiView.as_view()),
    path('upload/nextcloud', NextCloudApiView.as_view()),
    path('upload/nextcloud/redirect', NextCloudFilesApiView.as_view()),
    path('language', LanguageAPI.as_view()),
    path('demo', DemoPageAPI.as_view()),
    path('chat', ChatPageAPI.as_view()),
]