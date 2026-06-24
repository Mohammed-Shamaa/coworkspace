from django.contrib import admin
from .models import Restaurant, Category, MenuItem

@admin.register(Restaurant)
class RestaurantAdmin(admin.ModelAdmin):
    list_display = ['name', 'owner', 'area', 'is_open', 'is_approved']
    list_filter = ['is_open', 'is_approved', 'city']
    search_fields = ['name', 'area']

@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'restaurant', 'display_order']

@admin.register(MenuItem)
class MenuItemAdmin(admin.ModelAdmin):
    list_display = ['name', 'restaurant', 'price', 'is_available', 'is_featured']
    list_filter = ['is_available', 'is_featured']