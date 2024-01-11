import { db } from "./database.js";
import { BadRequestError, NotFoundError } from "./errors.js";

export async function getTodos(req, res) {
  const todos = await db.getTodos();

  res.status(200).json(todos);
}

export async function getTodo(req, res) {
  const todoId = parseInt(req.params.id);

  const todo = await db.getTodo(todoId);
  if (! todo) { throw new NotFoundError(`cannot find todo with id ${todoId}`); }  // Thrown (trusted) error will be catch by our global error handler

  return res.status(200).json(todo);
}

export async function createTodo(req, res) {
  const { content, isDone } = req.body;

  // Data validation
  if (! isNonEmptyString(content)) { throw new BadRequestError("property 'content' should be a non empty string"); }
  if (! isBoolean(isDone)) { throw new BadRequestError("property 'isDone' should be a a boolean"); } // Thrown (trusted) error will be catch by our global error handler
  
  const insertedTodo = await db.createTodo({ content, isDone });

  res.status(201).json(insertedTodo);
}

export async function updateTodo(req, res) {
  const todoId = parseInt(req.params.id, 10);
  const { content, isDone } = req.body;

  await db.updateTodo(todoId, {
    ...(content && { content }), // Oupsy, we forgot to check that 'content' is a valid string (it can be a number here!). We might get a database error if user intend to insert something invalid ! Thanksfully, our global error handler will handle this 500 error.
    ...(isDone === undefined ? {} : { isDone })
  });

  res.status(204).end();
}

// === Utils ===

function isNonEmptyString(value) {
  if (typeof value !== "string") { return false; } 
  return value.length > 0;
}

function isBoolean(value) {
  return typeof value === "boolean";
}
