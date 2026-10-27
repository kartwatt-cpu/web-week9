"use strict";
(() => {
  // todo.ts
  var MAX_TEXT_LENGTH = 200;
  var idSeq = 0;
  function nextId() {
    idSeq = (idSeq + 1) % 1e3;
    return Date.now() * 1e3 + idSeq;
  }
  function normalizeText(input2) {
    if (typeof input2 !== "string") {
      return null;
    }
    const trimmed = input2.trim();
    if (trimmed === "" || trimmed.length > MAX_TEXT_LENGTH) {
      return null;
    }
    const cleaned = trimmed.replace(/<[^>]*>/g, "").trim();
    if (cleaned === "") {
      return null;
    }
    return cleaned;
  }
  function addTodo(todos2, text) {
    const normalized = normalizeText(text);
    if (normalized === null) {
      return;
    }
    todos2.push({ id: nextId(), text: normalized, completed: false });
  }
  function toggleTodo(todos2, id) {
    for (let index = 0; index < todos2.length; index += 1) {
      if (todos2[index].id === id) {
        todos2[index] = { ...todos2[index], completed: !todos2[index].completed };
        return;
      }
    }
  }
  function removeTodo(todos2, id) {
    const index = todos2.findIndex((todo) => todo.id === id);
    if (index === -1) {
      return;
    }
    todos2.splice(index, 1);
  }
  function editTodo(todos2, id, text) {
    const normalized = normalizeText(text);
    if (normalized === null) {
      return;
    }
    const index = todos2.findIndex((todo) => todo.id === id);
    if (index === -1) {
      return;
    }
    todos2[index] = { ...todos2[index], text: normalized };
  }
  function clearCompleted(todos2) {
    for (let index = todos2.length - 1; index >= 0; index -= 1) {
      if (todos2[index].completed) {
        todos2.splice(index, 1);
      }
    }
  }
  function parseTodoId(raw) {
    if (raw === void 0) {
      return null;
    }
    const trimmed = raw.trim();
    if (!/^\d+$/.test(trimmed)) {
      return null;
    }
    const id = Number(trimmed);
    if (!Number.isSafeInteger(id) || id <= 0) {
      return null;
    }
    return id;
  }
  function isTodo(value) {
    return typeof value === "object" && value !== null && "id" in value && typeof value.id === "number" && Number.isSafeInteger(value.id) && value.id > 0 && "text" in value && typeof value.text === "string" && "completed" in value && typeof value.completed === "boolean";
  }
  function parseTodos(raw) {
    if (raw === null) {
      return [];
    }
    try {
      const data = JSON.parse(raw);
      if (!Array.isArray(data)) {
        return [];
      }
      const list2 = data;
      const result = [];
      for (const item of list2) {
        if (isTodo(item)) {
          result.push(item);
        }
      }
      return result;
    } catch {
      return [];
    }
  }

  // app.ts
  var STORAGE_KEY = "todos";
  function must(element, name) {
    if (element === null) {
      throw new Error("\u7F3A\u5C11\u9875\u9762\u5143\u7D20\uFF1A" + name);
    }
    return element;
  }
  var input = must(document.querySelector(".todo-input"), ".todo-input");
  var addBtn = must(document.querySelector(".todo-add"), ".todo-add");
  var list = must(document.querySelector(".todo-list"), ".todo-list");
  var hint = must(document.querySelector(".todo-hint"), ".todo-hint");
  var countEl = must(document.querySelector(".todo-count"), ".todo-count");
  var clearBtn = must(document.querySelector(".todo-clear"), ".todo-clear");
  var filterBtns = document.querySelectorAll(".todo-filter");
  var todos = load();
  var filter = "all";
  function save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
    } catch (error) {
      const message = error instanceof Error ? error.message : "\u672A\u77E5\u9519\u8BEF";
      hint.textContent = "\u4FDD\u5B58\u5931\u8D25\uFF1A" + message;
    }
  }
  function load() {
    try {
      return parseTodos(localStorage.getItem(STORAGE_KEY));
    } catch {
      return [];
    }
  }
  function commit(change) {
    const draft = todos.slice();
    change(draft);
    todos = draft;
    save();
    render();
  }
  function updateFilterButtons() {
    filterBtns.forEach((button) => {
      const on = button.dataset.filter === filter;
      button.classList.toggle("is-active", on);
      button.setAttribute("aria-pressed", on ? "true" : "false");
    });
  }
  function createActionButton(action, label, ariaLabel) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = action === "edit" ? "todo-edit" : "todo-del";
    button.textContent = label;
    button.dataset.action = action;
    button.setAttribute("aria-label", ariaLabel);
    return button;
  }
  function render() {
    list.replaceChildren();
    const shown = todos.filter((todo) => {
      if (filter === "all") {
        return true;
      }
      if (filter === "completed") {
        return todo.completed;
      }
      return !todo.completed;
    });
    shown.forEach((todo) => {
      const item = document.createElement("li");
      item.dataset.id = String(todo.id);
      if (todo.completed) {
        item.classList.add("done");
      }
      const text = document.createElement("span");
      text.textContent = todo.text;
      item.append(
        text,
        createActionButton("edit", "\u7F16\u8F91", "\u7F16\u8F91\uFF1A" + todo.text),
        createActionButton("delete", "\u5220\u9664", "\u5220\u9664\uFF1A" + todo.text)
      );
      list.append(item);
    });
    updateFilterButtons();
    const remaining = todos.reduce((count, todo) => count + (todo.completed ? 0 : 1), 0);
    countEl.textContent = "\u5171 " + todos.length + " \u9879 \xB7 \u672A\u5B8C\u6210 " + remaining + " \u9879";
  }
  list.addEventListener("click", (event) => {
    if (!(event.target instanceof Element)) {
      return;
    }
    const item = event.target.closest("li");
    if (!item || !list.contains(item)) {
      return;
    }
    const id = parseTodoId(item.dataset.id);
    if (id === null) {
      return;
    }
    const deleteBtn = event.target.closest('[data-action="delete"]');
    const editBtn = event.target.closest('[data-action="edit"]');
    if (deleteBtn !== null && item.contains(deleteBtn)) {
      commit((draft) => {
        removeTodo(draft, id);
      });
      return;
    }
    if (editBtn !== null && item.contains(editBtn)) {
      const current = todos.find((todo) => todo.id === id);
      if (current === void 0) {
        return;
      }
      const nextText = window.prompt("\u4FEE\u6539\u4EFB\u52A1", current.text);
      if (nextText === null) {
        return;
      }
      commit((draft) => {
        editTodo(draft, id, nextText);
      });
      return;
    }
    commit((draft) => {
      toggleTodo(draft, id);
    });
  });
  addBtn.addEventListener("click", () => {
    const text = input.value.trim();
    if (text === "") {
      hint.textContent = "\u5185\u5BB9\u4E3A\u7A7A\uFF0C\u8BF7\u8F93\u5165\u540E\u518D\u6DFB\u52A0\u3002";
      input.focus();
      return;
    }
    hint.textContent = "";
    commit((draft) => {
      addTodo(draft, text);
    });
    input.value = "";
    input.focus();
  });
  input.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      addBtn.click();
    }
  });
  filterBtns.forEach((button) => {
    button.addEventListener("click", () => {
      const value = button.dataset.filter;
      if (value === "all" || value === "active" || value === "completed") {
        filter = value;
        render();
      }
    });
  });
  clearBtn.addEventListener("click", () => {
    commit((draft) => {
      clearCompleted(draft);
    });
  });
  render();
})();
