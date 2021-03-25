const mongoose = require("mongoose");
const reportSchema = new mongoose.Schema(
  {
    reportedById: {
      type: String,
      required: true,
    },
    reportedByUsername: {
      type: String,
      required: true,
    },
    reportedOnFormId: {
      type: String,
      required: true,
    },
    reportedOnFormName: {
      type: String,
      required: true,
    },
    formOwnerId: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Report", reportSchema);
