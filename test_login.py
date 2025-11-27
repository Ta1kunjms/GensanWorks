import requests
import json

try:
    print("🔐 Testing login endpoint...")
    url = "http://localhost:5000/api/admin/login"
    data = {
        "email": "admin@local.test",
        "password": "adminpass"
    }
    
    print(f"POST {url}")
    print(f"Body: {json.dumps(data)}")
    
    response = requests.post(url, json=data, timeout=5)
    
    print(f"\nStatus: {response.status_code}")
    print(f"Response:\n{json.dumps(response.json(), indent=2)}")
    
except Exception as e:
    print(f"❌ Error: {e}")
