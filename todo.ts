/**
 * W9 数据层：Todo 的唯一数据模型与纯数据操作。
 *
 * 契约（与单测一一对应）：
 *   1. addTodo：trim 后非空、长度 <= 200 才添加；null / undefined / 非字符串一律拒绝。
 *   2. addTodo：文本里的 HTML 标签在数据层清洗，`<script>` 不会原样入库。
 *   3. toggleTodo：按 id 翻转 completed；id 不存在时安静返回。
 *   4. removeTodo / editTodo / clearCompleted：只动传入的数组，找不到目标时安静返回。
 *   5. parseTodoId：把 dataset.id / URL 里的字符串显式转成 number，
 *      ''、'1.5'、'123abc'、'0' 等脏值全部返回 null。
 *
 * 说明：按 W9 实验约定的函数签名，addTodo/toggleTodo 就地修改传入数组；
 * 应用层（app.ts）先 slice() 出副本再调用，页面状态仍保持“改副本 → 替换 → 保存 → 渲染”。
 */

export interface Todo {
  id: number;
  text: string;
  completed: boolean;
}

export type Filter = 'all' | 'active' | 'completed';

export const MAX_TEXT_LENGTH = 200;

let idSeq = 0;

// 同一毫秒内连续添加也不会撞号；结果仍是安全整数（< 2^53）。
export function nextId(): number {
  idSeq = (idSeq + 1) % 1000;
  return Date.now() * 1000 + idSeq;
}

function normalizeText(input: unknown): string | null {
  if (typeof input !== 'string') {
    return null;
  }
  const trimmed = input.trim();
  if (trimmed === '' || trimmed.length > MAX_TEXT_LENGTH) {
    return null;
  }
  const cleaned = trimmed.replace(/<[^>]*>/g, '').trim();
  if (cleaned === '') {
    return null;
  }
  return cleaned;
}

export function addTodo(todos: Todo[], text: unknown): void {
  const normalized = normalizeText(text);
  if (normalized === null) {
    return;
  }
  todos.push({ id: nextId(), text: normalized, completed: false });
}

export function toggleTodo(todos: Todo[], id: number): void {
  for (let index = 0; index < todos.length; index += 1) {
    if (todos[index].id === id) {
      todos[index] = { ...todos[index], completed: !todos[index].completed };
      return;
    }
  }
}

export function removeTodo(todos: Todo[], id: number): void {
  const index = todos.findIndex((todo) => todo.id === id);
  if (index === -1) {
    return;
  }
  todos.splice(index, 1);
}

export function editTodo(todos: Todo[], id: number, text: unknown): void {
  const normalized = normalizeText(text);
  if (normalized === null) {
    return;
  }
  const index = todos.findIndex((todo) => todo.id === id);
  if (index === -1) {
    return;
  }
  todos[index] = { ...todos[index], text: normalized };
}

export function clearCompleted(todos: Todo[]): void {
  for (let index = todos.length - 1; index >= 0; index -= 1) {
    if (todos[index].completed) {
      todos.splice(index, 1);
    }
  }
}

// 脏数据入口 1：dataset.id 永远是 string | undefined。
export function parseTodoId(raw: string | undefined): number | null {
  if (raw === undefined) {
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

function isTodo(value: unknown): value is Todo {
  return (
    typeof value === 'object' &&
    value !== null &&
    'id' in value &&
    typeof value.id === 'number' &&
    Number.isSafeInteger(value.id) &&
    value.id > 0 &&
    'text' in value &&
    typeof value.text === 'string' &&
    'completed' in value &&
    typeof value.completed === 'boolean'
  );
}

// 脏数据入口 2：localStorage 解析后的内容完全不受控。
export function parseTodos(raw: string | null): Todo[] {
  if (raw === null) {
    return [];
  }
  try {
    const data: unknown = JSON.parse(raw);
    if (!Array.isArray(data)) {
      return [];
    }
    const list: unknown[] = data;
    const result: Todo[] = [];
    for (const item of list) {
      if (isTodo(item)) {
        result.push(item);
      }
    }
    return result;
  } catch {
    return [];
  }
}
