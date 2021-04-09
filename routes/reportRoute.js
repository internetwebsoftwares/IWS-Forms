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

    form.reportedBy.push(req.user._id);

    await form.save();
    await report.save();
    res.send("Report created");
  } catch (error) {
    res.send(error);
  }
});

//Read all reports
router.get("/report/all-reports/:pageNo", auth, async (req, res) => {
  try {
    if (!req.user.isAdmin) {
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
router.delete("/report/:formId/delete", auth, async (req, res) => {
  try {
    const form = await Form.findById(req.params.formId);
    const user = await Users.findOne({ _id: form.ownerId });
    const reports = await Report.find({
      reportedOnFormId: req.params.formId,
    });

    if (!req.user.isAdmin) {
      return res.send("You dont have this permission");
    }

    user.totalForms--;
    user.totalNotifications++;
    user.notifications.push({
      isRead: false,
      createdAt: new Date().getTime(),
      title: "Your form is deleted by Us",
      message: `Your form ${form.formName} is deleted after manual investigation, The form did not follow our guidelines`,
    });

    reports.forEach(async (report) => {
      const reporter = await Users.findById(report.reportedById);
      reporter.totalNotifications++;
      reporter.notifications.push({
        title: `${form.formName} has been deleted by us.`,
        message: `Thanks for your report the form ${form.formName} has been deleted by us successfully. Keep reporting us if you find anything wrong on the plartform & keep our community clean, again on behalf of our CEO Ata Shaikh THANKYOU :)`,
        createdAt: new Date().getTime(),
      });
      await reporter.save();
      await report.remove();
    });
    await user.save();
    await form.remove();
    res.send("Form deleted by admin.");
  } catch (error) {
    res.send(error);
  }
});

module.exports = router;
