from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from app.core.config import get_settings
from app.models.schemas import TokenData 
from app.core.database import get_database

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/auth/token")
settings = get_settings()

import sys

async def get_current_user(token: str = Depends(oauth2_scheme), db = Depends(get_database)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        print(f"DEBUG: Validating token: {token[:15]}...", file=sys.stderr)
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        
        email: str = payload.get("sub")
        user_id: str = payload.get("id")
        
        print(f"DEBUG: Payload Email: {email}, ID: {user_id}", file=sys.stderr)
        
        if email is None or user_id is None:
            print("DEBUG: Missing email or user_id", file=sys.stderr)
            raise credentials_exception
            
        token_data = TokenData(email=email, user_id=user_id)
    except JWTError as e:
        print(f"DEBUG: JWT Error: {str(e)}", file=sys.stderr)
        raise credentials_exception
        
    user = await db.users.find_one({"user_id": token_data.user_id})
    
    if user is None:
        print(f"DEBUG: User NOT found in DB. ID: {token_data.user_id}", file=sys.stderr)
        # Try listing all users to see what's there
        all_users = await db.users.find({}).to_list(length=5)
        print(f"DEBUG: Users in DB: {[u.get('user_id') for u in all_users]}", file=sys.stderr)
        raise credentials_exception
        
    print(f"DEBUG: User found: {user['email']}", file=sys.stderr)
    return user
