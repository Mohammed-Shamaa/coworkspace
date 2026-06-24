from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from .models import User


class RegisterSerializer(serializers.ModelSerializer):
    """
    Handles user registration.
    Serializers convert Python objects to JSON and validate incoming data.
    """

    # write_only=True means this field is accepted in requests but never returned in responses
    password = serializers.CharField(write_only=True, validators=[validate_password])
    password2 = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['username', 'email', 'phone', 'role', 'password', 'password2']

    def validate(self, attrs):
        """Called automatically — check that both passwords match."""
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({"password": "Passwords don't match."})
        return attrs

    def create(self, validated_data):
        """
        Create the user after validation passes.
        We remove password2 since the User model doesn't have that field.
        create_user() hashes the password automatically — never store plain text.
        """
        validated_data.pop('password2')
        return User.objects.create_user(**validated_data)


class VerifyOTPSerializer(serializers.Serializer):
    """Simple serializer to accept email + OTP from the request."""
    email = serializers.EmailField()
    otp = serializers.CharField(max_length=6)


class UserSerializer(serializers.ModelSerializer):
    """Used to return user data in responses (profile, after login, etc.)"""
    class Meta:
        model = User
        # Never include password here
        fields = ['id', 'username', 'email', 'phone', 'role', 'is_verified']