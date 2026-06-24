from rest_framework import generics, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from .models import User
from .serializers import UserSerializer
from orders.models import Driver
from restaurants.models import Restaurant


class IsAdmin(permissions.BasePermission):
    """Only admin users can access these endpoints."""
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'admin'


# ─── Users Management ─────────────────────────────────────────────────────

class AdminUserListView(generics.ListAPIView):
    """
    GET /api/admin/users/
    Returns all users in the system.
    Admin can filter by role.
    """
    serializer_class = UserSerializer
    permission_classes = [IsAdmin]

    def get_queryset(self):
        queryset = User.objects.all().order_by('-date_joined')

        # Filter by role: /api/admin/users/?role=driver
        role = self.request.query_params.get('role')
        if role:
            queryset = queryset.filter(role=role)

        # Search by email or username
        search = self.request.query_params.get('search')
        if search:
            queryset = queryset.filter(email__icontains=search)

        return queryset


class AdminUserToggleView(APIView):
    """
    POST /api/admin/users/<id>/toggle/
    Admin activates or deactivates a user account.
    Body: { "is_active": true/false }
    """
    permission_classes = [IsAdmin]

    def post(self, request, pk):
        try:
            user = User.objects.get(pk=pk)
        except User.DoesNotExist:
            return Response({"error": "User not found."}, status=404)

        is_active = request.data.get('is_active')
        if is_active is None:
            return Response({"error": "is_active field is required."}, status=400)

        user.is_active = is_active
        user.save()

        action = "activated" if is_active else "deactivated"
        return Response({"message": f"User {action} successfully."})


# ─── Drivers Management ────────────────────────────────────────────────────

class AdminDriverListView(generics.ListAPIView):
    """
    GET /api/admin/drivers/
    Returns all drivers — approved and pending.
    """
    permission_classes = [IsAdmin]

    def get(self, request):
        drivers = Driver.objects.select_related('user').all()
        data = []
        for driver in drivers:
            data.append({
                "id": driver.id,
                "email": driver.user.email,
                "username": driver.user.username,
                "phone": driver.user.phone,
                "vehicle_type": driver.vehicle_type,
                "vehicle_plate": driver.vehicle_plate,
                "is_available": driver.is_available,
                "is_approved": driver.is_approved,
                "created_at": driver.created_at,
            })
        return Response(data)


class AdminDriverApproveView(APIView):
    """
    POST /api/admin/drivers/<id>/approve/
    Admin approves or rejects a driver.
    Body: { "is_approved": true/false }
    """
    permission_classes = [IsAdmin]

    def post(self, request, pk):
        try:
            driver = Driver.objects.get(pk=pk)
        except Driver.DoesNotExist:
            return Response({"error": "Driver not found."}, status=404)

        is_approved = request.data.get('is_approved')
        if is_approved is None:
            return Response({"error": "is_approved field is required."}, status=400)

        driver.is_approved = is_approved
        driver.save()

        action = "approved" if is_approved else "rejected"
        return Response({"message": f"Driver {action} successfully."})


# ─── Stats ─────────────────────────────────────────────────────────────────

class AdminStatsView(APIView):
    """
    GET /api/admin/stats/
    Returns general statistics for the admin dashboard.
    """
    permission_classes = [IsAdmin]

    def get(self, request):
        return Response({
            "users": {
                "total": User.objects.count(),
                "customers": User.objects.filter(role='customer').count(),
                "restaurant_owners": User.objects.filter(role='restaurant_owner').count(),
                "drivers": User.objects.filter(role='driver').count(),
            },
            "restaurants": {
                "total": Restaurant.objects.count(),
                "approved": Restaurant.objects.filter(is_approved=True).count(),
                "pending": Restaurant.objects.filter(is_approved=False).count(),
            },
            "drivers": {
                "total": Driver.objects.count(),
                "approved": Driver.objects.filter(is_approved=True).count(),
                "pending": Driver.objects.filter(is_approved=False).count(),
                "available": Driver.objects.filter(is_available=True).count(),
            },
        })