from .models import UserAdvanced, Recipe, get_UserAdvanced

def analyze_visits(request, recipe):
    if request.user.is_authenticated and request.user != recipe.owner:
        user_advanced = get_UserAdvanced(request.user)
        if recipe.id not in user_advanced.visits:
            user_advanced.visits.append(recipe.id)
            recipe.visits += 1
            user_advanced.save()
            recipe.save()
            return True
    return False