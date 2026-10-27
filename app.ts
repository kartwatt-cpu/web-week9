/**
 * W9 视图层：把 todo.ts 的数据操作接到页面上。
 * 事件委托仍然只挂在 ul.todo-list 上；DOM 只在 render() 里创建。
 */
import {
  addTodo,
  clearCompleted,
  editTodo,
  parseTodoId,
  parseTodos,
  removeTodo,
  toggleTodo,
} from './todo';
import type { Filter, Todo } from './todo';

const STORAGE_KEY = 'todos';

function must<T extends Element>(element: T | null, name: string): T {
  if (element === null) {
    throw new Error('缺少页面元素：' + name);
  }
  return element;
}

const input = must(document.querySelector<HTMLInputElement>('.todo-input'), '.todo-input');
const addBtn = must(document.querySelector<HTMLButtonElement>('.todo-add'), '.todo-add');
const list = must(document.querySelector<HTMLUListElement>('.todo-list'), '.todo-list');
const hint = must(document.querySelector<HTMLParagraphElement>('.todo-hint'), '.todo-hint');
const countEl = must(document.querySelector<HTMLParagraphElement>('.todo-count'), '.todo-count');
const clearBtn = must(document.querySelector<HTMLButtonElement>('.todo-clear'), '.todo-clear');
const filterBtns = document.querySelectorAll<HTMLButtonElement>('.todo-filter');

let todos: Todo[] = load();
let filter: Filter = 'all';

// 存：localStorage 写失败（隐私模式 / 配额满）只提示，不让整页脚本挂掉。
function save(): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : '未知错误';
    hint.textContent = '保存失败：' + message;
  }
}

// 取：解析后逐条过 isTodo，坏数据被丢掉而不是让页面崩。
function load(): Todo[] {
  try {
    return parseTodos(localStorage.getItem(STORAGE_KEY));
  } catch {
    return [];
  }
}

type TodoChange = (draft: Todo[]) => void;

// 应用层仍是“改副本 → 替换 → save() → render()”，不就地修改当前 todos。
function commit(change: TodoChange): void {
  const draft = todos.slice();
  change(draft);
  todos = draft;
  save();
  render();
}

function updateFilterButtons(): void {
  filterBtns.forEach((button) => {
    const on = button.dataset.filter === filter;
    button.classList.toggle('is-active', on);
    button.setAttribute('aria-pressed', on ? 'true' : 'false');
  });
}

function createActionButton(
  action: 'edit' | 'delete',
  label: string,
  ariaLabel: string,
): HTMLButtonElement {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = action === 'edit' ? 'todo-edit' : 'todo-del';
  button.textContent = label;
  button.dataset.action = action;
  button.setAttribute('aria-label', ariaLabel);
  return button;
}

function render(): void {
  list.replaceChildren();
  const shown = todos.filter((todo) => {
    if (filter === 'all') {
      return true;
    }
    if (filter === 'completed') {
      return todo.completed;
    }
    return !todo.completed;
  });

  shown.forEach((todo) => {
    const item = document.createElement('li');
    item.dataset.id = String(todo.id);
    if (todo.completed) {
      item.classList.add('done');
    }

    const text = document.createElement('span');
    text.textContent = todo.text;

    item.append(
      text,
      createActionButton('edit', '编辑', '编辑：' + todo.text),
      createActionButton('delete', '删除', '删除：' + todo.text),
    );
    list.append(item);
  });

  updateFilterButtons();
  const remaining = todos.reduce((count, todo) => count + (todo.completed ? 0 : 1), 0);
  countEl.textContent = '共 ' + todos.length + ' 项 · 未完成 ' + remaining + ' 项';
}

// 事件委托：删除 / 编辑 / 切换只在 ul 上分流一次，三个分支互斥。
list.addEventListener('click', (event: MouseEvent) => {
  if (!(event.target instanceof Element)) {
    return;
  }
  const item = event.target.closest<HTMLLIElement>('li');
  if (!item || !list.contains(item)) {
    return;
  }
  const id = parseTodoId(item.dataset.id);
  if (id === null) {
    return;
  }
  const deleteBtn = event.target.closest<HTMLElement>('[data-action="delete"]');
  const editBtn = event.target.closest<HTMLElement>('[data-action="edit"]');
  if (deleteBtn !== null && item.contains(deleteBtn)) {
    commit((draft) => {
      removeTodo(draft, id);
    });
    return;
  }
  if (editBtn !== null && item.contains(editBtn)) {
    const current = todos.find((todo) => todo.id === id);
    if (current === undefined) {
      return;
    }
    const nextText = window.prompt('修改任务', current.text);
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

addBtn.addEventListener('click', () => {
  const text = input.value.trim();
  if (text === '') {
    hint.textContent = '内容为空，请输入后再添加。';
    input.focus();
    return;
  }
  hint.textContent = '';
  commit((draft) => {
    addTodo(draft, text);
  });
  input.value = '';
  input.focus();
});

input.addEventListener('keydown', (event: KeyboardEvent) => {
  if (event.key === 'Enter') {
    addBtn.click();
  }
});

filterBtns.forEach((button) => {
  button.addEventListener('click', () => {
    const value = button.dataset.filter;
    if (value === 'all' || value === 'active' || value === 'completed') {
      filter = value;
      render();
    }
  });
});

clearBtn.addEventListener('click', () => {
  commit((draft) => {
    clearCompleted(draft);
  });
});

render();
