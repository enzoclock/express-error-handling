export const db = createFakeDatabase();

function createFakeDatabase() {
  // Fake database client for demonstration purpose.
  // Exemple of real database clients : pg, sequelize, typeorm, knex, mongo, mongoose...
 
  const todos = [
    { id: 1, content: "Do the dishes", isDone: false },
    { id: 2, content: "Walk the dog", isDone: true },
    { id: 3, content: "Do some sports", isDone: false },
  ];

  return { getTodos, getTodo, createTodo, updateTodo };


  // ==== Fake Data API implementation ===

  async function getTodos() {
    return todos;
  }

  async function getTodo(todoId) {
    return todos.find(({ id }) => id === todoId) || null;
  }

  async function createTodo({ content, isDone }) {
    // Fake error that might occur in the database
    if (! content) { throw new Error("💥 A wild database error occured : Todo.content should be a valid string"); }

    const newTodo = { id: getNextId(), content, isDone: !!isDone };
    todos.push(newTodo);
    return newTodo;
  }

  async function updateTodo(todoId, { content, isDone }) {
    if (typeof todoId !== "number") { throw new Error(`💥 A wild database error occured : Cannot find todo with id ${todoId}`); }
    if (content && typeof content !== "string") { throw new Error("💥 A wild database error occured : Todo.content should be a valid string"); }
    if (isDone !== undefined && typeof isDone !== "boolean") { throw new Error("💥 A wild database error occured : Todo.isDone should be a boolean"); }

    const todoIndex = todos.findIndex(({ id }) => id === todoId);
    const currentTodo = todos[todoIndex];
    
    const editedTodo = { ...currentTodo, content, isDone };
    todos[todoIndex] = editedTodo;
    return editedTodo;
  }

  function getNextId() {
    return 1 + Math.max(...todos.map(({ id }) => id));
  }
}
