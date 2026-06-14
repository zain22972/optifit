import sys
import os
import json
import base64

# Add project root to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from backend.app import app

# Create a tiny 1x1 transparent PNG in base64
TINY_PNG_BASE64 = (
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8"
    "AAAAASUVORK5CYII="
)

with app.test_client() as client:
    # 1. Log in to get token
    login_resp = client.post('/login', json={'email': 'jane@optifit.com', 'password': 'user123'})
    print("Login Status Code:", login_resp.status_code)
    login_data = login_resp.get_json()
    token = login_data.get('token')
    print("Token retrieved:", "Yes" if token else "No")

    # 2. Call /wardrobe/analyze-photo
    headers = {
        'Authorization': f'Bearer {token}',
        'Content-Type': 'application/json'
    }
    
    # Try calling without Gemini API Key environment variable first
    # (or with whatever is present)
    has_api_key = os.environ.get("GEMINI_API_KEY") is not None
    print(f"GEMINI_API_KEY present in environment: {has_api_key}")
    
    payload = {
        'image': TINY_PNG_BASE64
    }
    
    resp = client.post('/wardrobe/analyze-photo', json=payload, headers=headers)
    print("Analyze API Status Code:", resp.status_code)
    try:
        response_json = resp.get_json()
        print("Analyze API Response:", json.dumps(response_json, indent=2))
        
        if not has_api_key:
            if resp.status_code == 400 and "Gemini API Key is missing" in response_json.get("message", ""):
                print("SUCCESS: Missing API key handled correctly.")
            else:
                print("FAILURE: Did not handle missing API key as expected.")
        else:
            if resp.status_code == 200 and "item" in response_json:
                print("SUCCESS: Gemini successfully analyzed item and saved it.")
            else:
                print("FAILURE: API did not return expected response when API Key is set.")
    except Exception as e:
        print("Error reading response:", str(e))
