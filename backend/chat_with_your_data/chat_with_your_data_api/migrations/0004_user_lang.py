# Generated by Django 4.2.4 on 2023-09-29 15:39

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('chat_with_your_data_api', '0003_section'),
    ]

    operations = [
        migrations.AddField(
            model_name='user',
            name='lang',
            field=models.CharField(default='de', max_length=2),
            preserve_default=False,
        ),
    ]
