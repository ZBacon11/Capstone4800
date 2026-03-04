// Grabbing the Elements (Selectors)
const addWindow = document.getElementById("addWindow");
const editWindow = document.getElementById("editWindow");
const removeWindow = document.getElementById("removeWindow");
const clearAllWindow = document.getElementById("clearAllWindow");
const markAllCompletedWindow = document.getElementById("markAllCompletedWindow");

const notifyContainer = document.getElementById("notifyContainer");
const taskCounter = document.getElementById("taskCounter");

const taskList = document.getElementById("taskList");
const addInput = document.getElementById("addInput");
const editInput = document.getElementById("editInput");

//Grab the Zack Button and Display
const zackBtn = document.getElementById("zackBtn");
const zackDisplay = document.getElementById("zackDisplay");

//Global State
let currentEditId = null; // Keeps track of the cutrrent task
let currentRemoveId = null;

//Sets the year in the footer automatically.
const currentYear = new Date().getFullYear();
document.getElementById("footerDateSpan").textContent = currentYear;

//Local Storage. Like a basic function with getter/setter
function getTasks() {
  return JSON.parse(localStorage.getItem("tasks")) || [];
}

function setTasks(tasks) {
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

//Window management, allows opening anf closing functionality
const windows = {
  add: addWindow,
  edit: editWindow,
  remove: removeWindow,
  clearAll: clearAllWindow,
  markAllCompleted: markAllCompletedWindow,
};

function closeAllWindows() {
  Object.values(windows).forEach((win) => win.classList.add("hidden"));
}

function openWindow(name) {
  closeAllWindows();
  windows[name].classList.remove("hidden");
}

function closeAddWindow() {windows.add.classList.add("hidden");}
function closeEditWindow() {windows.edit.classList.add("hidden");}
function closeRemoveWindow() {windows.remove.classList.add("hidden");}
function closeClearAllWindow() {windows.clearAll.classList.add("hidden");}
function closeMarkAllCompletedWindow() {windows.markAllCompleted.classList.add("hidden");}

function openAddWindow() {
  openWindow("add");
}

function openEditWindow(id) {
  currentEditId = id;
  const task = getTasks().find((t) => t.id === id);
  editInput.value = task.text;
  openWindow("edit");
}

function openRemoveWindow(id) {
  currentRemoveId = id;
  openWindow("remove");
}

function openClearAllWindow() {
  openWindow("clearAll");
}

function openMarkAllCompletedWindow() {
  openWindow("markAllCompleted");
}

//Task Manipulation
//Updates the text if the list is empty
function updateTaskListPlaceholder() {
  if (taskList.children.length === 0) {
    const li = document.createElement("li");
    li.className = "placeholder";
    li.textContent = "You currently have no tasks.";
    taskList.appendChild(li);
  } else {
    const placeholder = taskList.querySelector(".placeholder");
    if (placeholder) placeholder.remove();
  }
}

//Adding a notification popup, using the html code.
function notifyPopup(text) {
  const box = document.createElement("div");
  box.className = "notify";
  box.innerHTML = `
    <div class="top-row">
      <span>${text}</span>
      <button>x</button>
    </div>
    <div class="bar"></div>
  `;
  notifyContainer.appendChild(box);
  box.querySelector("button").addEventListener("click", () => {
    box.remove();
  });
  setTimeout(() => box.remove(), 3000);
}

//Counts the tasks not checked off yet
function updateTaskCounter() {
  const tasks = getTasks();
  const remaining = tasks.filter((task) => !task.completed).length;

  if (tasks.length === 0) {
    taskCounter.textContent = "";
  } else if (remaining === 1) {
    taskCounter.textContent = "1 task remaining";
  } else if (remaining === 0) {
    taskCounter.textContent = "All tasks completed!";
  } else {
    taskCounter.textContent = `${remaining} tasks remaining`;
  }
}

function addTask() {
  const taskText = addInput.value.trim();
  if (taskText !== "") {
    const task = { id: Date.now(), text: taskText, completed: false };
    addTaskElement(task);
    saveTask(task);
    notifyPopup("Added task");
    updateTaskCounter();
  }
  closeAddWindow();
  addInput.value = "";
}

function addTaskElement(task) {
  const li = document.createElement("li");
  li.setAttribute("task-id", task.id);
  const checkboxId = `task-${task.id}`;
  li.innerHTML = `
    <input type="checkbox" id="${checkboxId}">
    <label for="${checkboxId}">${task.text}</label>
    <div class="task-btns">
        <button class="edit-btn">Edit</button>
        <button class="remove-btn">Remove</button>
    </div>
  `;

  const checkbox = li.querySelector("input[type='checkbox']");
  const label = li.querySelector("label");
  const editBtn = li.querySelector(".edit-btn");
  const removeBtn = li.querySelector(".remove-btn");

  checkbox.checked = task.completed;
  if (task.completed) label.style.textDecoration = "line-through";

  checkbox.addEventListener("change", () => {
    task.completed = checkbox.checked;
    label.style.textDecoration = checkbox.checked ? "line-through" : "none";
    updateTaskInLocalStorage(task.id, task);
    updateTaskCounter();
  });

  editBtn.addEventListener("click", () => openEditWindow(task.id));
  removeBtn.addEventListener("click", () => openRemoveWindow(task.id));

  taskList.appendChild(li);
  updateTaskListPlaceholder();
}

function editTask() {
  if (!currentEditId) return;
  const li = document.querySelector(`li[task-id="${currentEditId}"]`);
  li.querySelector("label").textContent = editInput.value;
  closeEditWindow();
  notifyPopup("Edited task");
  updateTaskInLocalStorage(currentEditId, { text: editInput.value });
}

function removeTask() {
  if (!currentRemoveId) return;
  const li = document.querySelector(`li[task-id="${currentRemoveId}"]`);
  if (li) li.remove();
  removeTaskFromLocalStorage(currentRemoveId);
  notifyPopup("Removed task");
  updateTaskListPlaceholder();
  updateTaskCounter();
  currentRemoveId = null;
  closeRemoveWindow();
}

//Data Presence and persistence. updating out local Database
function updateTaskInLocalStorage(id, updatedFields) {
  let tasks = getTasks();
  tasks = tasks.map((task) =>
    task.id === id ? { ...task, ...updatedFields } : task
  );
  setTasks(tasks);
}

function removeTaskFromLocalStorage(id) {
  let tasks = getTasks();
  tasks = tasks.filter((task) => task.id !== id);
  setTasks(tasks);
}

function saveTask(task) {
  const tasks = getTasks();
  tasks.push(task);
  setTasks(tasks);
}

function clearAllTasks() {
  const tasks = getTasks();
  if (tasks.length === 0) {
    closeClearAllWindow();
    return;
  }
  localStorage.removeItem("tasks");
  taskList.innerHTML = "";
  notifyPopup("Cleared all tasks");
  closeAllWindows();
  updateTaskListPlaceholder();
  updateTaskCounter();
}

function markAllCompleted() {
  const tasks = getTasks();
  if (tasks.length === 0) {
    closeMarkAllCompletedWindow();
    return;
  }
  tasks.forEach((task) => (task.completed = true));
  setTasks(tasks);
  taskList.querySelectorAll("li").forEach((li) => {
    const checkbox = li.querySelector("input[type='checkbox']");
    const label = li.querySelector("label");
    checkbox.checked = true;
    label.style.textDecoration = "line-through";
  });
  notifyPopup("All tasks marked as completed");
  updateTaskCounter();
  closeMarkAllCompletedWindow();
}

//Using input from html to draw on the screen or the first draw of the screen
function renderTasks() {
  const tasks = getTasks();
  taskList.innerHTML = "";

  tasks.forEach((task) => addTaskElement(task));

  updateTaskCounter();
  updateTaskListPlaceholder();
}

window.addEventListener("load", () => {
  renderTasks();
});

addInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") addTask();
});

