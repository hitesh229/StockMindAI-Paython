import requests
import warnings
warnings.filterwarnings("ignore")

base_url = "https://stockmindai-backend.onrender.com/api"

# Register a test user
reg_url = f"{base_url}/auth/register"
reg_payload = {
    "username": "testuser_search",
    "email": "testuser_search@example.com",
    "password": "Password123!",
    "riskAppetite": "Medium",
    "investmentGoals": "Growth"
}

login_url = f"{base_url}/auth/login"
login_payload = {
    "usernameOrEmail": "testuser_search",
    "password": "Password123!"
}

session = requests.Session()
session.verify = False  # Skip SSL verification for local dev certs

# 1. Try to Login (if user already exists)
print("1. Attempting login...")
res = session.post(login_url, json=login_payload, timeout=5)
token = None
if res.status_code == 200:
    token = res.json().get("token")
    print("Login successful! Token obtained.")
else:
    print("Login failed, attempting registration...")
    res_reg = session.post(reg_url, json=reg_payload, timeout=5)
    print("Registration status:", res_reg.status_code)
    if res_reg.status_code == 200:
        token = res_reg.json().get("token")
        print("Registration successful! Token obtained.")
    else:
        print("Registration failed. Content:", res_reg.text)

if token:
    session.headers.update({"Authorization": f"Bearer {token}"})
    
    # 2. Query AAPL Details
    print("\n2. Fetching details for AAPL...")
    res_aapl = session.get(f"{base_url}/stock/details/AAPL", timeout=5)
    print("AAPL Details Status:", res_aapl.status_code)
    if res_aapl.status_code == 200:
        print("Success! Title:", res_aapl.json().get("symbol"), "Price:", res_aapl.json().get("current_price"))
    else:
        print("Error details:", res_aapl.text)
        
    # 3. Query MRF Details
    print("\n3. Fetching details for MRF...")
    res_mrf = session.get(f"{base_url}/stock/details/MRF", timeout=5)
    print("MRF Details Status:", res_mrf.status_code)
    if res_mrf.status_code == 200:
        print("Success! Title:", res_mrf.json().get("symbol"), "Price:", res_mrf.json().get("current_price"))
    else:
        print("Error details:", res_mrf.text)
else:
    print("Failed to authenticate.")
