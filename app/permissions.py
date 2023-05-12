from rest_framework import permissions


class IsOwnerOrReadOnly(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True

        return request.method in permissions.SAFE_METHODS

class IsAdminOrReadOnly(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.method in permissions.SAFE_METHODS or request.user.is_superuser
    
    def has_object_permission(self, request, view, obj):
        if not request.user.is_authenticated():
            return False
        
        return request.method in permissions.SAFE_METHODS or request.user.is_superuser