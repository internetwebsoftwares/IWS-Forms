const router = require("express").Router();
const User = require("../models/userModel");
const Form = require("../models/formModel");
const Answer = require("../models/answerModel");
const auth = require("../middleware/auth");
const isEmail = require("validator/lib/isEmail");
const bcrypt = require("bcryptjs");
const { superCheck } = require("../simplepasswordChecker.js");

//Create user (Sign up)
router.post("/sign-up", async (req, res) => {
  let { username, email, country, password } = req.body;
  //Check all fields are filled
  if (!username || !email || !password || !country) {
    return res.send("All fields are required.");
  }
  //Check if username is not too short
  if (username.length < 3) {
    return res.send("Username must be of atleast 3 characters long.");
  }

  //Check if email alreadty exits
  const isEmailExist = await User.findOne({ email });
  if (isEmailExist) {
    return res.send("There is already an account with this email");
  }
  //Check if email is valid
  if (!isEmail(email)) {
    return res.send("Please enter valid email address.");
  }
  //Check if country
  if (!country) {
    return res.send("Please enter country name.");
  }

  //Check if password is not short & contains a symbol a number
  if (!superCheck(password, 7)) {
    return res.send(
      "Password must contains a symbol a number and must be of atlest 7 digits"
    );
  }
  try {
    const user = new User({
      username,
      email,
      country,
      password,
    });
    const token = await user.generateAuthToken();
    await user.save();
    res.json({
      message: "User created successfully",
      user,
      token,
    });
  } catch (error) {
    res.status(500).send(error);
  }
});

//Sign in
router.post("/login", async (req, res) => {
  let { email, password } = req.body;
  if (!email || !password) {
    return res.send("Please enter email & password.");
  }
  const user = await User.findOne({ email });
  if (!user) {
    return res.send("Incorrect username or password.");
  }
  const isPasswordCorrect = await bcrypt.compare(password, user.password);
  if (!isPasswordCorrect) {
    return res.send("Incorrect username or password.");
  }
  try {
    const token = await user.generateAuthToken();
    res.status(200).send({
      user,
      token,
    });
  } catch (error) {
    res.status(500).send(error);
  }
});

//Read one user
router.get("/user/:id", async (req, res) => {
  const user = await User.findOne({ _id: req.params.id });
  res.status(200).send(user);
});

//Update user profile
router.patch("/user/edit", auth, async (req, res) => {
  const user = req.user;
  const updatesAvailable = ["username", "country"];
  const userUpdating = Object.keys(req.body);
  const isValidOperation = userUpdating.every((update) => {
    return updatesAvailable.includes(update);
  });

  if (!isValidOperation) {
    return res.send("Invalid Updates");
  }

  userUpdating.forEach((update) => {
    user[update] = req.body[update];
  });

  await user.save();

  res.status(200).send(user);
});

//Change password
router.patch("/user/change-password", auth, async (req, res) => {
  let { currentPassword, newPassword } = req.body;

  try {
    const user = req.user;
    const isPasswordCorrect = await bcrypt.compare(
      currentPassword,
      user.password
    );

    if (!isPasswordCorrect) {
      return res.send("Current password is incorrect.");
    }

    if (!superCheck(newPassword, 7)) {
      return res.send(
        "Password must contains a symbol a number and must be of atlest 7 digits"
      );
    }

    await user.save();

    res.send("Password changed successfully.");
  } catch (error) {
    res.status(500).send(error);
  }
});

//Delete account
router.delete("/user/delete-account", auth, async (req, res) => {
  try {
    const user = req.user;
    const forms = await Form.find({ ownerId: user._id });
    const answers = await Answer.find({ postedById: user._id });
    const password = req.body.password;
    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return res.send("Incorrect password");
    }
    for (let form of forms) {
      await form.remove();
    }
    for (let answer of answers) {
      await answer.remove();
    }
    await user.remove();
    res.send("Your account is deleted permanently.");
  } catch (error) {
    res.status(500).send(error);
  }
});

//logout
router.post("/user/logout", auth, async (req, res) => {
  try {
    const user = req.user;
    user.tokens = user.tokens.filter((token) => {
      return token.token !== req.token;
    });
    await user.save();
    res.send("Logged out successfully.");
  } catch (error) {
    res.status(500).send(error);
  }
});

module.exports = router;
