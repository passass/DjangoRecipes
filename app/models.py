from email.policy import default
from django.db import models
from django.contrib.auth.models import User


def create_UserAdvanced(user):
    user_advanced = UserAdvanced.objects.create(user=user)
    user_advanced.save()
    return user_advanced


def get_UserAdvanced(user):
    try:
        user_advanced = user.useradvanced
    except Exception:
        user_advanced = create_UserAdvanced(user)
    return user_advanced


class Category(models.Model):
    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=30)

class Recipe(models.Model):
    id = models.AutoField(primary_key=True)
    title = models.CharField(default="Название", max_length=60)
    desc = models.TextField(default="Описание", max_length=1500)
    image = models.ImageField(upload_to="pictures/%Y/%M/%D", max_length=255)
    owner = models.ForeignKey(User, on_delete=models.CASCADE)
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    visits = models.IntegerField(default=0)

    def __str__(self):
        return self.title

class UserAdvanced(models.Model):
    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        primary_key=True,
    )
    visits = models.JSONField(default=list)