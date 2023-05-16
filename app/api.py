from importlib.metadata import requires
from django.http import JsonResponse, HttpResponse, Http404
from .models import Recipe, Category
from rest_framework import viewsets, status
from .serializers import *
from django.shortcuts import get_object_or_404
from .permissions import *
from django.core.paginator import Paginator
from rest_framework.permissions import IsAdminUser
from .files import is_image
from rest_framework.views import APIView
from django.contrib.auth.models import User
from .visits import analyze_visits

from json import loads

class UserApi(APIView):
    def get(self, request, id):
        user = get_object_or_404(User, id=id)
        return JsonResponse({'status': status.HTTP_200_OK, 'content': {"name": user.username, "is_superuser": user.is_superuser}})

class CategoriesViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all() 
    permission_classes = (IsAdminOrReadOnly,)

    serializer_class = CategoriesSerializer

    def get_object(self, id=None):
        obj = get_object_or_404(self.get_queryset(), pk=id or self.request.POST.get('id'))
        self.check_object_permissions(self.request, obj)
        return obj

    def list(self, request):
        return JsonResponse({'status': status.HTTP_200_OK, 'content': {
            row.id: row.name for row in Category.objects.all()
        }})

    def create(self, request):
        name = request.POST.get('name')
        if not name:
            raise Http404
        cat = Category(name=name)
        cat.save()
        return JsonResponse({'status': status.HTTP_200_OK})
    
    def delete(self, request):
        cat = self.get_object(request.POST.get('id'))
        cat.delete()
        return JsonResponse({'status': status.HTTP_200_OK})



order_options = {
    "visits": "-visits", 
    "title": "title",
    "new": "-updated_at",
}

class RecipeViewSet(viewsets.ModelViewSet):
    permission_classes = (IsOwnerorIsAdminOrReadOnly, )
    queryset = Recipe.objects.all()

    serializer_class = RecipeSerializer

    def get_object(self):
        obj = get_object_or_404(self.get_queryset(), pk=self.kwargs.get("id"))
        self.check_object_permissions(self.request, obj)
        return obj

    def create(self, request):
        if not request.user.is_authenticated:
            raise Http404

        data_json = {
            'image': request.FILES.get('image'),
            'owner': request.user.pk,
            'title': request.POST.get('title', 'Имя'),
            'cookinst': request.POST.get('title', 'Инструкция'),
            'desc': request.POST.get('desc', 'Описание'),
        }
        category = request.POST.get('category')
        if category:
            try:
                category_obj = Category(pk=int(category))
                data_json['category'] = int(category)
            except Exception:
                pass
        serializer = RecipeSerializer(data=data_json)

        serializer.is_valid()

        serializer.save()

        image = serializer.validated_data['image']
        if image and is_image(image.name):
            recipe = Recipe(
                title=serializer.validated_data['title'], desc=serializer.validated_data['desc'], cookinst=serializer.validated_data['cookinst']
                )
            recipe.owner = request.user
            try:
                recipe.category = serializer.validated_data['category']
            except Exception:
                pass
            recipe.image.save(image.name, image)
            recipe.save()
            return JsonResponse({'status': status.HTTP_200_OK})
        else:
            return JsonResponse({'status': 'error'})

    def list(self, request):
        search_string = request.GET.get("search")
        query_set = self.get_queryset()

        if search_string:
            query_set = query_set.filter(title__icontains=search_string)
        
        by_category = request.GET.get("category")
        if by_category:
            try:
                query_set = query_set.filter(category=Category(int(by_category)))
            except ValueError:
                pass

        from_user = request.GET.get("fromuser")
        if from_user:
            try:
                query_set = query_set.filter(owner=User(int(from_user)))
            except Exception:
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
        recipe = self.get_object()
        analyze_visits(request, recipe)
        return JsonResponse({'status': status.HTTP_200_OK, 'content': RecipeSerializer(recipe).data})

    def update(self, request, id):
        recipe = self.get_object()
        try:
            recipe.title = request.POST['title']
            recipe.desc = request.POST['desc']
            recipe.cookinst = request.POST['cookinst']
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
        picture = self.get_object()
        picture.delete()
        return JsonResponse({'status': status.HTTP_200_OK})
    
    def http_method_not_allowed(self, request, *args, **kwargs):
        return HttpResponse('<h1>Method Not Allowed (405)</h1>', status=status.HTTP_405_METHOD_NOT_ALLOWED)
