from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils import timezone
import random


class User(AbstractUser):
    """
    We extend Django's built-in User model instead of building from scratch.
    This gives us username, password, first_name, last_name, is_active, etc. for free.
    We only ADD the fields we need on top.
    """

    ROLES = (
        ('customer', 'Customer'),
        ('restaurant_owner', 'Restaurant Owner'),
        ('driver', 'Driver'),
        ('admin', 'Admin'),
    )

    # Override email to make it unique — we use it to log in
    email = models.EmailField(unique=True)

    # Which type of user is this?
    role = models.CharField(max_length=20, choices=ROLES, default='customer')

    # Optional phone number
    phone = models.CharField(max_length=15, blank=True)

    # Has the user verified their email?
    is_verified = models.BooleanField(default=False)

    # OTP fields — store the code and when it was created
    otp_code = models.CharField(max_length=6, blank=True, null=True)
    otp_created_at = models.DateTimeField(blank=True, null=True)

    # Use email to log in instead of username
    USERNAME_FIELD = 'email'

    # username is still required when creating a superuser
    REQUIRED_FIELDS = ['username']

    def generate_otp(self):
        """Generate a random 6-digit OTP and save it with the current time."""
        self.otp_code = str(random.randint(100000, 999999))
        self.otp_created_at = timezone.now()
        self.save()
        return self.otp_code

    def is_otp_valid(self, code):
        """Check if the given code matches and hasn't expired (10 min limit)."""
        if not self.otp_code or not self.otp_created_at:
            return False
        # How many seconds since the OTP was created?
        seconds_passed = (timezone.now() - self.otp_created_at).seconds
        is_expired = seconds_passed > 600  # 600 seconds = 10 minutes
        return self.otp_code == code and not is_expired

    def __str__(self):
        return f"{self.email} ({self.role})"