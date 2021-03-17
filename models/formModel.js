const mongoose = require("mongoose");
const formSchema = new mongoose.Schema(
  {
    formUrl: {
      type: String,
      required: true,
    },
    formName: {
      type: String,
      required: true,
    },
    questions: [],
    ownerName: {
      type: String,
      required: true,
    },
    ownerId: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Form", formSchema);
