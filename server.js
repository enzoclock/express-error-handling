import { app } from "./app.js";

// Start server
const port = process.env.PORT || 0;
const server = app.listen(port, () => {
  console.log(`🚀 Listening at: http://localhost:${server.address().port}`);
});

