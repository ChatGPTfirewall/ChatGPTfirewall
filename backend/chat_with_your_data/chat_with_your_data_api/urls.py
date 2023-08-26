from django.urls import path
from .views import (
    UserApiView,
)

urlpatterns = [
    path('users/create', UserApiView.as_view()),
]