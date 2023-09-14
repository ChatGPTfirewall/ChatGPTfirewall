from django.urls import path
from .views import (
    UserApiView, FileApiView, CollectionApiView, ChatApiView, ContextApiView, NextCloudApiView
)

urlpatterns = [
    path('users/create', UserApiView.as_view()),
    path('documents/upload', FileApiView.as_view()),
    path('documents/<str:user_id>', FileApiView.as_view(), name="get"),
    path('documents/<str:user_id>/delete', FileApiView.as_view(), name="delete"),
    path('collections/create', CollectionApiView.as_view()),
    path('collections/delete', CollectionApiView.as_view()),
    path('question', ChatApiView.as_view()),
    path('context', ContextApiView.as_view()),
    path('upload/nextcloud', NextCloudApiView.as_view()),
    path('upload/nextcloud/redirect', NextCloudApiView.as_view()),
]