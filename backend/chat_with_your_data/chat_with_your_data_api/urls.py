from django.urls import path
from .views import (
    UserApiView,
)

urlpatterns = [
    path('user/create', UserApiView.as_view()),
]