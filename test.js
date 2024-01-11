import { describe, before, after, it, mock } from "node:test";
import assert from "node:assert";
import { app } from "./app.js";
import { db } from "./database.js";

let server;
let baseUrl;

describe("[Todo API endpoints]", () => {

  before(async () => {
    // Start a testing server 
    server = app.listen(0); // Start server on random port

    // Get the testing URL
    baseUrl = `http://localhost:${server.address().port}`;
    
    // Mock the console.error function (to have clear a tests output)
    console.error = mock.fn();
  });

  after(async () => {
    // Stop the testing server
    server.close();
    
    // Clear mocks
    mock.reset()
  })

  describe("[GET /todos]", () => {
    it("should return a valid status code and body", async () => {
      const URL = `${baseUrl}/todos`;

      const { body, statusCode } = await get(URL);

      assert.equal(statusCode, 200);
      assert.ok(body instanceof Array);
    });

    it("should return all todos", async () => {
      const URL = `${baseUrl}/todos`;

      const { body: todos } = await get(URL);

      todos.forEach(todo => {
        assert.ok(typeof todo.content === "string");
        assert.ok(typeof todo.isDone === "boolean");
      })
    });
  });

  describe("[GET /todos/id]", () => {
    it("should return a valid status code and body", async () => {
      const URL = `${baseUrl}/todos/1`;

      const { body, statusCode } = await get(URL);

      assert.equal(statusCode, 200);
      assert.ok(body instanceof Object);
    });

    it("should return one todo", async () => {
      const URL = `${baseUrl}/todos/1`;

      const { body: todo } = await get(URL);

      assert.ok(typeof todo.content === "string");
      assert.ok(typeof todo.isDone === "boolean");
    });

    it("should return an error when the requested todo does not exist", async () => {
      const URL = `${baseUrl}/todos/42`;

      const { body, statusCode } = await get(URL);
      assert.equal(statusCode, 404);
      assert.equal(body.statusCode, 404);
      assert.equal(body.message, "cannot find todo with id 42");
      assert.match(body.stack, /NotFoundError/);
    });
  });

  describe("[POST /todos]", () => {
    it("should return a valid status code and body", async () => {
      const URL = `${baseUrl}/todos`;
      const todo = { content: "Vacuum the living room", isDone: false };

      const { body, statusCode } = await post(URL, todo);

      assert.equal(statusCode, 201);
      assert.ok(body instanceof Object);
    });

    it("should return the inserted todo", async () => {
      const URL = `${baseUrl}/todos`;
      const todo = { content: "Vacuum the living room", isDone: false };

      const { body: insertedTodo } = await post(URL, todo);

      const { id, ...todoFields } = insertedTodo;
      assert.ok(typeof id === "number");
      assert.deepEqual(todoFields, todo);
    });

    it("should return an error when 'content' property is not provided", async () => {
      const URL = `${baseUrl}/todos`;
      const todo = { isDone: false };

      const { statusCode, body } = await post(URL, todo);

      assert.equal(statusCode, 400);
      assert.equal(body.statusCode, 400);
      assert.equal(body.message, "property 'content' should be a non empty string");
      assert.match(body.stack, /BadRequestError/);
    });
  });

  describe("[PATCH /todos]", () => {
    it("should return a valid status code", async () => {
      const URL = `${baseUrl}/todos/1`;
      const todo = { isDone: true };

      const { statusCode } = await patch(URL, todo);

      assert.equal(statusCode, 204);
    });

    // This test is here to demonstrate how the error handler will catch unexpected code error
    // When we witness this bug in production, we would fix the controller behavior instead of having this test
    it("should throw a 500 error when badly controlled inputs make the use case fail", async () => {
      const URL = `${baseUrl}/todos/1`;
      const todo = { isDone: "I'm supposed to be a boolean" };

      const { statusCode, body } = await patch(URL, todo);

      assert.equal(statusCode, 500);
      assert.equal(body.statusCode, 500);
      assert.equal(body.message, "Internal server error");
      assert.match(body.stack, /A wild database error occured/);
    });
  });

  describe("[Infrastructure] Global error handler", () => {
    // This test actually test the error handler, making sure an unexpecting database error will be caught properly
    it("should throw a 500 error when a unexpected database error occurs", async () => {
      const URL = `${baseUrl}/todos/1`;
      const todo = { isDone: true };
      mock.method(db, "updateTodo", () => { throw new Error("Unexpected database error"); });
  
      const { statusCode, body } = await patch(URL, todo);
  
      assert.equal(statusCode, 500);
      assert.equal(body.statusCode, 500);
      assert.equal(body.message, "Internal server error");
      assert.match(body.stack, /Unexpected database error/);
    });

    // This test checks the global 404 middleware
    it("should return a 404 response status and body when unregistered URL is reached", async () => {
      const PATH = "/unregistered"
      const URL = `${baseUrl}${PATH}`;

      const { statusCode, body } = await get(URL);

      assert.equal(statusCode, 404);
      assert.equal(body.statusCode, 404);
      assert.equal(body.message, `Not found: ${PATH}`);
      assert.match(body.stack, /NotFoundError/);
    });
  });
});



// === Test utilities ===

async function get(url) {
  const httpResponse = await fetch(url);
  return {
    statusCode: httpResponse.status,
    body: await httpResponse.json()
  }
}

async function post(url, body) {
  const httpResponse = await fetch(url, {
    method: "POST",
    body: JSON.stringify(body),
    headers: { "Content-Type": "application/json" }
  });
  return {
    statusCode: httpResponse.status,
    body: await httpResponse.json()
  }
}

async function patch(url, body) {
  const httpResponse = await fetch(url, {
    method: "PATCH",
    body: JSON.stringify(body),
    headers: { "Content-Type": "application/json" }
  });
  return {
    statusCode: httpResponse.status,
    body: httpResponse.status !== 204 && await httpResponse.json()
  }
}
