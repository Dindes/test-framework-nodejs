"use strict";

/**
 * @author Oom Sveta <oomsveta@protonmail.com>
 */

import { createServer } from "http";
import { on } from "events";
import { readFileSync } from "fs";
import { join } from "path";
import console from "./Console.js";

class HttpServer {

    routes = {};

    /**
     * @param { Number } port The port to listen to
     */
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
                // TODO: implement proper 404
                res.statusCode = 404;
                res.end("Error 404: not found");
            }
            console.log(`[SERVER] ${req.method} ${req.url} ${res.statusCode}`);
        }
    }

    /**
     * @description Map every route in config/routes.json to its handler
     */
    #loadRoutes() {
        try {
            var routes = JSON.parse(readFileSync(join(process.cwd(), "config", "routes.json"), "UTF-8"));
        } catch (e) {
            if (e.constructor.name === "SyntaxError")
                console.error("Cannot load routes.json. Maybe your JSON is malformed?");
            else if (e.code === "ENOENT")
                console.error("Cannot load routes.json. Make sure that the file is actually in the config directory.");
            else
                console.error(e.message);

            process.exit(1);
        }

        for (const route of routes) {
            // TODO: handle malformed routes
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