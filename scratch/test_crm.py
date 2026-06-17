import requests

url_py = "https://stockmindai-backend.onrender.com/api/analyze/technical"
payload = {"symbol": "CRM"}

try:
    res = requests.post(url_py, json=payload, timeout=5)
    print("Status code:", res.status_code)
    if res.status_code == 200:
        print("Success!", res.json().get("symbol"), "price =", res.json().get("current_price"))
    else:
        print("Error content:", res.text)
except Exception as e:
    print("Error:", e)
