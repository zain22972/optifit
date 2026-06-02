# OptiFit 2.0 Database Connection Helpers
import os
import sqlite3

DB_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', 'database', 'optifit.db'))

def get_db():
    """
    Returns a new SQLite connection with sqlite3.Row formatting
    and foreign key constraints enabled.
    """
    if not os.path.exists(DB_PATH):
        raise FileNotFoundError(f"Database file not found at {DB_PATH}. Please run the seeder first.")
        
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON;")
    return conn
