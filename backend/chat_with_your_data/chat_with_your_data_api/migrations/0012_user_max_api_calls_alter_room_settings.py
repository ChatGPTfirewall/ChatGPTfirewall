# Generated by Django 4.2.4 on 2024-02-29 15:38

import chat_with_your_data_api.room_settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("chat_with_your_data_api", "0011_remove_room_prompt_alter_room_settings"),
    ]

    operations = [
        migrations.AddField(
            model_name="user",
            name="max_api_calls",
            field=models.IntegerField(default=50),
        ),
        migrations.AlterField(
            model_name="room",
            name="settings",
            field=models.JSONField(
                default=chat_with_your_data_api.room_settings.RoomSettings.to_dict
            ),
        ),
    ]
