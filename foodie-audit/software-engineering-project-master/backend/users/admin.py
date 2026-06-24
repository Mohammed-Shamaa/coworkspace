from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User


@admin.register(User)
class CustomUserAdmin(UserAdmin):
    list_display = ['email', 'username', 'role', 'is_verified', 'is_active']
    list_filter = ['role', 'is_verified']
    fieldsets = UserAdmin.fieldsets + (
        ('Extra Info', {
            'fields': ('role', 'phone', 'is_verified', 'otp_code')
        }),
    )