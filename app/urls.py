from xml.etree.ElementInclude import include
from django.urls import path, re_path
from django.conf import settings
from django.conf.urls.static import static
from django.contrib.staticfiles.urls import staticfiles_urlpatterns
from rest_framework.routers import DefaultRouter
from django.views.generic.base import RedirectView

from .api import *
from .views import *

api_preffix = "api/v1/"

favicon_view = RedirectView.as_view(url='/static/favicon.ico', permanent=True)

urlpatterns = [
    path('', index, name='index'),

    path('user/<int:id>', user_view, name='user_profile'),
    
    path('login/', LoginUser.as_view(), name='login'),
    path('register/', register, name='register'),
    path('logout/', logout_view, name='logout'),

    path('recipe/', recipe_all, name='recipe_all'),
    path('recipe/<int:id>', recipe_get, name='recipe_get'),
    path('recipe/upload', recipe_upload, name='recipe_upload'),

    path('admin', adminpanel, name='admin'),

    path(api_preffix + 'recipe/categories', CategoriesViewSet.as_view({"get": "list"}), name='api_recipe_categories'),
    path(api_preffix + 'recipe/categories/create', CategoriesViewSet.as_view({"post": "create"}), name='api_recipe_categories_create'),
    path(api_preffix + 'recipe/categories/delete', CategoriesViewSet.as_view({"post": "delete"}), name='api_recipe_categories_delete'),

    path(api_preffix + 'recipe/create', RecipeViewSet.as_view({"post": "create"}), name='api_recipe_create'),
    path(api_preffix + 'recipe/', RecipeViewSet.as_view({"get": "list"}), name='api_recipe_all'),
    path(api_preffix + 'recipe/<int:id>', RecipeViewSet.as_view({"get": "retrieve"}), name='api_recipe_get'),
    path(api_preffix + 'recipe/<int:id>/save', RecipeViewSet.as_view({"post": "update"}), name='api_recipe_update'),
    path(api_preffix + 'recipe/<int:id>/delete', RecipeViewSet.as_view({"post": "delete"}), name='api_recipe_delete'),

    path(api_preffix + 'user/<int:id>', UserApi.as_view(), name='user_data'),

    re_path(r'^favicon\.ico$', favicon_view),
]

urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
urlpatterns += staticfiles_urlpatterns()
