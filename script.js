var setdate = document.querySelector(".set_date");
var settime = document.querySelector(".set_time");

var date = new Date().toDateString();
setdate.innerHTML = date;

setInterval(function () {
  var time = new Date().toLocaleTimeString();
  settime.innerHTML = time;
}, 500);

function checked(id) {
  const strike = document.getElementById(`strike${id}`);
  const check = document.getElementById(`check${id}`);

  const isDone = strike.classList.contains("strike_none");

  strike.classList.toggle("strike_none");
  strike.classList.toggle("line-through");
  check.classList.toggle("bg-[#36d344]");

  if (tasks[id]) {
    tasks[id].completed = !isDone;
  }
}

let tasks = {};
let draggedItem = null;

function drag(event) {
  draggedItem = event.target;
  event.target.classList.add("dragging");
}

function getDragAfterElement(container, y) {
  const draggableElements = [...container.querySelectorAll("li:not(.dragging)")];
  
  return draggableElements.reduce((closest, child) => {
    const box = child.getBoundingClientRect();
    const offset = y - box.top - box.height / 2;
    if (offset < 0 && offset > closest.offset) {
      return { offset: offset, element: child };
    } else {
      return closest;
    }
  }, { offset: Number.NEGATIVE_INFINITY }).element;
}

window.addEventListener('DOMContentLoaded', () => {
  const calendarRow = document.getElementById('calendar-row');
  const today = new Date();
  const weekdayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const currentDayOfWeek = today.getDay();
  const sunday = new Date(today);
  sunday.setDate(today.getDate() - currentDayOfWeek);

  for (let i = 0; i < 7; i++) {
    const date = new Date(sunday);
    date.setDate(sunday.getDate() + i);

    const dateString = date.toISOString().split('T')[0];
    const dayNumber = date.getDate();
    const dayName = weekdayNames[i];

    const dayColumn = document.createElement('div');
    dayColumn.className = 'flex flex-col items-center space-y-1';
    dayColumn.dataset.date = dateString;

    const dayText = document.createElement('span');
    dayText.className = 'text-sm font-semibold';

    const dateCircle = document.createElement('span');
    dateCircle.className = 'h-7 w-7 rounded-full cursor-pointer transition-all flex justify-center items-center text-sm font-semibold';
    dateCircle.innerHTML = `<p>${dayNumber}</p>`;

    if (date.toDateString() === today.toDateString()) {
      dayText.classList.add('text-black');
      dateCircle.classList.add('bg-blue-200', 'text-black');
    } else if (date < today) {
      dayText.classList.add('text-gray-400');
      dateCircle.classList.add('bg-gray-100', 'text-gray-500');
    } else {
      dayText.classList.add('text-[#5b7a9d]');
      dateCircle.classList.add(
        'bg-white',
        'text-black',
        'hover:bg-[#063c76]',
        'hover:text-white'
      );
    }

    dayText.textContent = dayName;
    dayColumn.appendChild(dayText);
    dayColumn.appendChild(dateCircle);
    calendarRow.appendChild(dayColumn);
  }

  document.querySelector('.set_date').textContent = today.toLocaleDateString('en-US', {
    weekday: 'long',
    day: 'numeric',
    month: 'long'
  });

  document.querySelector('.set_time').textContent = today.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  });

  // Add drag-and-drop event listeners
  document.getElementById("task-container").addEventListener("dragover", function(e) {
    e.preventDefault();
    const afterElement = getDragAfterElement(this, e.clientY);
    const draggable = draggedItem;
    
    if (afterElement == null) {
      this.appendChild(draggable);
    } else {
      this.insertBefore(draggable, afterElement);
    }
  });

  document.getElementById("task-container").addEventListener("dragend", function(e) {
    e.target.classList.remove("dragging");
  });
});

document.getElementById("add-task-btn").addEventListener("click", () => {
  document.getElementById("task-modal").classList.remove("hidden");
  populateDayDropdown();
});

