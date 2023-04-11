from django.contrib.auth.models import User
from models import Recipe, Category

recipes_data = [
]

recipes_categories = [
    {
        image: "",
        title: "",
        desc: "",
        image: "",

    }
]

def set_up_start_data():
    first_user = User.objects.get(pk=1) # должен быть суперадмин
    
    for data in recipes_categories:
        recipe = Category(title=data_json['title'], desc=data_json['desc'])
        recipe.name = data.get('name')
        recipe.save()

    for data in recipes_data:
        recipe = Recipe(
            title=data_json['title'], 
            desc=data_json['desc']
            )
        recipe.owner = first_user
        recipe.category = data.get('category')
        recipe.image = "startup_data/" + data['image']
        recipe.save()

    
