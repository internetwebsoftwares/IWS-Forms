require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const app = express();
const PORT = process.env.PORT || 4000;
const useRoute = require("./routes/userRoute");
const formRoute = require("./routes/formRoute");
const answerRoute = require("./routes/answerRoute");

mongoose.connect(process.env.DATABASE_CONNECTION_STRING, {
  useCreateIndex: true,
  useUnifiedTopology: true,
  useNewUrlParser: true,
});

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "http://localhost:3000/");
  res.header("Access-Control-Allow-Headers", "*");
  if (req.method === "OPTIONS") {
    res.header("Access-Control-Allow-Methods", "GET, POST, PATCH, PUT, DELETE");
    return res.status(200).send({});
  }
});

app.use(useRoute);
app.use(formRoute);
app.use(answerRoute);

app.listen(PORT, () => {
  console.log(`localhost:${PORT}`);
});
