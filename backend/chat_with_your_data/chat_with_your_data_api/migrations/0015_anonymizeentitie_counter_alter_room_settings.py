# Generated by Django 5.0.2 on 2024-03-09 21:46

import chat_with_your_data_api.room_settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("chat_with_your_data_api", "0014_alter_room_settings"),
    ]

    operations = [
        migrations.AddField(
            model_name="anonymizeentitie",
            name="counter",
            field=models.IntegerField(default=1),
            preserve_default=False,
        ),
        migrations.AlterField(
            model_name="room",
            name="settings",
            field=models.JSONField(
                default=chat_with_your_data_api.room_settings.RoomSettings.to_dict
            ),
        ),
    ]