import requests
import warnings
warnings.filterwarnings("ignore")

base_url = "https://stockmindai-backend.onrender.com/api"

# Login
login_url = f"{base_url}/auth/login"
login_payload = {
    "usernameOrEmail": "testuser_spy",
    "password": "Password123!"
}

session = requests.Session()

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
    
    # Query details with query parameter in URL: /stock/details?symbol=MRF.NS
    print("\n2. Querying stock details for 'MRF.NS' (via query parameter)...")
    res_details = session.get(f"{base_url}/stock/details?symbol=MRF.NS", timeout=5)
    print("Status Code:", res_details.status_code)
    if res_details.status_code == 200:
        print("Success! Details object returned.")
        print("Symbol:", res_details.json().get("symbol"))
    else:
        print("Response Content:", res_details.text)
        
    # Query predictions with query parameter in URL: /ai/predict?symbol=MRF.NS
    print("\n3. Querying AI predictions for 'MRF.NS' (via query parameter)...")
    res_pred = session.get(f"{base_url}/ai/predict?symbol=MRF.NS", timeout=5)
    print("Status Code:", res_pred.status_code)
    if res_pred.status_code == 200:
        print("Success! Predictions returned.")
    else:
        print("Response Content:", res_pred.text)
else:
    print("Authentication failed.")
