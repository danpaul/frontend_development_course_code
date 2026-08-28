"use client";

import { useState } from "react";
import { TodoList } from "@/components/organisms/TodoList/TodoList";
import { PageTemplate } from "@/components/templates/PageTemplate/PageTemplate";
import { type Todo } from "@/generated/prisma/browser";

export type TodoPageProps = {
  initialTodos?: Todo[];
  createTodo: (input: {
    title: string;
    description: string | null;
  }) => Promise<Todo>;
  updateTodo: (input: {
    id: number;
    title: string;
    description: string | null;
  }) => Promise<Todo>;
  deleteTodo: (id: number) => Promise<void>;
};

function toClientTodo(todo: Todo): Todo {
  return { ...todo, createdAt: new Date(todo.createdAt) };
}

const TodoPage = function TodoPage({
  initialTodos,
  createTodo,
  updateTodo,
  deleteTodo,
}: TodoPageProps) {
  const [todos, setTodos] = useState<Todo[]>(() =>
    (initialTodos ?? []).map(toClientTodo),
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function onAdd({
    title,
    description,
  }: {
    title: string;
    description: string | null;
  }) {
    try {
      const returned = await createTodo({ title, description });
      setTodos((current) => [toClientTodo(returned), ...current]);
      setErrorMessage(null);
    } catch (error) {
      setErrorMessage("Something went wrong. Try again.");
      throw error;
    }
  }

  async function onUpdate(todo: Todo) {
    try {
      const returned = await updateTodo({
        id: todo.id,
        title: todo.title,
        description: todo.description,
      });
      setTodos((current) =>
        current.map((item) =>
          item.id === todo.id ? toClientTodo(returned) : item,
        ),
      );
      setErrorMessage(null);
    } catch (error) {
      setErrorMessage("Something went wrong. Try again.");
      throw error;
    }
  }

  async function onDelete(id: number) {
    try {
      await deleteTodo(id);
      setTodos((current) => current.filter((item) => item.id !== id));
      setErrorMessage(null);
    } catch (error) {
      setErrorMessage("Something went wrong. Try again.");
      throw error;
    }
  }

  return (
    <PageTemplate>
      <div className="mx-auto w-full max-w-2xl">
        {errorMessage ? (
          <p className="mb-4 text-red-600" role="alert">
            {errorMessage}
          </p>
        ) : null}
        <TodoList
          todos={todos}
          onAdd={onAdd}
          onUpdate={onUpdate}
          onDelete={onDelete}
        />
      </div>
    </PageTemplate>
  );
};

export { TodoPage };
export default TodoPage;
