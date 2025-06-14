from flask import Flask, render_template, request, jsonify
import json, os, random, datetime

app = Flask(__name__)

EVENTS_FILE = "events.json"
MOODS_FILE = "/static/moods.json"
SPECIAL_DAYS_FILE = "special_days.json"

def load_json(file):
    if os.path.exists(file):
        try:
            with open(file, "r", encoding="utf-8") as f:
                return json.load(f)
        except:
            return []
    return []

def save_json(file, data):
    with open(file, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

@app.route('/')
def index():
    return render_template("index.html")

@app.route('/get_events')
def get_events():
    date = request.args.get("date")
    all_events = load_json(EVENTS_FILE)
    if date:
        filtered = [e for e in all_events if e["date"] == date]
        return jsonify({"events": filtered})
    return jsonify({"events": all_events})

@app.route('/add_event', methods=['POST'])
def add_event():
    data = request.get_json()
    if not data or 'title' not in data or 'date' not in data:
        return jsonify({"status": "bad request"}), 400
    events = load_json(EVENTS_FILE)
    data["done"] = False
    events.append(data)
    save_json(EVENTS_FILE, events)
    return jsonify({"status": "success"})

@app.route('/delete_event', methods=['POST'])
def delete_event():
    data = request.get_json()
    index = data.get("index")
    date = data.get("date")
    events = load_json(EVENTS_FILE)
    filtered = [e for e in events if e["date"] == date]
    if 0 <= index < len(filtered):
        item_to_delete = filtered[index]
        events.remove(item_to_delete)
        save_json(EVENTS_FILE, events)
        return jsonify({"status": "deleted"})
    return jsonify({"status": "invalid index"}), 400

@app.route('/toggle_done', methods=['POST'])
def toggle_done():
    data = request.get_json()
    index = data.get("index")
    date = data.get("date")
    events = load_json(EVENTS_FILE)
    filtered = [e for e in events if e["date"] == date]
    if 0 <= index < len(filtered):
        target = filtered[index]
        for e in events:
            if e == target:
                e["done"] = not e.get("done", False)
        save_json(EVENTS_FILE, events)
        return jsonify({"status": "toggled"})
    return jsonify({"status": "invalid index"}), 400

@app.route('/add_mood', methods=["POST"])
def add_mood():
    data = request.get_json()
    date = data.get("date")
    mood = data.get("mood")
    moods = load_json(MOODS_FILE)
    moods = [m for m in moods if m["date"] != date]
    moods.append({"date": date, "mood": mood})
    save_json(MOODS_FILE, moods)
    return jsonify({"status": "ok"})

@app.route('/add_special_day', methods=["POST"])
def add_special_day():
    data = request.get_json()
    date = data.get("date")
    title = data.get("title")
    specials = load_json(SPECIAL_DAYS_FILE)
    specials.append({"date": date, "title": title})
    save_json(SPECIAL_DAYS_FILE, specials)
    return jsonify({"status": "ok"})

@app.route('/get_special_days')
def get_special_days():
    specials = load_json(SPECIAL_DAYS_FILE)
    return jsonify(specials)

@app.route('/countdown')
def countdown():
    today = datetime.date.today()
    specials = load_json(SPECIAL_DAYS_FILE)
    result = []
    for s in specials:
        target = datetime.datetime.strptime(s["date"], "%Y-%m-%d").date()
        delta = (target - today).days
        result.append({"title": s["title"], "days_left": delta})
    return jsonify({"specials": result})

@app.route('/draw_luck')
def draw_luck():
    choices = ["大吉", "中吉", "小吉", "兇"]
    return jsonify({"fortune": random.choice(choices)})


# add part
# end 




if __name__ == '__main__':
    app.run(debug=True)
