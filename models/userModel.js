const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      minLength: 3,
      required: true,
    },
    email: {
      type: String,
      unique: true,
      required: true,
    },
    password: {
      type: String,
      required: true,
      minLength: 7,
    },
    totalForms: {
      type: Number,
      default: 0,
    },
    country: {
      type: String,
      required: true,
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
    totalNotifications: {
      type: Number,
      default: 0,
    },
    notifications: [],
    tokens: [
      {
        token: {
          type: String,
          required: true,
        },
      },
    ],
  },
  { timestamps: true }
);

//Hashing password before saving into DB
userSchema.pre("save", async function (next) {
  const user = this;
  if (user.isModified("password")) {
    user.password = await bcrypt.hash(user.password, 8);
  }
  next();
});

//Generating Auth token
userSchema.methods.generateAuthToken = async function () {
  try {
    const user = this;
    const token = jwt.sign(
      { _id: user._id.toString() },
      process.env.JWT_AUTH_TOKEN
    );
    user.tokens = user.tokens.concat({ token });
    await user.save();
    return token;
  } catch (error) {
    res.status(500).send(error);
  }
};

//Hiding private details
userSchema.methods.toJSON = function () {
  const user = this;
  const userObject = user.toObject();
  delete userObject.password;
  delete userObject.tokens;
  return userObject;
};

module.exports = new mongoose.model("User", userSchema);
