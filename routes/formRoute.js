const router = require("express").Router();
const auth = require("../middleware/auth");
const Form = require("../models/formModel");
const Answer = require("../models/answerModel");

//Create form
router.post("/new-form", auth, async (req, res) => {
  let {
    questions,
    formName,
    institutionName,
    isThisExaminationForm,
    outOfMarks,
  } = req.body;
  try {
    const form = new Form({
      questions,
      formName,
      institutionName,
      ownerName: req.user.username,
      ownerId: req.user._id,
      isThisExaminationForm,
      outOfMarks,
    });
    await form.save();
    res.send({ formId: form._id });
  } catch (error) {
    console.log(error);
  }
});

//Read a form
router.get("/form/:id/", async (req, res) => {
  const form = await Form.findById(req.params.id);
  if (!form) {
    return res.send("Form not found");
  }
  res.send(form);
});

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

//Read all your forms
router.get("/form/all/:pageNo", auth, async (req, res) => {
  try {
    const forms = await Form.find({ ownerId: req.user._id.toString() })
      .sort({ createdAt: "-1" })
      .limit(10)
      .skip(parseInt(req.params.pageNo * 10));
    res.send(forms);
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
      .limit(10)
      .skip(parseInt(req.params.pageNo * 10));
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

//Check the answers
router.patch("/answer/:id/answer", auth, async (req, res) => {
  let { totalMarks } = req.body;
  try {
    const answer = await Answer.findOne({
      _id: req.params.id,
      formOwnedBy: req.user._id.toString(),
    });
    if (!form) {
      return res.send("No form found");
    }
    answer.isChecked = true;
    answer.score = totalMarks;
    await answer.save();
    res.send("Answer checked");
  } catch (error) {
    console.log(error);
  }
});

//Stop/Start accepting responses
router.patch("/form/:id/accepting-responses", auth, async (req, res) => {
  try {
    const form = await Form.findOne({
      _id: req.params.id,
      ownerId: req.user._id,
    });

    if (!form) {
      return res.send("This form is not created by you.");
    }
    form.isAcceptingResponses = `${form.isAcceptingResponses ? false : true}`;
    await form.save();
    res.send(`Form is accepting responses: ${form.isAcceptingResponses}`);
  } catch (error) {
    console.log(error);
  }
});

//Delete a form
router.delete("/form/:id/delete", auth, async (req, res) => {
  try {
    const form = await Form.findOne({
      _id: req.params.id,
      ownerId: req.user._id,
    });

    if (!form) {
      return res.send("This form is not created by you.");
    }

    await form.delete();
    res.send("Form deleted.");
  } catch (error) {
    console.log(error);
  }
});

module.exports = router;
