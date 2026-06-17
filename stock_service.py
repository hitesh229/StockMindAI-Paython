import yfinance from yf

def get_stock(stock_name):

    stock = yf.Tricker(stock_name)

    data = stock.history(period="1d")

    return data