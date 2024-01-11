import { HttpClientError } from "./errors.js";

export async function errorHandler(error, req, res, _next) { // Error middlewares need to have 4 parameters to work
  
  // 1. Logger : properly log the error with your favorite logger (winston, morgan, ...)
  console.error(error);


  // 2. Client errors : send proper API response 
  if (error instanceof HttpClientError) {
    const { message, statusCode, stack } = error;
    res
      .status(statusCode)
      .json({
        statusCode,
        message,
        ...(isProd() ? {} : { stack }) // Do not include the call stack in production
      });
    return;
  }


  // 3. Server errors : send proper API response
  res
    .status(500)
    .json({
      statusCode: 500,
      message: "Internal server error",
      ...(isProd() ? {} : { stack: error.stack })
    });
}


function isProd() {
  return process.env.NODE_ENV === "production";
}
