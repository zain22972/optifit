import sys
import os

# Add project root to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from backend.app import app
import json

with app.test_client() as client:
    resp1 = client.post('/login', json={'email': 'admin@optifit.com', 'password': 'admin123'})
    print("Admin Login Status:", resp1.status_code)
    
    resp2 = client.post('/login', json={'email': 'jane@optifit.com', 'password': 'user123'})
    print("Jane Login Status:", resp2.status_code)
    if resp2.status_code != 200:
        print("Jane Error:", resp2.get_json())
