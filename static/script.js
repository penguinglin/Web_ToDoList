document.addEventListener("DOMContentLoaded", function () {
  const calendarEl = document.getElementById("calendar");
  const todoList = document.getElementById("todo-list");
  const eventForm = document.getElementById("event-form");
  const titleInput = document.getElementById("title");
  const selectedDateDisplay = document.getElementById("selected-date");
  const moodInput = document.getElementById("mood-input");
  const saveMoodBtn = document.getElementById("save-mood");
  const fortuneDisplay = document.getElementById("fortune-display");
  const drawLuckBtn = document.getElementById("draw-luck");
  const specialTitleInput = document.getElementById("special-title");
  const specialDateInput = document.getElementById("special-date");
  const addSpecialBtn = document.getElementById("add-special");
  const countdownList = document.getElementById("countdown-list");

  let selectedDate = new Date().toISOString().split("T")[0];

  const calendar = new FullCalendar.Calendar(calendarEl, {
    initialView: "dayGridMonth",
    dateClick: function (info) {
      selectedDate = info.dateStr;
      selectedDateDisplay.textContent = `📅 ${selectedDate} 的待辦`;
      loadEvents();
      highlightSelectedDate(selectedDate);
    },
    events: async function (info, successCallback) {
      const res = await fetch("/get_events");
      const data = await res.json();
      const moods = await fetch("/get_events?type=mood").then(r => r.json()).catch(() => []);
      const specials = await fetch("/countdown").then(r => r.json()).catch(() => ({ specials: [] }));
      const moodData = await fetch("/static/moods.json").then(r => r.json()).catch(() => []);
      const specialData = await fetch("/get_special_days").then(res => res.json());

      const all = data.events.map(e => ({
        title: e.title,
        date: e.date,
        color: e.done ? "#bbb" : "#1abc9c",
      }));

      all.push(...moodData.map(m => ({
        title: `😊 ${m.mood}`,
        date: m.date,
        color: "#f39c12",
      })));

      all.push(...specialData.map(s => ({
        title: `⭐ ${s.title}`,
        date: s.date,
        color: "#e74c3c",
      })));

      successCallback(all);
      highlightSelectedDate(selectedDate); // 確保重繪後仍然高亮
    },
  });

  calendar.render();
  loadEvents();
  loadCountdowns();

  eventForm.addEventListener("submit", async function (e) {
    e.preventDefault();
    const title = titleInput.value.trim();
    if (!title) return;

    await fetch("/add_event", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, date: selectedDate }),
    });

    titleInput.value = "";
    loadEvents();
    calendar.refetchEvents();
  });

  async function highlightSelectedDate(dateStr) {
    document.querySelectorAll(".fc-daygrid-day").forEach(el => {
      el.classList.remove("selected");
      if (el.dataset.date === dateStr && !el.classList.contains("fc-day-today")) {
        el.classList.add("selected");
      }
    });
  }

  async function loadEvents() {
    const res = await fetch(`/get_events?date=${selectedDate}`);
    const data = await res.json();
    todoList.innerHTML = "";
    data.events.forEach((e, idx) => {
      const li = document.createElement("li");
      li.innerHTML = `
        <input type="checkbox" ${e.done ? "checked" : ""} data-index="${idx}">
        <span style="${e.done ? 'text-decoration: line-through;' : ''}">${e.title}</span>
        <button data-index="${idx}">刪除</button>
      `;
      todoList.appendChild(li);
    });
  }

  todoList.addEventListener("click", async function (e) {
    const index = e.target.dataset.index;
    if (e.target.tagName === "BUTTON") {
      await fetch("/delete_event", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ index: Number(index), date: selectedDate }),
      });
      loadEvents();
      calendar.refetchEvents();
    } else if (e.target.type === "checkbox") {
      await fetch("/toggle_done", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ index: Number(index), date: selectedDate }),
      });
      loadEvents();
      calendar.refetchEvents();
    }
  });

  // saveMoodBtn.addEventListener("click", async () => {
  //   const mood = moodInput.value.trim();
  //   if (!mood) return;
  //   await fetch("/add_mood", {
  //     method: "POST",
  //     headers: { "Content-Type": "application/json" },
  //     body: JSON.stringify({ date: selectedDate, mood }),
  //   });
  //   moodInput.value = "";
  //   calendar.refetchEvents();
  // });

  drawLuckBtn.addEventListener("click", async () => {
    const res = await fetch("/draw_luck");
    const data = await res.json();
    fortuneDisplay.textContent = `✨ 今日運勢：${data.fortune}`;
  });

  addSpecialBtn.addEventListener("click", async () => {
    const title = specialTitleInput.value.trim();
    const date = specialDateInput.value;
    if (!title || !date) return;

    await fetch("/add_special_day", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, date }),
    });

    specialTitleInput.value = "";
    specialDateInput.value = "";
    calendar.refetchEvents();
    loadCountdowns();
  });

  async function loadCountdowns() {
    const res = await fetch("/countdown");
    const data = await res.json();
    countdownList.innerHTML = "";
    data.specials.forEach(s => {
      const li = document.createElement("li");
      li.textContent = `${s.title}：還有 ${s.days_left} 天`;
      countdownList.appendChild(li);
    });
  }


});
