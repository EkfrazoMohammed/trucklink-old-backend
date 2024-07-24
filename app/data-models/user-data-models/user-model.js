const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const Schema = mongoose.Schema;

const userSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phoneNumber: { type: String, required: true },
  countryCode: { type: String, default: "+91" },
  password: { type: String, required: true },

  roleName: {
    type: String,
    required: true,
    enum: ["Admin", "General User"],
    default: "General User",
  },

  resetPasswordToken: { type: String },
  isActive: { type: Boolean, default: true },

  createdAt: { type: Date, default: Date.now },
  modifiedAt: { type: Date, default: Date.now },
});

userSchema.methods.comparePassword = (candidatePassword, userPassword, cb) => {
  bcrypt.compare(candidatePassword, userPassword, (err, isMatch) => {
    if (err) return cb(err, false);
    cb(null, isMatch);
  });
};

// expose enum on the model, and provide an internal convenience reference
const reasons = (userSchema.statics.failedLogin = {
  NOT_FOUND: 0,
  PASSWORD_INCORRECT: 1,
});

userSchema.statics.getAuthenticated = (email, password, cb) => {
  User.findOne({ email: email })
    .populate("role")
    .exec((err, user) => {
      if (err) return cb(err);

      // make sure the user exists
      if (!user) {
        return cb(null, null, reasons.NOT_FOUND);
      }

      user.comparePassword(password, user.password, (err, isMatch) => {
        if (err) return cb(err);
        // check if the password was a match
        if (isMatch) {
          return cb(null, user);
        }
        return cb(null, null, reasons.PASSWORD_INCORRECT);
      });
    });
};

const User = mongoose.model("User", userSchema);
module.exports = User;
