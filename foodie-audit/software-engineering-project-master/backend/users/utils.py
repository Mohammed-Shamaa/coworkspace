from django.core.mail import send_mail
from django.conf import settings
from django.utils.http import urlsafe_base64_encode
from django.utils.encoding import force_bytes
from django.contrib.auth.tokens import default_token_generator


def send_verification_email(user):
    """
    Send a verification email with two options:
    1. A clickable link (easiest for the user)
    2. A 6-digit OTP code (useful if the link doesn't work)
    """

    # Generate and save a fresh OTP for this user
    otp = user.generate_otp()

    # Build the verification link
    # urlsafe_base64_encode — converts the user's ID to a safe URL string
    # make_token — generates a secure one-time token tied to this user
    uid = urlsafe_base64_encode(force_bytes(user.pk))
    token = default_token_generator.make_token(user)
    verification_link = f"{settings.FRONTEND_URL}/verify-email/{uid}/{token}/"

    send_mail(
        subject="Verify your account — Gaza Delivery",
        message=f"""
Hi {user.username}!

Welcome to Gaza Delivery Platform!

Please verify your email using one of these two methods:

Method 1 — Click the link below:
{verification_link}

Method 2 — Enter this OTP code in the app:
{otp}
(This code expires in 10 minutes)

If you did not create this account, you can safely ignore this email.

— Gaza Delivery Team
        """,
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=[user.email],
        fail_silently=False,  # If sending fails, raise an error (don't silently fail)
    )