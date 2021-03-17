require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const app = express();
const PORT = process.env.PORT || 4000;
const cors = require("cors");
const useRoute = require("./routes/userRoute");
const formRoute = require("./routes/formRoute");

mongoose.connect(process.env.DATABASE_CONNECTION_STRING, {
  useCreateIndex: true,
  useUnifiedTopology: true,
  useNewUrlParser: true,
});

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(useRoute);
app.use(formRoute);

app.listen(PORT, () => {
  console.log(`localhost:${PORT}`);
});