document.getElementById("cancel-task").addEventListener("click", () => {
  document.getElementById("task-modal").classList.add("hidden");
  document.getElementById("task-title").value = "";
  document.getElementById("task-time").value = "";
});

document.getElementById("save-task").addEventListener("click", () => {
  const title = document.getElementById("task-title").value;
  const date = document.getElementById("task-day").value;
  const time = document.getElementById("task-time").value;

  if (!title || !date || !time) {
    alert("Please fill all fields.");
    return;
  }

  if (date !== "future") {
    const selectedDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    selectedDate.setHours(0, 0, 0, 0);

    if (selectedDate < today) {
      alert("Cannot set a task in the past.");
      return;
    }
  }

  addTask(title, time);
  document.getElementById("task-modal").classList.add("hidden");
  document.getElementById("task-title").value = "";
  document.getElementById("task-time").value = "";
});

function populateDayDropdown() {
  const dropdown = document.getElementById("task-day");
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  dropdown.innerHTML = "";

  const days = document.querySelectorAll("#calendar-row > div");
  days.forEach(day => {
    const dayName = day.querySelector('span:first-child').textContent;
    const dayNumber = day.querySelector('span:last-child p').textContent;
    const dateStr = day.dataset.date;

    if (dateStr) {
      const dayDate = new Date(dateStr);
      dayDate.setHours(0, 0, 0, 0);
      if (dayDate >= today) {
        const displayText = `${dayName} ${dayNumber}`;
        dropdown.innerHTML += `<option value="${dateStr}">${displayText}</option>`;
      }
    }
  });

  const futureOption = document.createElement('option');
  futureOption.value = "future";
  futureOption.textContent = "Select Future Date...";
  dropdown.appendChild(futureOption);
}

document.getElementById("task-day").addEventListener("change", function () {
  if (this.value === "future") {
    const futureDate = prompt("Enter future date (YYYY-MM-DD):", new Date().toISOString().split('T')[0]);

    if (futureDate) {
      const selectedDate = new Date(futureDate);
      selectedDate.setHours(0, 0, 0, 0);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (selectedDate >= today) {
        const dayName = selectedDate.toLocaleDateString('en-US', { weekday: 'short' });
        const dayNumber = selectedDate.getDate();

        this.innerHTML = this.innerHTML.replace(
          '<option value="future">Select Future Date...</option>',
          `<option value="${futureDate}">${dayName} ${dayNumber} (Future)</option>
           <option value="future">Select Another Date...</option>`
        );
        this.value = futureDate;
      } else {
        alert("Please select a future date");
        this.value = "";
      }
    } else {
      this.value = "";
    }
  }
});

function addTask(title, time24) {
  const taskId = Date.now();
  const selectedDate = document.getElementById("task-day").value;

  const [hour, minute] = time24.split(":");
  let hour12 = parseInt(hour, 10);
  const ampm = hour12 >= 12 ? "PM" : "AM";
  hour12 = hour12 % 12 || 12;
  const time12 = `${hour12}:${minute} ${ampm}`;

  const dateObj = new Date(selectedDate);
  const weekday = dateObj.toLocaleDateString("en-US", { weekday: "short" });
  const day = dateObj.getDate();
  const month = dateObj.toLocaleDateString("en-US", { month: "short" });
  const formattedDate = `${weekday} ${day} ${month}`;

  const taskHTML = `
    <li class="mt-4" id="${taskId}" draggable="true" ondragstart="drag(event)">
      <div class="flex gap-2">
        <div class="w-7/12 h-12 bg-[#e0ebff] rounded-[7px] flex items-center px-3 justify-between">
          <div class="flex items-center">
            <span 
              id="check${taskId}" 
              class="w-7 h-7 bg-white rounded-full border border-white cursor-pointer hover:border-[#36d344] flex justify-center items-center" 
              onclick="checked(${taskId})"
            >
              <i class="text-white fa fa-check"></i>
            </span>
            <strike 
              id="strike${taskId}" 
              class="strike_none text-sm ml-4 text-[#5b7a9d] font-semibold"
            >
              ${title}
            </strike>
          </div>
          <button onclick="editTask(${taskId})" class="text-xs text-blue-600 hover:underline ml-2">Edit</button>
        </div>

        <span class="w-1/6 h-12 bg-[#e0ebff] rounded-[7px] flex justify-center items-center text-xs text-[#5b7a9d] font-semibold">
          ${formattedDate}
        </span>

        <span class="w-1/6 h-12 bg-[#e0ebff] rounded-[7px] flex justify-center items-center text-xs text-[#5b7a9d] font-semibold">
          ${time12}
        </span>
      </div>
    </li>
  `;

  document.getElementById("task-container").insertAdjacentHTML("beforeend", taskHTML);

  tasks[taskId] = {
    title,
    time: time12,
    date: formattedDate
  };
}

