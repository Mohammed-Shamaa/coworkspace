from pathlib import Path
from datetime import timedelta
from dotenv import load_dotenv
import os

# Load all variables from .env file
load_dotenv()

BASE_DIR = Path(__file__).resolve().parent.parent

# Read SECRET_KEY from .env — never hardcode this
SECRET_KEY = os.getenv('SECRET_KEY')

# True during development, must be False in production
DEBUG = os.getenv('DEBUG') == 'True'

ALLOWED_HOSTS = []

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    # Third party packages
    'rest_framework',                           # Django REST Framework
    'rest_framework_simplejwt',                 # JWT authentication
    'rest_framework_simplejwt.token_blacklist', # Needed to invalidate tokens on logout
    'corsheaders',                              # Allow React to call our APIs
    'social_django',                            # Google OAuth
    # Our apps
    'users',
    'restaurants',
    'orders',
]

MIDDLEWARE = [
    # CORS middleware must be FIRST
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'core.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
                # Required by social_django (Google OAuth)
                'social_django.context_processors.backends',
                'social_django.context_processors.login_redirect',
            ],
        },
    },
]

WSGI_APPLICATION = 'core.wsgi.application'

# SQLite for development — no setup needed
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}

AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator'},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]

# Keep English so all error messages are consistent
LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'Asia/Gaza'
USE_I18N = True
USE_TZ = True
STATIC_URL = 'static/'
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# ─── Custom User Model ─────────────────────────────────────────────────────
# Tell Django to use OUR User model instead of the default one
# Must be set BEFORE the first migration
AUTH_USER_MODEL = 'users.User'

# ─── Authentication Backends ───────────────────────────────────────────────
# Django checks these in order when someone tries to log in
# First tries Google OAuth, then falls back to normal email/password
AUTHENTICATION_BACKENDS = [
    'social_core.backends.google.GoogleOAuth2',
    'django.contrib.auth.backends.ModelBackend',
]

# ─── Django REST Framework ─────────────────────────────────────────────────
REST_FRAMEWORK = {
    # Every API request must include a valid JWT token
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ),
    # By default all endpoints require login
    # We override this on specific views (register, login, google)
    'DEFAULT_PERMISSION_CLASSES': (
        'rest_framework.permissions.IsAuthenticated',
    ),
}

# ─── JWT Settings ──────────────────────────────────────────────────────────
SIMPLE_JWT = {
    # Access token expires after 1 hour — used to call APIs
    'ACCESS_TOKEN_LIFETIME': timedelta(hours=1),
    # Refresh token expires after 7 days — used to get a new access token
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
}

# ─── CORS ──────────────────────────────────────────────────────────────────
# Only allow requests from our React app
CORS_ALLOWED_ORIGINS = [
    'http://localhost:5173',  # Vite default port
]

# ─── Email (Gmail SMTP) ────────────────────────────────────────────────────
EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST = 'smtp.gmail.com'      # ← غيّرها لـ Gmail
EMAIL_PORT = 587
EMAIL_USE_TLS = True
EMAIL_HOST_USER = os.getenv('EMAIL_HOST_USER')
EMAIL_HOST_PASSWORD = os.getenv('EMAIL_HOST_PASSWORD')
DEFAULT_FROM_EMAIL = os.getenv('EMAIL_HOST_USER')

# ─── Google OAuth ──────────────────────────────────────────────────────────
SOCIAL_AUTH_GOOGLE_OAUTH2_KEY = os.getenv('GOOGLE_CLIENT_ID')
SOCIAL_AUTH_GOOGLE_OAUTH2_SECRET = os.getenv('GOOGLE_CLIENT_SECRET')

# What info we request from Google about the user
SOCIAL_AUTH_GOOGLE_OAUTH2_SCOPE = [
    'https://www.googleapis.com/auth/userinfo.email',
    'https://www.googleapis.com/auth/userinfo.profile',
]

# Steps Django runs after Google confirms the user's identity
SOCIAL_AUTH_PIPELINE = (
    'social_core.pipeline.social_auth.social_details',   # Get user info from Google
    'social_core.pipeline.social_auth.social_uid',       # Get unique Google ID
    'social_core.pipeline.social_auth.auth_allowed',     # Check if login is allowed
    'social_core.pipeline.social_auth.social_user',      # Find existing user
    'social_core.pipeline.user.get_username',            # Set username
    'social_core.pipeline.user.create_user',             # Create user if new
    'users.pipeline.set_verified',                       # Our custom step: mark as verified
    'social_core.pipeline.social_auth.associate_user',
    'social_core.pipeline.social_auth.load_extra_data',
    'social_core.pipeline.user.user_details',
)

# ─── Frontend URL ──────────────────────────────────────────────────────────
# Used to build the email verification link sent to the user
FRONTEND_URL = 'http://localhost:5173'