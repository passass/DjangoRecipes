from django.contrib import auth
from django.contrib.auth import logout
from django.contrib.auth.decorators import login_required
from django.contrib.auth.models import User
from django.contrib.auth.views import LoginView
from django.shortcuts import render, redirect
from django.conf import settings
from django.core.files.images import ImageFile
from django.shortcuts import get_object_or_404

import os
from .files import *
from .forms import LoginUserForm, RegisterUserForm
from .models import *

def index(request):
    return render(request, 'index.html')

@login_required
def adminpanel(request):
    if request.user.is_superuser:
        return render(request, 'adminpanel.html')
    return redirect("index")

def user_view(request, id):
    user = False
    try:
        user = User.objects.get(pk=id)
    except MyModel.DoesNotExist:
        pass
    return render(request, 'user_profile.html', {
        'user': user,
    })

def recipe_all(request):
    args = {
        'curpage': int(request.GET.get("page", 1)),
        'maxpages': (Recipe.objects.all().count() - 1) // 9 + 1
    }
    return render(request, 'recipe_all.html', args)

def recipe_get(request, id):
    return render(request, 'recipe_get.html', context={"recipe_owner": get_object_or_404(Recipe, pk=id), "is_editor": not not request.GET.get("editor", False)})

@login_required
def recipe_upload(request):
    return render(request, 'recipe_upload.html')

def register(request):
    args = {
        'title': "Авторизация",
        'form': RegisterUserForm,
        'error': False,
    }
    if request.method == "POST":
        form = RegisterUserForm(request.POST)
        if form.is_valid():
            login = form.cleaned_data['username']
            password = form.cleaned_data['password1']
            email = form.cleaned_data['email']
            if not User.objects.filter(username=login) and not User.objects.filter(email=email):
                user = User.objects.create_user(username=login,
                                                email=email,
                                                password=password)
                create_UserAdvanced(user)
                auth.login(request, user)
                return redirect('index')
            args["error"] = ["Почта уже занята"]
        else:
            args['error'] = list(form.errors.values())[0]
        args['form'] = form
    return render(request, 'register.html', context=args)

@login_required
def logout_view(request):
    logout(request)
    return redirect("index")

class LoginUser(LoginView):
    form_class = LoginUserForm
    template_name = 'login.html'

    def get_context_data(self, *, object_list=None, **kwargs):
        context = super().get_context_data(**kwargs)
        return dict(list(context.items()))

    def form_invalid(self, form):
        return self.render_to_response(self.get_context_data(form=form))

    def form_valid(self, form):
        user = form.get_user()
        auth.login(self.request, user)
        if "remember_me" in self.request.POST:
            self.request.session.set_expiry(0)
        return redirect('index')
