# Generated by Django 5.0.2 on 2024-03-09 21:22

import chat_with_your_data_api.room_settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("chat_with_your_data_api", "0012_user_max_api_calls_alter_room_settings"),
    ]

    operations = [
        migrations.AlterField(
            model_name="anonymizeentitie",
            name="deanonymized",
            field=models.CharField(max_length=255),
        ),
        migrations.AlterField(
            model_name="room",
            name="settings",
            field=models.JSONField(
                default=chat_with_your_data_api.room_settings.RoomSettings.to_dict
            ),
        ),
        migrations.AlterUniqueTogether(
            name="anonymizeentitie",
            unique_together={("deanonymized", "roomID")},
        ),
    ]
