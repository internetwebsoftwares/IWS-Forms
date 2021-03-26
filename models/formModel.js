const mongoose = require("mongoose");
const formSchema = new mongoose.Schema(
  {
    isAcceptingResponses: {
      type: Boolean,
      default: true,
    },
    formName: {
      type: String,
      required: true,
    },
    institutionName: {
      type: String,
      required: true,
    },
    alreadySubmitted: [],
    isThisExaminationForm: {
      type: Boolean,
      default: false,
    },
    outOfMarks: {
      type: Number,
    },
    reportedBy: [],
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
