const express = require("express");
const { encryptField } = require("./encryptField");

const app = express();

// Middleware to parse request body

app.use(express.json());

const fields = ["email:text", "name:text", "don't_work"];

app.get("/api/form", (req, res) => {
  const encryptedArr = fields.map((field) => encryptField(field));

  res.status(200).json(encryptedArr);
});

app.post("/api/submit", (req, res) => {
  console.log(req.body);

  res.status(200).json({ message: "Data received successfully" });
});

app.listen(3000, () => {
  console.log("App running on PORT 3000");
});
