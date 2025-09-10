#!/usr/bin/env node

/**
 * Development startup script
 * Starts both frontend and backend servers concurrently
 */

const { spawn } = require("child_process");
const path = require("path");

console.log("🚀 Starting Last Minutes Today Development Environment...\n");

// Start backend server
console.log("📧 Starting backend server...");
const backend = spawn("node", ["server.js"], {
  cwd: __dirname,
  stdio: "inherit",
  shell: true,
});

// Start frontend server (from parent directory)
console.log("⚛️  Starting frontend server...");
const frontend = spawn("npm", ["run", "dev"], {
  cwd: path.join(__dirname, ".."),
  stdio: "inherit",
  shell: true,
});

// Handle process termination
process.on("SIGINT", () => {
  console.log("\n🛑 Shutting down servers...");
  backend.kill();
  frontend.kill();
  process.exit(0);
});

// Handle errors
backend.on("error", (err) => {
  console.error("❌ Backend error:", err);
});

frontend.on("error", (err) => {
  console.error("❌ Frontend error:", err);
});

console.log("\n✅ Development servers started!");
console.log("📧 Backend: http://localhost:5000");
console.log("⚛️  Frontend: http://localhost:5173");
console.log("\nPress Ctrl+C to stop both servers\n");
