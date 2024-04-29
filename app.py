from flask import Flask, render_template, request
from flask_sockets import Sockets
import json
from gevent import pywsgi
from geventwebsocket.handler import WebSocketHandler

app = Flask(__name__)
sockets = Sockets(app)

# Game state variables
current_direction = None
players = []
food = [100, 100]  # Initial food position

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/favicon.ico')
def favicon():
    return '', 204

@sockets.route('/game')
def game_socket(ws):
    global current_direction, players
    while not ws.closed:
        message = ws.receive()
        if message is not None:
            data = json.loads(message)
            player_id = ws  # Assuming socket object uniquely identifies player
            for player in players:
                if player['id'] == player_id:
                    player['direction'] = data.get('direction')
                    break
            current_direction = update_game_state(players)
            ws.send(json.dumps({'direction': current_direction, 'players': players, 'food': food}))

def update_game_state(players):
    for player in players:
        direction = player.get('direction')
        if direction:
            move_player(player, direction)
    check_collisions()

def move_player(player, direction):
    x, y = player['position']
    dx, dy = direction
    player['position'] = [x + dx * BLOCK_SIZE, y + dy * BLOCK_SIZE]

def check_collisions():
    # Implement collision detection logic here
    pass

@app.before_request
def verify_websocket_handshake():
    if request.path == '/game' and request.headers.get('Upgrade', '').lower() != 'websocket':
        return 'Invalid WebSocket handshake request.', 400

if __name__ == '__main__':
    server = pywsgi.WSGIServer(('localhost', 3000), app, handler_class=WebSocketHandler)
    print("Server running on port 3000")
    server.serve_forever()
