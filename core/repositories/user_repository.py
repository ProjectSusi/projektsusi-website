"""
User Repository Implementation
Handles user data persistence with SQLite support
"""

import logging
import sqlite3
from datetime import datetime, timezone
from typing import Optional, List, Dict, Any
from pathlib import Path
import json

from .interfaces import IUserRepository
from .models import User

logger = logging.getLogger(__name__)


class SQLiteUserRepository(IUserRepository):
    """SQLite implementation of user repository"""
    
    def __init__(self, db_path: str = "data/rag_database.db"):
        self.db_path = db_path
        if db_path != ":memory:":
            self._ensure_database_exists()
        self._create_tables()
    
    def _ensure_database_exists(self):
        """Ensure database directory exists"""
        db_file = Path(self.db_path)
        db_file.parent.mkdir(parents=True, exist_ok=True)
    
    def _create_tables(self):
        """Create user tables if they don't exist"""
        try:
            # Store connection to ensure it persists for :memory: databases
            if self.db_path == ":memory:" and not hasattr(self, '_conn'):
                self._conn = sqlite3.connect(self.db_path, check_same_thread=False)
                conn = self._conn
            else:
                conn = sqlite3.connect(self.db_path)
            
            with conn:
                conn.execute("""
                    CREATE TABLE IF NOT EXISTS users (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        tenant_id INTEGER NOT NULL DEFAULT 1,
                        username TEXT UNIQUE NOT NULL,
                        email TEXT UNIQUE NOT NULL,  
                        password_hash TEXT NOT NULL,
                        role TEXT NOT NULL DEFAULT 'user',
                        is_active BOOLEAN NOT NULL DEFAULT 1,
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        last_login TIMESTAMP NULL,
                        metadata TEXT DEFAULT '{}'
                    )
                """)
                
                # Create indexes for performance
                conn.execute("CREATE INDEX IF NOT EXISTS idx_users_username ON users(username)")
                conn.execute("CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)")
                conn.execute("CREATE INDEX IF NOT EXISTS idx_users_tenant ON users(tenant_id)")
                conn.execute("CREATE INDEX IF NOT EXISTS idx_users_active ON users(is_active)")
                
                conn.commit()
                logger.info("User tables created successfully")
            
            # Close connection if not in-memory
            if self.db_path != ":memory:":
                conn.close()
                
        except Exception as e:
            logger.error(f"Failed to create user tables: {e}")
            raise
    
    def _row_to_user(self, row: sqlite3.Row) -> User:
        """Convert database row to User object"""
        metadata = {}
        if row['metadata']:
            try:
                metadata = json.loads(row['metadata'])
            except json.JSONDecodeError:
                logger.warning(f"Invalid metadata JSON for user {row['id']}")
        
        return User(
            id=row['id'],
            tenant_id=row['tenant_id'],
            username=row['username'],
            email=row['email'],
            password_hash=row['password_hash'],
            role=row['role'],
            is_active=bool(row['is_active']),
            created_at=datetime.fromisoformat(row['created_at']) if row['created_at'] else None,
            last_login=datetime.fromisoformat(row['last_login']) if row['last_login'] else None,
            metadata=metadata
        )
    
    def _get_connection(self):
        """Get database connection"""
        if self.db_path == ":memory:" and hasattr(self, '_conn'):
            return self._conn
        else:
            return sqlite3.connect(self.db_path)

    async def create(self, user: User) -> User:
        """Create a new user"""
        try:
            conn = self._get_connection()
            with conn:
                conn.row_factory = sqlite3.Row
                
                # Set created_at if not provided
                if not user.created_at:
                    user.created_at = datetime.now(timezone.utc)
                
                # Convert metadata to JSON
                metadata_json = json.dumps(user.metadata) if user.metadata else '{}'
                
                # Debug parameters
                params = (
                    user.tenant_id,
                    user.username,
                    user.email,
                    user.password_hash,
                    str(user.role),  # Ensure role is string
                    int(user.is_active),  # Ensure boolean is int
                    user.created_at.isoformat(),
                    user.last_login.isoformat() if user.last_login else None,
                    metadata_json
                )
                logger.debug(f"Insert parameters: {params}")
                logger.debug(f"Parameter types: {[type(p) for p in params]}")
                
                cursor = conn.execute("""
                    INSERT INTO users (tenant_id, username, email, password_hash, role, 
                                     is_active, created_at, last_login, metadata)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                """, params)
                
                user.id = cursor.lastrowid
                conn.commit()
                
                logger.info(f"Created user: {user.username} (ID: {user.id})")
                
            # Close connection if not in-memory
            if self.db_path != ":memory:":
                conn.close()
                
            return user
                
        except sqlite3.IntegrityError as e:
            if "username" in str(e):
                raise ValueError("Username already exists")
            elif "email" in str(e):
                raise ValueError("Email already exists")
            else:
                raise ValueError(f"User creation failed: {e}")
        except Exception as e:
            logger.error(f"Failed to create user: {e}")
            raise
    
    async def get_by_id(self, user_id: int) -> Optional[User]:
        """Get user by ID"""
        try:
            conn = self._get_connection()
            conn.row_factory = sqlite3.Row
            
            cursor = conn.execute("SELECT * FROM users WHERE id = ?", (user_id,))
            row = cursor.fetchone()
            
            result = self._row_to_user(row) if row else None
            
            # Close connection if not in-memory
            if self.db_path != ":memory:":
                conn.close()
                
            return result
                
        except Exception as e:
            logger.error(f"Failed to get user by ID {user_id}: {e}")
            return None
    
    async def get_by_username(self, username: str) -> Optional[User]:
        """Get user by username"""
        try:
            conn = self._get_connection()
            conn.row_factory = sqlite3.Row
            
            cursor = conn.execute("SELECT * FROM users WHERE username = ?", (username,))
            row = cursor.fetchone()
            
            result = self._row_to_user(row) if row else None
            
            # Close connection if not in-memory
            if self.db_path != ":memory:":
                conn.close()
                
            return result
                
        except Exception as e:
            logger.error(f"Failed to get user by username {username}: {e}")
            return None
    
    async def get_by_email(self, email: str) -> Optional[User]:
        """Get user by email"""
        try:
            conn = self._get_connection()
            conn.row_factory = sqlite3.Row
            
            cursor = conn.execute("SELECT * FROM users WHERE email = ?", (email,))
            row = cursor.fetchone()
            
            result = self._row_to_user(row) if row else None
            
            # Close connection if not in-memory
            if self.db_path != ":memory:":
                conn.close()
                
            return result
                
        except Exception as e:
            logger.error(f"Failed to get user by email {email}: {e}")
            return None
    
    async def update(self, user_id: int, updates: Dict[str, Any]) -> User:
        """Update user"""
        try:
            with sqlite3.connect(self.db_path) as conn:
                conn.row_factory = sqlite3.Row
                
                # Convert metadata to JSON if present
                if 'metadata' in updates:
                    updates['metadata'] = json.dumps(updates['metadata'])
                
                # Build update query dynamically
                set_clauses = []
                values = []
                
                for key, value in updates.items():
                    if key != 'id':  # Don't allow ID updates
                        set_clauses.append(f"{key} = ?")
                        values.append(value)
                
                if not set_clauses:
                    raise ValueError("No valid fields to update")
                
                values.append(user_id)
                
                query = f"UPDATE users SET {', '.join(set_clauses)} WHERE id = ?"
                conn.execute(query, values)
                conn.commit()
                
                # Return updated user
                updated_user = await self.get_by_id(user_id)
                if updated_user:
                    logger.info(f"Updated user: {updated_user.username} (ID: {user_id})")
                
                return updated_user
                
        except Exception as e:
            logger.error(f"Failed to update user {user_id}: {e}")
            raise
    
    async def delete(self, user_id: int) -> bool:
        """Delete user"""
        try:
            with sqlite3.connect(self.db_path) as conn:
                cursor = conn.execute("DELETE FROM users WHERE id = ?", (user_id,))
                conn.commit()
                
                deleted = cursor.rowcount > 0
                if deleted:
                    logger.info(f"Deleted user ID: {user_id}")
                
                return deleted
                
        except Exception as e:
            logger.error(f"Failed to delete user {user_id}: {e}")
            return False
    
    async def list_all(self, tenant_id: Optional[int] = None) -> List[User]:
        """List all users, optionally filtered by tenant"""
        try:
            with sqlite3.connect(self.db_path) as conn:
                conn.row_factory = sqlite3.Row
                
                if tenant_id is not None:
                    cursor = conn.execute(
                        "SELECT * FROM users WHERE tenant_id = ? ORDER BY created_at DESC", 
                        (tenant_id,)
                    )
                else:
                    cursor = conn.execute("SELECT * FROM users ORDER BY created_at DESC")
                
                rows = cursor.fetchall()
                return [self._row_to_user(row) for row in rows]
                
        except Exception as e:
            logger.error(f"Failed to list users: {e}")
            return []
    
    async def update_last_login(self, user_id: int, login_time: datetime) -> bool:
        """Update user's last login time"""
        try:
            conn = self._get_connection()
            with conn:
                cursor = conn.execute(
                    "UPDATE users SET last_login = ? WHERE id = ?",
                    (login_time.isoformat(), user_id)
                )
                conn.commit()
                
                updated = cursor.rowcount > 0
                if updated:
                    logger.debug(f"Updated last login for user {user_id}")
            
            # Close connection if not in-memory
            if self.db_path != ":memory:":
                conn.close()
                
            return updated
                
        except Exception as e:
            logger.error(f"Failed to update last login for user {user_id}: {e}")
            return False
    
    async def deactivate_user(self, user_id: int) -> bool:
        """Deactivate a user account"""
        try:
            with sqlite3.connect(self.db_path) as conn:
                cursor = conn.execute(
                    "UPDATE users SET is_active = 0 WHERE id = ?",
                    (user_id,)
                )
                conn.commit()
                
                deactivated = cursor.rowcount > 0
                if deactivated:
                    logger.info(f"Deactivated user ID: {user_id}")
                
                return deactivated
                
        except Exception as e:
            logger.error(f"Failed to deactivate user {user_id}: {e}")
            return False
    
    async def activate_user(self, user_id: int) -> bool:
        """Activate a user account"""
        try:
            with sqlite3.connect(self.db_path) as conn:
                cursor = conn.execute(
                    "UPDATE users SET is_active = 1 WHERE id = ?",
                    (user_id,)
                )
                conn.commit()
                
                activated = cursor.rowcount > 0
                if activated:
                    logger.info(f"Activated user ID: {user_id}")
                
                return activated
                
        except Exception as e:
            logger.error(f"Failed to activate user {user_id}: {e}")
            return False
    
    async def get_active_users(self, tenant_id: Optional[int] = None) -> List[User]:
        """Get all active users"""
        try:
            with sqlite3.connect(self.db_path) as conn:
                conn.row_factory = sqlite3.Row
                
                if tenant_id is not None:
                    cursor = conn.execute(
                        "SELECT * FROM users WHERE is_active = 1 AND tenant_id = ? ORDER BY username",
                        (tenant_id,)
                    )
                else:
                    cursor = conn.execute(
                        "SELECT * FROM users WHERE is_active = 1 ORDER BY username"
                    )
                
                rows = cursor.fetchall()
                return [self._row_to_user(row) for row in rows]
                
        except Exception as e:
            logger.error(f"Failed to get active users: {e}")
            return []
    
    async def get_users_by_role(self, role: str, tenant_id: Optional[int] = None) -> List[User]:
        """Get users by role"""
        try:
            with sqlite3.connect(self.db_path) as conn:
                conn.row_factory = sqlite3.Row
                
                if tenant_id is not None:
                    cursor = conn.execute(
                        "SELECT * FROM users WHERE role = ? AND tenant_id = ? ORDER BY username",
                        (role, tenant_id)
                    )
                else:
                    cursor = conn.execute(
                        "SELECT * FROM users WHERE role = ? ORDER BY username",
                        (role,)
                    )
                
                rows = cursor.fetchall()
                return [self._row_to_user(row) for row in rows]
                
        except Exception as e:
            logger.error(f"Failed to get users by role {role}: {e}")
            return []
    
    async def count_users(self, tenant_id: Optional[int] = None) -> int:
        """Count total users"""
        try:
            with sqlite3.connect(self.db_path) as conn:
                if tenant_id is not None:
                    cursor = conn.execute(
                        "SELECT COUNT(*) FROM users WHERE tenant_id = ?",
                        (tenant_id,)
                    )
                else:
                    cursor = conn.execute("SELECT COUNT(*) FROM users")
                
                return cursor.fetchone()[0]
                
        except Exception as e:
            logger.error(f"Failed to count users: {e}")
            return 0

    async def count(self, tenant_id: Optional[int] = None) -> int:
        """Count total users (alias for count_users)"""
        return await self.count_users(tenant_id)

    async def exists(self, user_id: int) -> bool:
        """Check if user exists"""
        user = await self.get_by_id(user_id)
        return user is not None