let currentEditId = null;
function editTask(id) {
  currentEditId = id;

  const task = tasks[id];
  if (!task) return;

  document.getElementById("edit-title").value = task.title;

  const [weekday, day, month] = task.date.split(" ");
  const months = {
    Jan: "01", Feb: "02", Mar: "03", Apr: "04", May: "05", Jun: "06",
    Jul: "07", Aug: "08", Sep: "09", Oct: "10", Nov: "11", Dec: "12"
  };
  const year = new Date().getFullYear();
  const dateValue = `${year}-${months[month]}-${day.padStart(2, "0")}`;
  document.getElementById("edit-date").value = dateValue;

  const [timeStr, ampm] = task.time.split(" ");
  let [hour, minute] = timeStr.split(":").map(Number);
  if (ampm === "PM" && hour !== 12) hour += 12;
  if (ampm === "AM" && hour === 12) hour = 0;
  document.getElementById("edit-time").value = `${String(hour).padStart(2, "0")}:${minute}`;

  document.getElementById("edit-task-modal").classList.remove("hidden");
}

document.getElementById("update-task-btn").addEventListener("click", () => {
  if (!currentEditId || !tasks[currentEditId]) return;

  const newTitle = document.getElementById("edit-title").value.trim();
  const newDate = document.getElementById("edit-date").value;
  const newTime = document.getElementById("edit-time").value;

  if (!newTitle || !newDate || !newTime) {
    alert("Please fill all fields.");
    return;
  }

  let [hour, minute] = newTime.split(":").map(Number);
  const ampm = hour >= 12 ? "PM" : "AM";
  hour = hour % 12 || 12;
  const time12 = `${hour}:${minute.toString().padStart(2, "0")} ${ampm}`;

  const d = new Date(newDate);
  const weekday = d.toLocaleDateString("en-US", { weekday: "short" });
  const day = d.getDate();
  const month = d.toLocaleDateString("en-US", { month: "short" });
  const formattedDate = `${weekday} ${day} ${month}`;

  const strike = document.getElementById(`strike${currentEditId}`);
  strike.textContent = newTitle;

  const parent = document.getElementById(currentEditId);
  const spans = parent.querySelectorAll("span");
  spans[1].textContent = formattedDate;
  spans[2].textContent = time12;

  tasks[currentEditId] = {
    ...tasks[currentEditId],
    title: newTitle,
    date: formattedDate,
    time: time12
  };

  document.getElementById("edit-task-modal").classList.add("hidden");
  currentEditId = null;
});

document.getElementById("delete-task-btn").addEventListener("click", () => {
  if (!currentEditId) return;

  const taskEl = document.getElementById(currentEditId);
  if (taskEl) taskEl.remove();

  delete tasks[currentEditId];

  document.getElementById("edit-task-modal").classList.add("hidden");
  currentEditId = null;
});

document.getElementById("cancel-edit-btn").addEventListener("click", () => {
  document.getElementById("edit-task-modal").classList.add("hidden");
  currentEditId = null;
});