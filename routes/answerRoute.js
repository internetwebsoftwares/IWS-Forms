const router = require("express").Router();
const auth = require("../middleware/auth");
const Form = require("../models/formModel");
const Answer = require("../models/answerModel");

//Answer the form
router.post("/form/:id/answer", auth, async (req, res) => {
  let { answersByUser } = req.body;
  try {
    const user = req.user;

    const form = await Form.findById(req.params.id);

    if (!form.isAcceptingResponses) {
      return res.send("Form is no longer accepting responses.");
    }

    const totalQuestions = form.questions.length;

    const answer = await Answer({
      formName: form.formName,
      postedOnId: req.params.id,
      postedById: user._id,
      postedByUsername: user.username,
      formOwnedBy: form.ownerId,
      isThisExaminationForm: form.isThisExaminationForm,
      outOfMarks: form.outOfMarks,
    });

    let answers = [];

    for (let i = 0; i < totalQuestions; i++) {
      answers.push({
        question: form.questions[i].question,
        answer: answersByUser[i],
      });
    }

    answer.answers = answers;
    form.alreadySubmitted.push(req.user._id.toString());

    await form.save();
    await answer.save();
    res.send("Answer submitted");
  } catch (error) {
    console.log(error);
  }
});

//Read all answers on a form
router.get("/form/:id/:pageNo/answers", auth, async (req, res) => {
  try {
    const answers = await Answer.find({
      postedOnId: req.params.id.toString(),
      formOwnedBy: req.user._id.toString(),
    })
      .limit(2)
      .skip(parseInt(req.params.pageNo * 2));
    res.send(answers);
  } catch (error) {
    console.log(error);
  }
});

//Read one answer
router.get("/answer/:id/answer", auth, async (req, res) => {
  try {
    const answer = await Answer.findOne({
      _id: req.params.id,
      formOwnedBy: req.user._id,
    });
    if (!answer) {
      return res.send("No answer found");
    }
    res.send(answer);
  } catch (error) {
    console.log(error);
  }
});

// Check the answers
router.put("/answer/:id/check", auth, async (req, res) => {
  let { totalMarks, remark } = req.body;
  try {
    const answer = await Answer.findOne({
      _id: req.params.id,
      formOwnedBy: req.user._id.toString(),
    });
    if (!answer) {
      return res.send("No form found");
    }
    answer.isChecked = true;
    answer.score = totalMarks;
    answer.remark = remark;
    await answer.save();
    res.send("Answer checked");
  } catch (error) {
    console.log(error);
  }
});

module.exports = router;
