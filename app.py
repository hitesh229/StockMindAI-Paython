from flask import Flask, request, jsonify
from chatbot import ask_ai

app = Flask(__name__)

@app.route('/')
def home():
    return "AI Service Running"

@app.route('/chat', methods=['POST'])
def chat():

    data = request.json
    question = data['question']

    response = ask_ai(question)

    return jsonify(response)

if __name__ == '__main__':
    app.run(debug=True)