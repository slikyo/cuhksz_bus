import json

from bson import json_util
from flask import Flask, render_template, request, Response, current_app
from flask_socketio import SocketIO

from src.models.bus import Bus
from src.common.utils import Utils
from src.models.spot import Spot
from src.common.database import Database
from datetime import datetime,timezone,timedelta

app = Flask(__name__)
app.config.from_object('src.config')
socketio = SocketIO(app, async_mode=None, cors_allowed_origins='*')
Database.initialize()
tz = timezone(timedelta(hours=+8))


@app.route('/bus')
def hello_world():
    return render_template('home.jinja2')


@app.route('/upload', methods=['POST'])
def data_from_test():
    data_uploaded = request.get_json()
    for data in data_uploaded:
        utc_time = datetime.strptime(str(data['time']), '%Y%m%d%H%M%S').astimezone(tz)
        arrival_time = datetime.strptime(str(data['arrival_time']), '%Y%m%d%H%M%S').astimezone(tz)
        bus = data['bus']
        dir = data['dir']
        next_stop = data['next_stop']
        current_location = data['current_location']
        loc = app.config['STOPS'][current_location]
        Database.remove(collection='buses', query={'bus': bus})
        bus = Bus(utc_time=utc_time,
                  arrival_time=arrival_time,
                  current_location=current_location,
                  bus=bus,
                  dir=dir,
                  next_stop=next_stop,
                  loc=loc)
        bus.save_to_mongo()
        current_app.logger.info('save result to mongo')
        socketio.emit("updates", "data needs updates", namespace='/bus')
        return Response(status=200)
    return Response(status=500)


@app.route('/clear', methods=['POST'])
def clear_db():
    print('removing data')
    Database.remove('spots', {})
    socketio.emit("clear_map", "clear all data", namespace='/bus')
    return render_template('upload_data.jinja2')


@socketio.on('get_spots', namespace='/bus')
def get_posts(msg):
    result = json.loads(msg)
    ne = [result['Ne'], result['Zd']]
    sw = [result['Je'], result['Xd']]
    # spots = Database.find_range(collection='buses', sw=sw, ne=ne)
    spots = Database.find(collection='buses',query={})
    results_json = json.dumps(list(spots), default=json_util.default)
    print(results_json)
    socketio.emit('get_spots', results_json, namespace='/bus', room=request.sid)
