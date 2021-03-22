const mongoose = require("mongoose");
const answerSchema = new mongoose.Schema(
  {
    postedByUsername: {
      type: String,
      required: true,
    },
    postedById: {
      type: String,
      required: true,
    },
    postedOnId: {
      type: String,
      required: true,
    },
    formOwnedBy: {
      type: String,
      required: true,
    },
    formName: {
      type: String,
      required: true,
    },
    isChecked: {
      type: Boolean,
      default: false,
    },
    score: {
      type: Number,
      default: 0,
    },
    answers: [],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Answer", answerSchema);
