import express from "express";
import { router } from "./router.js";
import { errorHandler } from "./errorHandler.js"

// Create Express app
export const app = express();

// Plug routes
app.use(router);

// Use global error handler
app.use(errorHandler);
