from django.urls import path
from .views import (
    RestaurantListView,
    RestaurantDetailView,
    MyRestaurantView,
    CreateRestaurantView,
    MenuItemListView,
    MenuItemCreateView,
    MenuItemUpdateView,
    AdminRestaurantApproveView,
    AdminPendingRestaurantsView,
)

urlpatterns = [
    # US-002 — Customer browses
    path('', RestaurantListView.as_view()),                          # GET all restaurants
    path('<int:pk>/', RestaurantDetailView.as_view()),               # GET one restaurant + menu

    # US-004 — Restaurant owner manages
    path('my-restaurant/', MyRestaurantView.as_view()),              # GET/PUT my restaurant
    path('create/', CreateRestaurantView.as_view()),                 # POST create restaurant
    path('my-restaurant/items/', MenuItemListView.as_view()),        # GET my items
    path('my-restaurant/items/create/', MenuItemCreateView.as_view()),  # POST add item
    path('my-restaurant/items/<int:pk>/', MenuItemUpdateView.as_view()), # GET/PUT/DELETE item

    # US-008 — Admin approves
    path('admin/pending/', AdminPendingRestaurantsView.as_view()),   # GET pending restaurants
    path('admin/approve/<int:pk>/', AdminRestaurantApproveView.as_view()),  # POST approve
]