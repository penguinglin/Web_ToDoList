# Python Project - TO DO LIST(Simple version)
```
calendar_app/
├── app.py (主要routers)
├── events.json (行事曆記錄檔)
├── special_days.json (特別倒數的紀錄檔)
├── templates/
│   └── index.html (架構)
└── static/
    ├── moods.json (沒用^^但不能刪掉因為我懶得改扣)
    ├── style.css (樣式)
    └── script.js (互動)
```  

## Execute Tips

* package
> pip install flask

> python.exe -m pip install --upgrade pip (Optional)

* execute
```
# local vscode
# create venv
.\venv\bin\Activate.ps1
<!-- 
    Ctrl+Alt+P 
    ->  python: select interpreter
    ->  find interpreter location: .\venv\bin\python.exe
-->
python app.py
```

```
# use gitHub
pip install flask
python app.py
```
## Work
1. 行事曆
    * 新增
    * 完成
    * 刪除
2. 抽籤
    * 抽到爽
3. 特別倒數日
    * 不能刪除
    * 不能選過去的日子(計數會出錯)