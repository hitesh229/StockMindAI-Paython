import requests

# Test Python API
url_py = "http://127.0.0.1:8000/api/analyze/technical"
payload = {"symbol": "AAPL"}
try:
    print("Testing Python /api/analyze/technical for AAPL...")
    res = requests.post(url_py, json=payload, timeout=5)
    print("Python API status:", res.status_code)
    if res.status_code == 200:
        data = res.json()
        print("Success! Symbol:", data.get("symbol"), "Current Price:", data.get("current_price"))
    else:
        print("Error content:", res.text)
except Exception as e:
    print("Python API error:", e)

# Test with MRF
payload_mrf = {"symbol": "MRF"}
try:
    print("\nTesting Python /api/analyze/technical for MRF...")
    res = requests.post(url_py, json=payload_mrf, timeout=5)
    print("Python API status:", res.status_code)
    if res.status_code == 200:
        data = res.json()
        print("Success! Symbol:", data.get("symbol"), "Current Price:", data.get("current_price"))
    else:
        print("Error content:", res.text)
except Exception as e:
    print("Python API error:", e)
