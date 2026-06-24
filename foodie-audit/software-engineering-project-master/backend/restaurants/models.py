from django.db import models
from users.models import User


class Restaurant(models.Model):
    """
    Represents a restaurant in the system.
    A restaurant is owned by a user with role 'restaurant_owner'.
    Admin must approve it before it appears to customers.
    """
    owner = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='restaurants'
    )
    name = models.CharField(max_length=150)
    description = models.TextField(blank=True)
    phone = models.CharField(max_length=20, blank=True)
    address = models.CharField(max_length=255)
    area = models.CharField(max_length=120)
    city = models.CharField(max_length=80, default='Gaza')
    latitude = models.DecimalField(max_digits=10, decimal_places=7, null=True, blank=True)
    longitude = models.DecimalField(max_digits=10, decimal_places=7, null=True, blank=True)
    logo_url = models.URLField(max_length=500, blank=True)
    cover_url = models.URLField(max_length=500, blank=True)
    is_open = models.BooleanField(default=True)
    is_approved = models.BooleanField(default=False)  # Admin approves
    delivery_radius_km = models.DecimalField(max_digits=5, decimal_places=2, default=5.00)
    avg_delivery_min = models.PositiveSmallIntegerField(default=30)
    minimum_order = models.DecimalField(max_digits=8, decimal_places=2, default=0.00)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.name} ({'Open' if self.is_open else 'Closed'})"


class Category(models.Model):
    """
    A category belongs to a restaurant (e.g. Shawarma, Drinks, Pizza).
    Used to group menu items.
    """
    restaurant = models.ForeignKey(
        Restaurant,
        on_delete=models.CASCADE,
        related_name='categories'
    )
    name = models.CharField(max_length=80)
    display_order = models.PositiveSmallIntegerField(default=0)

    class Meta:
        ordering = ['display_order']

    def __str__(self):
        return f"{self.name} — {self.restaurant.name}"


class MenuItem(models.Model):
    """
    A menu item belongs to a category and a restaurant.
    restaurant field is kept directly for faster queries.
    """
    category = models.ForeignKey(
        Category,
        on_delete=models.CASCADE,
        related_name='items'
    )
    restaurant = models.ForeignKey(
        Restaurant,
        on_delete=models.CASCADE,
        related_name='menu_items'
    )
    name = models.CharField(max_length=150)
    description = models.TextField(blank=True)
    price = models.DecimalField(max_digits=8, decimal_places=2)
    image_url = models.URLField(max_length=500, blank=True)
    is_available = models.BooleanField(default=True)
    is_featured = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.name} — {self.price} ILS"