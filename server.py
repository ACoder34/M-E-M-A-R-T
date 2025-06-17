from flask import Flask, request, send_from_directory, jsonify
import requests
import os

app = Flask(__name__, static_folder='.')
WEBHOOK_URL = 'https://discord.com/api/webhooks/1384446683760295956/9BykH5Bxpkc2vKaclLBf-Yw0ppBjaNK5OTLlZDDoUD5A748VLF5O6DCx790a9TJ-uy6c'

@app.route('/')
def index():
    return send_from_directory('.', 'index.html')

@app.route('/<path:path>')
def static_files(path):
    return send_from_directory('.', path)

@app.route('/checkout', methods=['POST'])
def checkout():
    data = request.json
    embed = {
        "title": "New Order Placed!",
        "color": 0x64ffda,
        "fields": [
            {"name": "Email", "value": data.get('email', ''), "inline": True},
            {"name": "Discord Username", "value": data.get('discord', ''), "inline": True},
            {"name": "Items", "value": '\n'.join([f"{i['name']} x{i['qty']} - ${i['price']}" for i in data.get('items', [])]), "inline": False},
        ],
        "timestamp": __import__('datetime').datetime.utcnow().isoformat()
    }
    requests.post(WEBHOOK_URL, json={"embeds": [embed]})
    return jsonify({"ok": True})

if __name__ == '__main__':
    app.run(port=int(os.environ.get('PORT', 3000)), debug=True) 