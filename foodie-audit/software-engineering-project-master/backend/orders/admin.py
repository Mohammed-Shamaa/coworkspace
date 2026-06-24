from django.contrib import admin
from .models import Driver, DeliveryAddress

@admin.register(Driver)
class DriverAdmin(admin.ModelAdmin):
    list_display = ['user', 'vehicle_type', 'is_available', 'is_approved']
    list_filter = ['is_available', 'is_approved', 'vehicle_type']

@admin.register(DeliveryAddress)
class DeliveryAddressAdmin(admin.ModelAdmin):
    list_display = ['user', 'label', 'area', 'city', 'is_default']