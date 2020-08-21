"use strict";

import HttpServer from "./src/HttpServer.js";

const server = new HttpServer(8080);
server.start();