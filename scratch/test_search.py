import requests

query = "NIFTY"
url = f"https://query2.finance.yahoo.com/v1/finance/search?q={query}"
headers = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"}

try:
    response = requests.get(url, headers=headers, timeout=5)
    print("Status:", response.status_code)
    data = response.json()
    quotes = data.get("quotes", [])
    print(f"Found {len(quotes)} quotes:")
    for q in quotes[:8]:
        print(f"- Symbol: {q.get('symbol')}, Name: {q.get('shortname') or q.get('longname')}, Type: {q.get('quoteType')}, Exchange: {q.get('exchange')}")
except Exception as e:
    print("Error:", e)
