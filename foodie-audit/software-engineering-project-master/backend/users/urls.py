from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    RegisterView,
    CustomLoginView,        # Our custom login that blocks unverified users
    VerifyEmailLinkView,
    VerifyOTPView,
    GoogleAuthView,
    LogoutView,
    ProfileView,
)

urlpatterns = [
    # Register a new account — sends verification email automatically
    path('register/', RegisterView.as_view()),

    # Login with email + password — blocked if email not verified
    path('login/', CustomLoginView.as_view()),

    # Get a new access token using the refresh token (when access expires)
    path('login/refresh/', TokenRefreshView.as_view()),

    # Logout — blacklists the refresh token
    path('logout/', LogoutView.as_view()),

    # View or update profile (requires login)
    path('profile/', ProfileView.as_view()),

    # Verify email by clicking the link sent in the email
    path('verify-email/<uidb64>/<token>/', VerifyEmailLinkView.as_view()),

    # Verify email by submitting the 6-digit OTP code
    path('verify-otp/', VerifyOTPView.as_view()),

    # Login or register with Google
    path('google/', GoogleAuthView.as_view()),
]