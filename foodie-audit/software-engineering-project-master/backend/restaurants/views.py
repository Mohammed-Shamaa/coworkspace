from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import Restaurant, Category, MenuItem
from .serializers import (
    RestaurantListSerializer,
    RestaurantDetailSerializer,
    RestaurantManageSerializer,
    MenuItemManageSerializer,
    CategorySerializer,
)


class IsRestaurantOwner(permissions.BasePermission):
    """Only users with role 'restaurant_owner' can access."""
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'restaurant_owner'


class IsAdmin(permissions.BasePermission):
    """Only users with role 'admin' can access."""
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'admin'


# ─── US-002: Customer browses restaurants ─────────────────────────────────

class RestaurantListView(generics.ListAPIView):
    """
    GET /api/restaurants/
    Returns all approved and open restaurants.
    No login required — any visitor can browse.
    """
    serializer_class = RestaurantListSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        queryset = Restaurant.objects.filter(is_approved=True)

        # Filter by area if provided: /api/restaurants/?area=Al-Rimal
        area = self.request.query_params.get('area')
        if area:
            queryset = queryset.filter(area__icontains=area)

        # Filter by open status: /api/restaurants/?is_open=true
        is_open = self.request.query_params.get('is_open')
        if is_open is not None:
            queryset = queryset.filter(is_open=is_open.lower() == 'true')

        # Search by name: /api/restaurants/?search=shawarma
        search = self.request.query_params.get('search')
        if search:
            queryset = queryset.filter(name__icontains=search)

        return queryset


class RestaurantDetailView(generics.RetrieveAPIView):
    """
    GET /api/restaurants/<id>/
    Returns full restaurant details with menu categories and items.
    No login required.
    """
    serializer_class = RestaurantDetailSerializer
    permission_classes = [permissions.AllowAny]
    queryset = Restaurant.objects.filter(is_approved=True)


# ─── US-004: Restaurant owner manages their restaurant ────────────────────

class MyRestaurantView(generics.RetrieveUpdateAPIView):
    """
    GET /api/restaurants/my-restaurant/  — view my restaurant
    PUT /api/restaurants/my-restaurant/  — update my restaurant
    Only accessible by restaurant owners.
    """
    serializer_class = RestaurantManageSerializer
    permission_classes = [IsRestaurantOwner]

    def get_object(self):
        try:
            return Restaurant.objects.get(owner=self.request.user)
        except Restaurant.DoesNotExist:
            return None

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        if not instance:
            return Response(
                {"error": "You don't have a restaurant yet."},
                status=status.HTTP_404_NOT_FOUND
            )
        return Response(RestaurantManageSerializer(instance).data)


class CreateRestaurantView(generics.CreateAPIView):
    """
    POST /api/restaurants/create/
    Restaurant owner creates their restaurant.
    Starts as unapproved — admin must approve.
    """
    serializer_class = RestaurantManageSerializer
    permission_classes = [IsRestaurantOwner]


class MenuItemListView(generics.ListAPIView):
    """
    GET /api/restaurants/my-restaurant/items/
    Restaurant owner views all their menu items.
    """
    serializer_class = MenuItemManageSerializer
    permission_classes = [IsRestaurantOwner]

    def get_queryset(self):
        try:
            restaurant = Restaurant.objects.get(owner=self.request.user)
            return MenuItem.objects.filter(restaurant=restaurant)
        except Restaurant.DoesNotExist:
            return MenuItem.objects.none()


class MenuItemCreateView(generics.CreateAPIView):
    """
    POST /api/restaurants/my-restaurant/items/create/
    Restaurant owner adds a new menu item.
    Automatically sets the restaurant from the logged-in owner.
    """
    serializer_class = MenuItemManageSerializer
    permission_classes = [IsRestaurantOwner]

    def perform_create(self, serializer):
        # Get the restaurant that belongs to this owner
        try:
            restaurant = Restaurant.objects.get(owner=self.request.user)
        except Restaurant.DoesNotExist:
            from rest_framework.exceptions import ValidationError
            raise ValidationError({"error": "You don't have a restaurant yet."})

        # Automatically set the restaurant — owner doesn't need to send it
        serializer.save(restaurant=restaurant)


class MenuItemUpdateView(generics.RetrieveUpdateDestroyAPIView):
    """
    GET    /api/restaurants/my-restaurant/items/<id>/  — view item
    PUT    /api/restaurants/my-restaurant/items/<id>/  — update item
    DELETE /api/restaurants/my-restaurant/items/<id>/  — delete item
    """
    serializer_class = MenuItemManageSerializer
    permission_classes = [IsRestaurantOwner]

    def get_queryset(self):
        try:
            restaurant = Restaurant.objects.get(owner=self.request.user)
            return MenuItem.objects.filter(restaurant=restaurant)
        except Restaurant.DoesNotExist:
            return MenuItem.objects.none()


# ─── US-008: Admin approves restaurants and drivers ───────────────────────

class AdminRestaurantApproveView(APIView):
    """
    POST /api/restaurants/admin/approve/<id>/
    Admin approves or rejects a restaurant.
    Body: { "is_approved": true } or { "is_approved": false }
    """
    permission_classes = [IsAdmin]

    def post(self, request, pk):
        try:
            restaurant = Restaurant.objects.get(pk=pk)
        except Restaurant.DoesNotExist:
            return Response({"error": "Restaurant not found."}, status=404)

        is_approved = request.data.get('is_approved')
        if is_approved is None:
            return Response({"error": "is_approved field is required."}, status=400)

        restaurant.is_approved = is_approved
        restaurant.save()

        action = "approved" if is_approved else "rejected"
        return Response({"message": f"Restaurant {action} successfully."})


class AdminPendingRestaurantsView(generics.ListAPIView):
    """
    GET /api/restaurants/admin/pending/
    Admin views all restaurants waiting for approval.
    """
    serializer_class = RestaurantListSerializer
    permission_classes = [IsAdmin]

    def get_queryset(self):
        return Restaurant.objects.filter(is_approved=False)