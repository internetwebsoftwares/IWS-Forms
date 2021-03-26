const router = require("express").Router();
const auth = require("../middleware/auth");
const Form = require("../models/formModel");
const Users = require("../models/userModel");
const Report = require("../models/reportModel");

//Create report
router.post("/report/:formId/add", auth, async (req, res) => {
  try {
    const form = await Form.findById(req.params.formId);
    if (!form) {
      return res.send("No form found");
    }
    const report = new Report({
      reportedById: req.user._id,
      reportedByUsername: req.user.username,
      reportedOnFormId: req.params.formId,
      reportedOnFormName: form.formName,
      formOwnerId: form.ownerId,
    });

    await report.save();
    res.send("Report created");
  } catch (error) {
    res.send(error);
  }
});

//Read all reports
router.get("/report/all-reports/:pageNo", auth, async (req, res) => {
  try {
    if (!req.user.admin) {
      return res.send(
        "Poor hacker don't try to steal our information next time."
      );
    }

    const reports = await Report.find()
      .limit(10)
      .skip(parseInt(req.params.pageNo) * 10);
    res.send(reports);
  } catch (error) {
    res.send(error);
  }
});

//Delete form because of reports
router.delete("/report/:formId/delete-admin", auth, async (req, res) => {
  try {
    const form = await Form.findById(req.params.id);
    const user = await Users.findOne({ _id: form.ownerId });
    const reporters = await Report.find({
      reportedOnFormId: req.params.formId,
    });

    if (!req.user.admin) {
      return res.send("You dont have this permission");
    }

    user.totalForms--;
    user.notifications.push({
      title: "Your form is deleted by Us",
      message: `Your form ${formName} is deleted after manual investigation, The form did not follow our guidelines`,
    });
    reporters.forEach((reporter) => {
      reporter.notifications.push({
        title: `${form.formName} has been deleted by us.`,
        message: `Thanks for your report the has been deleted successfully & keep reporting us if you found anything on the plartform & keep our community clean, again on behalf of our CEO THANKYOU :)`,
      });
      reporter.save();
    });
    await user.save();
    await form.delete();
    res.send("Form deleted by admin.");
  } catch (error) {
    console.log(error);
  }
});

module.exports = router;
