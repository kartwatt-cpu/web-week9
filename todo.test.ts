import { test, expect } from 'vitest';
import { addTodo, toggleTodo } from './todo';
import type { Todo } from './todo';

// 任务 2：以下 5 条为手写用例，每条的数据都在用例内部新建，互不共享。
test('addTodo：正常添加，长度 +1 且文本正确', () => {
  const todos: Todo[] = [];
  addTodo(todos, '学习TS');
  expect(todos.length).toBe(1);
  expect(todos[0].text).toBe('学习TS');
});

test('addTodo：纯空格被拦截', () => {
  const todos: Todo[] = [];
  addTodo(todos, '   ');
  expect(todos.length).toBe(0);
});

test('addTodo：空字符串被拦截', () => {
  const todos: Todo[] = [];
  addTodo(todos, '');
  expect(todos.length).toBe(0);
});

test('toggleTodo：正常切换，且不影响其他任务', () => {
  const todos: Todo[] = [
    { id: 1, text: '学习TS', completed: false },
    { id: 2, text: '写单测', completed: false },
  ];
  toggleTodo(todos, 1);
  expect(todos[0].completed).toBe(true);
  expect(todos[1].completed).toBe(false);
});

test('toggleTodo：不存在的 ID 不崩溃', () => {
  const todos: Todo[] = [];
  toggleTodo(todos, 999);
  expect(todos.length).toBe(0);
});
