import os
from dotenv import load_dotenv

# Load standard .env if exists
load_dotenv()

def get_api_keys():
    """
    Retrieves API keys for Groq and OpenRouter.
    Looks in system environment variables, then falls back to parsing Apikeys.txt.
    """
    keys = {
        "groq": os.getenv("GROQ_API_KEY"),
        "openrouter": os.getenv("OPENROUTER_API_KEY")
    }

    # If keys are not present in environment, check the Apikeys.txt file in the parent folder
    possible_paths = [
        os.path.join(os.path.dirname(__file__), "..", "..", "Apikeys.txt"),
        os.path.join(os.path.dirname(__file__), "..", "Apikeys.txt"),
        "../Apikeys.txt",
        "Apikeys.txt"
    ]

    for path in possible_paths:
        if os.path.exists(path):
            try:
                with open(path, "r") as f:
                    lines = f.readlines()
                    for line in lines:
                        if ":" in line:
                            parts = line.split(":", 1)
                            key_type = parts[0].strip().lower()
                            value = parts[1].strip()
                            
                            if "groq" in key_type and not keys["groq"]:
                                keys["groq"] = value
                            elif ("open router" in key_type or "openrouter" in key_type) and not keys["openrouter"]:
                                keys["openrouter"] = value
            except Exception as e:
                print(f"Error reading {path}: {e}")
            break

    # Final fallbacks to default placeholders if absolutely empty
    if not keys["groq"]:
        keys["groq"] = ""
    if not keys["openrouter"]:
        keys["openrouter"] = ""

    return keys
