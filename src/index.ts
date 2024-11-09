import { createPdfController } from "./controllers/createPdfController";
import healthCheckController from "./controllers/healthCheckController";

const express = require("express");

const app = express();
const body = require("body-parser");

async function start() {
  try {
    const app = express();

    // Body parser
    app.use(body.json());

    // Routes
    app.get("/", healthCheckController);
    app.post("/create-pdf", createPdfController);

    // Start server
    app.listen(3000, () => {
      console.log("Server is running on port 3000");
    });
  } catch (error) {
    console.log(error);
  }
}

start();
