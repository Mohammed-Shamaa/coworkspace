from django.urls import path
from .admin_views import (
    AdminUserListView,
    AdminUserToggleView,
    AdminDriverListView,
    AdminDriverApproveView,
    AdminStatsView,
)

urlpatterns = [
    path('users/', AdminUserListView.as_view()),
    path('users/<int:pk>/toggle/', AdminUserToggleView.as_view()),
    path('drivers/', AdminDriverListView.as_view()),
    path('drivers/<int:pk>/approve/', AdminDriverApproveView.as_view()),
    path('stats/', AdminStatsView.as_view()),
]