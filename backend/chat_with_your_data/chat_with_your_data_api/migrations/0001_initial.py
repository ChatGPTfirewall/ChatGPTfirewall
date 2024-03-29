# Generated by Django 4.2.4 on 2023-08-26 07:18

from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = []

    operations = [
        migrations.CreateModel(
            name="User",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                ("auth0_id", models.CharField(max_length=255, unique=True)),
                ("username", models.CharField(max_length=255)),
                ("email", models.CharField(max_length=255)),
            ],
        ),
    ]
