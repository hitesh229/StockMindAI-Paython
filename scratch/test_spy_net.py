import requests
import warnings
warnings.filterwarnings("ignore")

base_url = "https://localhost:7026/api"

# Register a test user
reg_url = f"{base_url}/auth/register"
reg_payload = {
    "username": "testuser_spy",
    "email": "testuser_spy@example.com",
    "password": "Password123!",
    "riskAppetite": "Medium",
    "investmentGoals": "Growth"
}

login_url = f"{base_url}/auth/login"
login_payload = {
    "usernameOrEmail": "testuser_spy",
    "password": "Password123!"
}

session = requests.Session()
session.verify = False  # Skip SSL verification for local dev certs

# 1. Try to Login
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
    
    # 2. Query SPY Details
    print("\n2. Fetching details for SPY...")
    res_spy = session.get(f"{base_url}/stock/details/SPY", timeout=5)
    print("SPY Details Status:", res_spy.status_code)
    if res_spy.status_code == 200:
        print("Success! Details object returned.")
        print(res_spy.json())
    else:
        print("Error details:", res_spy.text)
else:
    print("Failed to authenticate.")
