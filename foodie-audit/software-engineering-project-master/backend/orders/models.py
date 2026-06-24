from django.db import models
from users.models import User


class Driver(models.Model):
    """
    A driver is a user with role 'driver'.
    Admin must approve them before they can receive orders.
    Tracks live GPS location for delivery assignment.
    """
    VEHICLE_TYPES = (
        ('bicycle', 'Bicycle'),
        ('motorcycle', 'Motorcycle'),
        ('car', 'Car'),
        ('on_foot', 'On Foot'),
    )

    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name='driver_profile'
    )
    vehicle_type = models.CharField(
        max_length=20,
        choices=VEHICLE_TYPES,
        default='motorcycle'
    )
    vehicle_plate = models.CharField(max_length=20, blank=True)
    is_available = models.BooleanField(default=False)
    current_lat = models.DecimalField(max_digits=10, decimal_places=7, null=True, blank=True)
    current_lng = models.DecimalField(max_digits=10, decimal_places=7, null=True, blank=True)
    location_updated_at = models.DateTimeField(null=True, blank=True)
    is_approved = models.BooleanField(default=False)  # Admin approves
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.email} — {self.vehicle_type}"


class DeliveryAddress(models.Model):
    """
    A customer can have multiple delivery addresses.
    Only one can be marked as default.
    """
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='addresses'
    )
    label = models.CharField(max_length=60, default='Home')
    street = models.CharField(max_length=255)
    area = models.CharField(max_length=120)
    city = models.CharField(max_length=80, default='Gaza')
    latitude = models.DecimalField(max_digits=10, decimal_places=7, null=True, blank=True)
    longitude = models.DecimalField(max_digits=10, decimal_places=7, null=True, blank=True)
    is_default = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.label} — {self.user.email}"