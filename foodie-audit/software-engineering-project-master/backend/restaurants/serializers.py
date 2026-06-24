from rest_framework import serializers
from .models import Restaurant, Category, MenuItem


class MenuItemSerializer(serializers.ModelSerializer):
    """
    Serializer for menu items.
    Used when customer browses a restaurant's menu.
    """
    class Meta:
        model = MenuItem
        fields = [
            'id', 'name', 'description', 'price',
            'image_url', 'is_available', 'is_featured'
        ]


class CategorySerializer(serializers.ModelSerializer):
    """
    Serializer for categories.
    Includes all menu items inside each category.
    """
    items = MenuItemSerializer(many=True, read_only=True)

    class Meta:
        model = Category
        fields = ['id', 'name', 'display_order', 'items']


class RestaurantListSerializer(serializers.ModelSerializer):
    """
    Used when listing all restaurants (browse page).
    Lightweight — no menu items included.
    """
    class Meta:
        model = Restaurant
        fields = [
            'id', 'name', 'description', 'logo_url', 'cover_url',
            'area', 'city', 'is_open', 'avg_delivery_min',
            'minimum_order', 'delivery_radius_km'
        ]


class RestaurantDetailSerializer(serializers.ModelSerializer):
    """
    Used when customer opens a specific restaurant.
    Includes full menu with categories and items.
    """
    categories = CategorySerializer(many=True, read_only=True)

    class Meta:
        model = Restaurant
        fields = [
            'id', 'name', 'description', 'phone',
            'logo_url', 'cover_url', 'address', 'area', 'city',
            'is_open', 'avg_delivery_min', 'minimum_order',
            'delivery_radius_km', 'categories'
        ]


class RestaurantManageSerializer(serializers.ModelSerializer):
    """
    Used by restaurant owner to create or update their restaurant.
    """
    class Meta:
        model = Restaurant
        fields = [
            'id', 'name', 'description', 'phone', 'address',
            'area', 'city', 'latitude', 'longitude',
            'logo_url', 'cover_url', 'is_open',
            'delivery_radius_km', 'avg_delivery_min', 'minimum_order'
        ]

    def create(self, validated_data):
        # Automatically set the owner to the logged-in user
        validated_data['owner'] = self.context['request'].user
        return super().create(validated_data)


class MenuItemManageSerializer(serializers.ModelSerializer):
    """
    Used by restaurant owner to add or update menu items.
    """
    class Meta:
        model = MenuItem
        fields = [
            'id', 'category', 'name', 'description',
            'price', 'image_url', 'is_available', 'is_featured'
        ]

    def validate_category(self, category):
        # Make sure the category belongs to the owner's restaurant
        user = self.context['request'].user
        if category.restaurant.owner != user:
            raise serializers.ValidationError(
                "This category does not belong to your restaurant."
            )
        return category