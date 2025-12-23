from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from datetime import timedelta, datetime, timezone
import uuid
from app.core.database import get_database
from app.core.security import verify_password, get_password_hash, create_access_token
from app.core.config import get_settings
from app.models.schemas import UserCreate, UserResponse, Token
from app.services.auth import get_current_user

router = APIRouter()
settings = get_settings()

# IST timezone (UTC+5:30)
IST = timezone(timedelta(hours=5, minutes=30))

def get_ist_now():
    """Get current time in IST"""
    return datetime.now(IST)

@router.post("/register", response_model=Token)
async def register(user: UserCreate, db = Depends(get_database)):
    existing_user = await db.users.find_one({"email": user.email})
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    user_id = str(uuid.uuid4())
    hashed_password = get_password_hash(user.password)
    
    new_user = {
        "user_id": user_id,
        "email": user.email,
        "password": hashed_password,
        "created_at": get_ist_now()
    }
    
    insert_result = await db.users.insert_one(new_user)
    print(f"DEBUG: Inserted user {new_user['email']} with ID {user_id}. Result: {insert_result.inserted_id}")
    
    # Verify insertion
    saved_user = await db.users.find_one({"user_id": user_id})
    if saved_user:
        print("DEBUG: Verification successful - User found in DB")
    else:
        print("DEBUG: CRITICAL - User NOT found in DB after insert!")
    
    access_token = create_access_token(
        data={"sub": user.email, "id": user_id},
        expires_delta=timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    
    return {
        "access_token": access_token, 
        "token_type": "bearer",
        "user": new_user
    }

@router.post("/login", response_model=Token)
# Note: Allows using JSON body {"email": "...", "password": "..."} instead of form data if you prefer,
# but OAuth2 spec uses form data. We'll support standard JSON login to match standard frontend practice easily.
async def login(user_data: UserCreate, db = Depends(get_database)):
    print(f"DEBUG: Login attempt for {user_data.email}")
    user = await db.users.find_one({"email": user_data.email})
    
    if not user:
        print(f"DEBUG: Login failed - User {user_data.email} not found in DB")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
        
    print(f"DEBUG: User found. Checking password...")
    # Debug password comparison (Be careful in production!)
    is_match = verify_password(user_data.password, user["password"])
    print(f"DEBUG: Password match result: {is_match}")
    if not is_match:
        print(f"DEBUG: stored password: {user['password'][:10]}... (is hash? {user['password'].startswith('$')})")
    
    if not is_match:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token = create_access_token(
        data={"sub": user["email"], "id": user["user_id"]},
        expires_delta=timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    
    return {
        "access_token": access_token, 
        "token_type": "bearer",
        "user": user
    }

@router.get("/me", response_model=UserResponse)
async def read_users_me(current_user = Depends(get_current_user)):
    return current_user
