require("dotenv").config();

const app = require("./app");

const PORT = process.env.PORT || 3001;

const server = app.listen(PORT, () => {
  console.log(`FabricSave AI running at http://localhost:${PORT}`);
});

server.on("error", error => {
  console.error("Server error:", error.message);
});