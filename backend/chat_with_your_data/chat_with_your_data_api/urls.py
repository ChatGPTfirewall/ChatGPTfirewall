from django.urls import path

from . import views
from .views import (DocumentApiView, FilesApiView, LanguageAPI,
                    MessagesApiView, NextCloudApiView, NextCloudFilesApiView,
                    RoomApiView, RoomsApiView, UpdateRoomDocumentsView,
                    UploadApiView, UserApiView, CategorizeApiView, SummarizeApiView)

urlpatterns = [
    path("user/", UserApiView.as_view()),
    path("user/<str:auth0_id>/", UserApiView.as_view()),
    # path("users/create", UserApiView.as_view()),
    path("files/reload", FilesApiView.as_view()),
    path("documents", DocumentApiView.as_view()),
    path(
        "rooms/<int:room_id>/documents/",
        UpdateRoomDocumentsView.as_view(),
        name="update_room_documents",
    ),
    path("categorize", CategorizeApiView.as_view()),
    path("summarize", SummarizeApiView.as_view()),
    path("documents/upload", UploadApiView.as_view()),
    path(
        "documents/download/<str:filename>/", views.download_file, name="download_file"
    ),
    path("upload/nextcloud", NextCloudApiView.as_view()),
    path("upload/nextcloud/redirect", NextCloudFilesApiView.as_view()),
    path("language", LanguageAPI.as_view()),
    path("rooms", RoomsApiView.as_view()),
    path("rooms/<str:room_id>/", RoomApiView.as_view()),
    path("messages/<str:recipient>", MessagesApiView.as_view()),
]
