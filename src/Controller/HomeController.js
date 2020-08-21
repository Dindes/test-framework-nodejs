"use strict";

class HomeController {
    static home(req, res) {
        res.end("home")
    }

    static wow(req, res) {
        res.end("shrek")
    }
}

export default HomeController;