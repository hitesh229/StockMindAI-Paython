import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

class Config:
    """
    Configuration class for StockMindAI Python AI Engine
    Loads URLs and settings from environment variables
    """
    
    # Frontend Configuration
    FRONTEND_BASE_URL = os.getenv("FRONTEND_BASE_URL", "https://stock-mind-ai-front-end.vercel.app/")
    
    # .NET Backend Configuration
    DOTNET_BACKEND_BASE_URL = os.getenv("DOTNET_BACKEND_BASE_URL", "https://stockmindai-backend.onrender.com/")
    DOTNET_SWAGGER_URL = os.getenv("DOTNET_SWAGGER_URL", "https://stockmindai-backend.onrender.com/Swagger/index.html")
    
    # .NET Backend API Endpoints
    DOTNET_AUTH_LOGIN = f"{DOTNET_BACKEND_BASE_URL}api/auth/login"
    DOTNET_STOCK_DETAILS = f"{DOTNET_BACKEND_BASE_URL}api/stock/details"
    DOTNET_AI_PREDICT = f"{DOTNET_BACKEND_BASE_URL}api/ai/predict"
    DOTNET_TECHNICAL_ANALYSIS = f"{DOTNET_BACKEND_BASE_URL}api/analyze/technical"
    
    # API Keys
    GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")
    OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY", "")
    
    # Flask/FastAPI Configuration
    DEBUG = os.getenv("DEBUG", "False").lower() == "true"
    
    @staticmethod
    def get_config():
        """Returns the configuration object"""
        return Config
