import { test, expect } from 'vitest';
import { addTodo, toggleTodo } from './todo';
import type { Todo } from './todo';

// 任务 3 的修补：① 把弱断言换成具体文本；② 按 9 维补上 AI 漏掉的边界。

// ① 有效性：不再用 toBeDefined，直接断言文本内容
test('正常添加：文本内容正确', () => {
  const todos: Todo[] = [];
  addTodo(todos, '学习TS');
  expect(todos[0].text).toBe('学习TS');
});

// ② 维度1（空值）：null 是运行时脏数据，应被拦截而不是抛 TypeError
test('维度1：null 被拦截', () => {
  const todos: Todo[] = [];
  addTodo(todos, null);
  expect(todos.length).toBe(0);
});

test('维度1：undefined 被拦截', () => {
  const todos: Todo[] = [];
  addTodo(todos, undefined);
  expect(todos.length).toBe(0);
});

// ③ 维度2（格式拓展）：超长文本按契约拦截
test('维度2：201 字超长文本被拦截', () => {
  const todos: Todo[] = [];
  addTodo(todos, 'a'.repeat(201));
  expect(todos.length).toBe(0);
});

// ④ 维度6（重复）：相同文本允许并存，且第二条内容也要正确
test('维度6：重复文本各自入库', () => {
  const todos: Todo[] = [];
  addTodo(todos, '学习TS');
  addTodo(todos, '学习TS');
  expect(todos.length).toBe(2);
  expect(todos[1].text).toBe('学习TS');
});

// ⑤ 维度9（安全）：<script> 在数据层被清洗，不能原样入库
test('维度9：script 标签不被原样存入', () => {
  const todos: Todo[] = [];
  addTodo(todos, '<script>alert(1)</script>');
  expect(todos[0].text).not.toContain('<script>');
  expect(todos[0].text).toBe('alert(1)');
});

// ⑥ 维度4（越界）：不存在的 id 不改变已有数据
test('维度4：不存在的 ID 不改动已有任务', () => {
  const todos: Todo[] = [{ id: 1, text: '学习TS', completed: false }];
  toggleTodo(todos, 999);
  expect(todos.length).toBe(1);
  expect(todos[0].completed).toBe(false);
});
