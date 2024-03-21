from chat_with_your_data_api.models import User
from django.db import transaction
from django.db.models import F


def check_api_ratelimit(user):
    with transaction.atomic():
        user_api_calls = User.objects.select_for_update().get(auth0_id=user)
        if user_api_calls.max_api_calls == 0:
            return user_api_calls.max_api_calls

        user_api_calls.max_api_calls = F("max_api_calls") - 1
        user_api_calls.save()
    return user_api_calls.max_api_calls
