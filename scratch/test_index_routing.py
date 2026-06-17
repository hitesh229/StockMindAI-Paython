import requests
import warnings
warnings.filterwarnings("ignore")

base_url = "https://localhost:7026/api"

# Login
login_url = f"{base_url}/auth/login"
login_payload = {
    "usernameOrEmail": "testuser_spy",
    "password": "Password123!"
}

session = requests.Session()
session.verify = False  # Disable SSL verification

print("1. Logging in...")
res = session.post(login_url, json=login_payload, timeout=5)
token = None
if res.status_code == 200:
    token = res.json().get("token")
    print("Login successful!")
else:
    print("Login failed:", res.text)

if token:
    session.headers.update({"Authorization": f"Bearer {token}"})
    
    # Query details with ^ in URL: ^NSEI
    # Note: we need to test both unencoded and encoded
    print("\n2. Querying stock details for '^NSEI' (unencoded)...")
    res_details = session.get(f"{base_url}/stock/details/^NSEI", timeout=5)
    print("Status Code (Unencoded):", res_details.status_code)
    if res_details.status_code != 200:
        print("Response Content (Unencoded):", res_details.text)
        
    print("\n3. Querying stock details for '%5ENSEI' (encoded)...")
    res_details_enc = session.get(f"{base_url}/stock/details/%5ENSEI", timeout=5)
    print("Status Code (Encoded):", res_details_enc.status_code)
    if res_details_enc.status_code != 200:
        print("Response Content (Encoded):", res_details_enc.text)
else:
    print("Authentication failed.")
