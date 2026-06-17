import os

search_dir = "d:/Hitesh/MCA sem-4 Project/StockMindAI"
for root, dirs, files in os.walk(search_dir):
    if "venv" in root or ".vs" in root or "bin" in root or "obj" in root or "node_modules" in root:
        continue
    for file in files:
        if file.endswith((".py", ".cs", ".js", ".jsx")):
            path = os.path.join(root, file)
            try:
                with open(path, "r", encoding="utf-8") as f:
                    content = f.read()
                if "yf." in content or "yfinance" in content:
                    print(f"Found yfinance in: {path}")
                    lines = content.splitlines()
                    for idx, line in enumerate(lines):
                        if "yf." in line or "yfinance" in line:
                            print(f"  Line {idx+1}: {line.strip()}")
            except Exception as e:
                pass
