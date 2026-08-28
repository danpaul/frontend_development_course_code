import { createTodo } from "@/actions/todo/createTodo/createTodo";
import { deleteTodo } from "@/actions/todo/deleteTodo/deleteTodo";
import { listTodos } from "@/actions/todo/listTodos/listTodos";
import { updateTodo } from "@/actions/todo/updateTodo/updateTodo";
import { TodoPage } from "@/components/pages/TodoPage/TodoPage";

export const dynamic = "force-dynamic";

export default async function Home() {
  const initialTodos = await listTodos();
  return (
    <TodoPage
      initialTodos={initialTodos}
      createTodo={createTodo}
      updateTodo={updateTodo}
      deleteTodo={deleteTodo}
    />
  );
}
