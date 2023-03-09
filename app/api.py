from importlib.metadata import requires
from django.http import JsonResponse, HttpResponse, Http404
from .models import Recipe, Category
from rest_framework import viewsets, status
from .serializers import RecipeSerializer
from django.shortcuts import get_object_or_404
from .permissions import *
from django.core.paginator import Paginator

from .files import is_image
from rest_framework.views import APIView
from django.contrib.auth.models import User
from .visits import analyze_visits

from json import loads

class UserApi(APIView):
    def get(self, request, id):
        user = get_object_or_404(User, id=id)
        return JsonResponse({'status': status.HTTP_200_OK, 'content': {"name": user.username}})


class CategoriesApi(APIView):
    def get(self, request):
        return JsonResponse({'status': status.HTTP_200_OK, 'content': [
            row.name for row in Category.objects.all()
        ]})

order_options = {
    "visits": "-visits", 
    "title": "title",
    "new": "-updated_at",
}
'''
Быстрая настройка
py manage.py shell
import app.models as models
'''

class RecipeViewSet(viewsets.ModelViewSet):
    #permission_classes = (IsOwnerOrReadOnly, )
    queryset = Recipe.objects.all()

    serializer_class = RecipeSerializer

    def create(self, request):
        if not request.user.is_authenticated:
            raise Http404

        data_json = {
            'image': request.FILES.get('image'),
            'owner': request.user.pk,
            'title': request.POST.get('title', 'Name'),
            'desc': request.POST.get('desc', 'description'),
        }
        serializer = RecipeSerializer(data=data_json)
        serializer.owner = request.user
        serializer.is_valid(raise_exception=True)
        serializer.save()

        image = serializer.validated_data['image']
        if image and is_image(image.name):
            recipe = Recipe(title=data_json['title'], desc=data_json['desc'])
            recipe.owner = request.user
            recipe.image.save(image.name, image)
            recipe.save()
            return JsonResponse({'status': status.HTTP_200_OK})
        else:
            return JsonResponse({'status': 'error'})

    def list(self, request):
        search_string = request.GET.get("search")
        query_set = self.queryset

        if search_string:
            query_set = query_set.filter(title__icontains=search_string)
        
        by_category = request.GET.get("category")
        if by_category:
            print(f'{by_category=}')
            try:
                query_set = query_set.filter(category=Category(int(by_category)))
            except ValueError:
                pass

        order_by = request.GET.get("order-by")

        if order_by not in order_options:
            order_by = "-visits"
        else:
            order_by = order_options[order_by]

        page = request.GET.get("page", 1)
        query_set = Paginator(query_set.order_by(order_by), 9).page(page)
        
        return JsonResponse({'status': status.HTTP_200_OK, 'content': RecipeSerializer(query_set, many=True).data})

    def retrieve(self, request, id):
        recipe = get_object_or_404(Recipe, id=id)
        analyze_visits(request, recipe)
        return JsonResponse({'status': status.HTTP_200_OK, 'content': RecipeSerializer(recipe).data})

    def update(self, request, id):
        if not request.user.is_authenticated:
            raise Http404

        recipe = get_object_or_404(Recipe, id=id, owner=request.user)
        try:
            recipe.title = request.POST['title']
            recipe.desc = request.POST['desc']
            try:
                recipe.category = Category(int(request.POST['category']))
            except ValueError:
                recipe.category = None
        except KeyError:
            raise Http404
        try:
            file = request.FILES['file']
            if is_image(file.name):
                recipe.image.save(file.name, file)
        except KeyError:
            pass
        recipe.save()
        return JsonResponse({'status': status.HTTP_200_OK})

    def delete(self, request, id):
        if not request.user.is_authenticated:
            raise Http404

        picture = get_object_or_404(Recipe, id=id, owner=request.user)
        picture.delete()
        return JsonResponse({'status': status.HTTP_200_OK})
    
    def http_method_not_allowed(self, request, *args, **kwargs):
        return HttpResponse('<h1>Method Not Allowed (405)</h1>', status=status.HTTP_405_METHOD_NOT_ALLOWED)
