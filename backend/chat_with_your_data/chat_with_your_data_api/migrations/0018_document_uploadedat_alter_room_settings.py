# Generated by Django 5.0.3 on 2024-03-28 12:49

import chat_with_your_data_api.room_settings
import django.utils.timezone
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('chat_with_your_data_api', '0017_alter_room_settings_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='document',
            name='uploadedAt',
            field=models.DateTimeField(auto_now_add=True, default=django.utils.timezone.now),
            preserve_default=False,
        ),
        migrations.AlterField(
            model_name='room',
            name='settings',
            field=models.JSONField(default=chat_with_your_data_api.room_settings.RoomSettings.to_dict),
        ),
    ]
