import { Router, json } from "express";
import { createTodo, getTodos, getTodo, updateTodo } from "./controllers.js";
import { NotFoundError } from "./errors.js";

export const router = Router();

// Use cases
router.get("/todos", controllerWrapper(getTodos));
router.get("/todos/:id", controllerWrapper(getTodo));
router.post("/todos", json(), controllerWrapper(createTodo));
router.patch("/todos/:id", json(), controllerWrapper(updateTodo));

// 404 middleware
router.use((req, res, next) => {
  next(new NotFoundError(`Not found: ${req.url}`)); // When next() is called with an error, it calls the next error middleware (here the errorHandler)
});


// Controller Wrapper : so we don't have to add a global try/catch in each controller
function controllerWrapper(middlewareFunction) {
  return async (req, res, next) => {
    try {
      // Wrap the controller call in a global try/catch, in case of unexpected error (dev mistake, database crash, ...)
      await middlewareFunction(req, res, next);
    } catch (error) {
      // Pass the handled error to the next middleware : our global error handler
      next(error); 
    }
  }
}
