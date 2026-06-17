import requests

base_url = "http://localhost:5113/api"

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
    
    # Query Autocomplete for CRM
    print("\n2. Querying autocomplete suggestions for 'CRM'...")
    res_search = session.get(f"{base_url}/stock/search?q=CRM", timeout=5)
    print("Search Status:", res_search.status_code)
    if res_search.status_code == 200:
        data = res_search.json()
        quotes = data.get("quotes", [])
        print(f"Success! Found {len(quotes)} suggestions:")
        for q in quotes[:3]:
            print(f"- Symbol: {q.get('symbol')}, Name: {q.get('name')}, Exchange: {q.get('exchange')}")
    else:
        print("Error details:", res_search.text)
else:
    print("Authentication failed.")