//Zack Button
zackBtn.addEventListener("click", () => {
  const today = new Date();
  const semesterEnd = new Date("April 27, 2026");

  // Calculate the difference in milliseconds and convert to days
  const diffInMs = semesterEnd - today;
  const daysLeft = Math.ceil(diffInMs / (1000 * 60 * 60 * 24));

  // Injected HTML styled to match the retro vibe
  zackDisplay.innerHTML = `
  <div class="window" style="margin-top: 10px; width: 100%;">
   <div class="title-bar">
    <div class="title-bar-text">Zack's Info</div>
    <div class="title-bar-controls">
       <button aria-label="Close" id="closeZackBtn"></button>
    </div>
  </div>
  <div class="window-body">
    <p><strong>Name:</strong> Zachary Bacon</p>
    <p><strong>Major:</strong> Computer Information Systems</p>
    <p><strong>Date:</strong> ${today.toDateString()}</p>
    <p><strong>Countdown:</strong> ${daysLeft} days until the end of the semester!</p>
    <section class="field-row" style="justify-content: flex-end">
        <button id="closeZackBottomBtn">OK</button>
     </section>
    </div>
</div>
`;

// Function to clear the display
const clearZackDisplay = () => { zackDisplay.innerHTML = ""; };

  // Attach event listeners to the new buttons
  document.getElementById("closeZackBtn").addEventListener("click", clearZackDisplay);
  document.getElementById("closeZackBottomBtn").addEventListener("click", clearZackDisplay);
});