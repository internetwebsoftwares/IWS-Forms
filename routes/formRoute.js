const router = require("express").Router();
const auth = require("../middleware/auth");
const Form = require("../models/formModel");
const Users = require("../models/userModel");
const Report = require("../models/reportModel");

//Create form
router.post("/new-form", auth, async (req, res) => {
  let {
    questions,
    formName,
    institutionName,
    isThisExaminationForm,
    isPoll,
    outOfMarks,
  } = req.body;
  try {
    const form = new Form({
      questions,
      formName,
      institutionName,
      isPoll,
      ownerName: req.user.username,
      ownerId: req.user._id,
      isThisExaminationForm,
      outOfMarks,
    });
    req.user.totalForms++;
    await req.user.save();
    await form.save();
    res.send({ formId: form._id });
  } catch (error) {
    console.log(error);
  }
});

//Read all forms
router.get("/forms/all/:pageNo", auth, async (req, res) => {
  try {
    const forms = await Form.find({})
      .limit(10)
      .skip(parseInt(req.params.pageNo * 10));
    if (!req.user.isAdmin) {
      return res.send(
        `Your IP Address ${req.connection.remoteAddress} have been traced you are trying to get confidential informations from our database. soon you will recieve calls from FBI.`
      );
    }
    res.send(forms);
  } catch (error) {
    console.log(error);
  }
});

//Read all user, forms, reports
router.get("/all/data", auth, async (req, res) => {
  try {
    const users = await Users.find({});
    const forms = await Form.find({});
    const reports = await Report.find({});

    if (!req.user.isAdmin) {
      return res.send(
        `Your IP Address ${req.connection.remoteAddress} have been traced you are trying to get confidential informations from our database. soon you will recieve calls from FBI.`
      );
    }
    res.send({
      totalUsers: users.length,
      totalForms: forms.length,
      totalReports: reports.length,
    });
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
    req.user.totalForms--;
    await req.user.save();
    await form.delete();
    res.send("Form deleted.");
  } catch (error) {
    console.log(error);
  }
});

module.exports = router;
