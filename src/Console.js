"use strict";

console.error = (...args) => console.log("❌\x1b[91m", ...args, "\x1b[0m");

export default console;