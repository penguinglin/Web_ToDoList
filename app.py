from flask import Flask, render_template, request, jsonify
import json
import os

app = Flask(__name__)

EVENTS_FILE = "events.json"

def load_events():
    if os.path.exists(EVENTS_FILE):
        try:
            with open(EVENTS_FILE, "r", encoding="utf-8") as f:
                return json.load(f)
        except json.JSONDecodeError as e:
            print("⚠️ 無法解析 JSON 初始化為空列表")
            return []
    return []

def save_events(events):
    with open(EVENTS_FILE, "w", encoding="utf-8") as f:
        json.dump(events, f, ensure_ascii=False, indent=2)

@app.route('/')
def index():
    events = load_events()
    return render_template('index.html', events=events)

@app.route('/add_event', methods=['POST'])
def add_event():
    try:
        event = request.get_json()
        print("✅ 收到新增事件：", event)

        # 檢查欄位
        if not event or 'title' not in event or 'date' not in event:
            return jsonify({"status": "bad request"}), 400

        events = load_events()
        events.append(event)
        save_events(events)
        return jsonify({"status": "success"})
    except Exception as e:
        print("❌ 發生錯誤：", e)
        return jsonify({"status": "error", "message": str(e)}), 500
    
@app.route('/get_events')
def get_events():
    date = request.args.get("date")
    events = load_events()
    filtered = [e for e in events if e["date"] == date]
    return jsonify({"events": filtered})


@app.route('/delete_event', methods=['POST'])
def delete_event():
    try:
        data = request.get_json()
        date = data.get('date')
        index = data.get('index')
        events = load_events()

        # 根據日期篩選符合的事件
        events_for_date = [e for e in events if e['date'] == date]
        if 0 <= index < len(events_for_date):
            target_event = events_for_date[index]
            events.remove(target_event)
            save_events(events)
            return jsonify({"status": "deleted"})
        else:
            return jsonify({"status": "invalid index"}), 400
    except Exception as e:
        print("❌ 刪除事件時發生錯誤：", e)
        return jsonify({"status": "error", "message": str(e)}), 500

@app.route('/toggle_done', methods=['POST'])
def toggle_done():
    try:
        data = request.get_json()
        date = data.get('date')
        index = data.get('index')
        events = load_events()

        events_for_date = [e for e in events if e['date'] == date]
        if 0 <= index < len(events_for_date):
            target_event = events_for_date[index]
            target_event['done'] = not target_event.get('done', False)
            save_events(events)
            return jsonify({"status": "toggled"})
        else:
            return jsonify({"status": "invalid index"}), 400
    except Exception as e:
        print("❌ 勾選完成時發生錯誤：", e)
        return jsonify({"status": "error", "message": str(e)}), 500


if __name__ == '__main__':
    app.run(debug=True)
