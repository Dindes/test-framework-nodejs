"use strict";

import { createServer } from "http";
import { on } from "events";
import { readFileSync } from "fs";
import { join } from "path";

class HttpServer {

    routes = {};

    constructor(port = 80) {
        this.port = port;
        this.server = createServer();
    }

    async start() {
        this.#loadRoutes();
        this.server.listen(this.port, console.log.bind(null, "Listening on port " + this.port));
        for await (const [req, res] of on(this.server, "request")) {
            if (req.url in this.routes) {
                this.routes[req.url](req, res);
            } else {
                res.statusCode = 404;
                res.end("Error 404: not found");
            }
            console.log(`[SERVER] ${req.method} ${req.url} ${res.statusCode}`);
        }
    }

    #loadRoutes() {
        try {
            var routes = JSON.parse(readFileSync(join(process.cwd(), "config", "routes.json"), "UTF-8"));
        } catch (e) {
            if (e.constructor === "SyntaxError")
                console.error("[ERROR] Cannot load routes.json. Maybe your JSON is malformed?");
            else if (e.code === "ENOENT")
                console.error("[ERROR] Cannot load routes.json. Make sure that the file is actually in the config directory.");
            else
                console.error("[ERROR] " + e.message);

            process.exit(1);
        }

        for (const route of routes) {
            const [controller, handler] = route.controller.split`.`;
            import(`./Controller/${controller}.js`)
                .then(controller => this.routes[route.path] = controller.default[handler]);
        }
    }

    getPort() {
        return this.port;
    }
}

export default HttpServer;