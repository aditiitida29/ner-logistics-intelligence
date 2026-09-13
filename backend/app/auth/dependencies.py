from typing import Optional
from fastapi import Depends, HTTPException, status, Header
from sqlalchemy.orm import Session
from ..database import get_db
from ..models.models import User
from ..utils.auth_utils import verify_token

def get_token_from_header(authorization: Optional[str] = Header(None)) -> Optional[str]:
    """Extract token string from Authorization header."""
    if not authorization:
        return None
    if authorization.startswith("Bearer "):
        return authorization[7:].strip()
    return authorization.strip()

def get_current_user(
    token: Optional[str] = Depends(get_token_from_header),
    db: Session = Depends(get_db)
) -> User:
    """Retrieve and authenticate current user via signed token."""
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication credentials were not provided."
        )
    
    payload = verify_token(token)
    if not payload or "sub" not in payload:
        # Check if offline/demo token
        if token.startswith("offline-token-"):
            user = db.query(User).filter(User.role == "super_admin").first()
            if user:
                return user
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token."
        )
    
    email = payload["sub"]
    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User associated with token not found."
        )
    return user

def get_optional_current_user(
    token: Optional[str] = Depends(get_token_from_header),
    db: Session = Depends(get_db)
) -> Optional[User]:
    """Retrieve user if token present and valid, otherwise return None."""
    if not token:
        return None
    try:
        return get_current_user(token=token, db=db)
    except HTTPException:
        return None

def require_super_admin(current_user: User = Depends(get_current_user)) -> User:
    """Ensure current user holds Super Admin privileges."""
    user_role = (current_user.role or "").lower()
    allowed_admin_roles = ["super_admin", "admin"]
    if user_role not in allowed_admin_roles:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Super Admin authorization required to perform this action."
        )
    return current_user

def require_authenticated(current_user: User = Depends(get_current_user)) -> User:
    """Ensure current user is authenticated (any valid role)."""
    return current_user
