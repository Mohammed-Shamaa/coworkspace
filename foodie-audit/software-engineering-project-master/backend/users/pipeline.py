def set_verified(backend, user, response, *args, **kwargs):
    """
    This runs automatically after Google confirms who the user is.
    Since Google already verified their email, we trust it and mark them as verified.
    No need for them to click a verification link.
    """
    if backend.name == 'google-oauth2':
        if not user.is_verified:
            user.is_verified = True
            user.save()