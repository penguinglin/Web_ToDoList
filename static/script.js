document.addEventListener("DOMContentLoaded", function () {
  const calendarEl = document.getElementById("calendar");
  const selectedDateEl = document.getElementById("selected-date");
  const todoListEl = document.getElementById("todo-list");
  let currentDate = new Date().toISOString().split("T")[0];

  const calendar = new FullCalendar.Calendar(calendarEl, {
    initialView: "dayGridMonth",
    selectable: true,
    dateClick: function (info) {
      currentDate = info.dateStr;
      selectedDateEl.textContent = `📅 ${currentDate} 的待辦事項`;
      loadEvents(currentDate);
    },
  });

  calendar.render();

  document
    .getElementById("event-form")
    .addEventListener("submit", function (e) {
      e.preventDefault();
      const title = document.getElementById("title").value;
      if (!title) return;

      fetch("/add_event", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: title, date: currentDate }),
      })
        .then((res) => res.json())
        .then(() => {
          document.getElementById("title").value = "";
          loadEvents(currentDate);
        });
    });

  function loadEvents(date) {
    fetch(`/get_events?date=${date}`)
      .then((res) => res.json())
      .then((data) => {
        todoListEl.innerHTML = "";
        data.events.forEach((event, index) => {
          const li = document.createElement("li");
          li.className = event.done ? "done" : "";

          const checkbox = document.createElement("input");
          checkbox.type = "checkbox";
          checkbox.checked = event.done || false;
          checkbox.addEventListener("change", () => toggleDone(index));

          const span = document.createElement("span");
          span.textContent = event.title;

          const delBtn = document.createElement("button");
          delBtn.textContent = "❌";
          delBtn.className = "delete-btn";
          delBtn.addEventListener("click", () => deleteEvent(index));

          li.appendChild(checkbox);
          li.appendChild(span);
          li.appendChild(delBtn);
          todoListEl.appendChild(li);
        });
      });
  }

  function toggleDone(index) {
    fetch("/toggle_done", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ date: currentDate, index: index }),
    }).then(() => loadEvents(currentDate));
  }

  function deleteEvent(index) {
    fetch("/delete_event", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ date: currentDate, index: index }),
    }).then(() => loadEvents(currentDate));
  }

  selectedDateEl.textContent = `📅 ${currentDate} 的待辦事項`;
  loadEvents(currentDate);
});
