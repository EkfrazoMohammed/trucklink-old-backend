const sgMail = require("@sendgrid/mail");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const moment = require("moment");

const User = require("../../data-models/user-data-models/user-model");
const ActivityLog = require("../../data-models/user-data-models/activity-log-model");
const { JWT_KEY } = require("../../configure/dotenv-values");


module.exports = class AccountController {
  static userLogin(loginRequest) {
    try {
      return new Promise((resolve, reject) => {

        User.getAuthenticated(
          loginRequest.email,
          loginRequest.password,
          (err, user, reason) => {
            if (err) reject(err);
            if (user && !user.isActive) {
              return reject({ message: "User is currently inactive" });
            }
            if (user && user.isActive) {
              const token = jwt.sign({}, JWT_KEY, {
                issuer: "hutechsolutions.com",
                subject: "email=" + user.email + "role=" + user.role,
                expiresIn: "10h",
              });

              const { userEmail, browserAgent, referrer, ipAddress } = loginRequest;

              let logModelObject = {
                userEmail: userEmail,
                ipAddress: ipAddress,
                browserAgent: browserAgent,
                referrer: referrer
              }

              const _logResult = new ActivityLog(logModelObject);
              return _logResult.save((err, data) => {
                if (err) {
                  return reject({ message: 'Unable save your logs' })
                }
                return resolve({ token, userDetails: user, logData: data });
              });

            } else {
              var reasons = User.failedLogin;
              switch (reason) {
                case reasons.NOT_FOUND:
                  reject({
                    message: "User not found",
                  });
                  break;

                case reasons.PASSWORD_INCORRECT:
                  reject({
                    message: "Password was incorrect",
                  });
                  break;

                default:
                  reject({
                    message: "Unknown exception",
                  });
              }
            }
          }
        );
      });
    } catch (err) {
      console.error(err);
      return Promise.reject(err);
    }
  }

  //*reset password starts here --->
  static resetPassword(requestObject) {
    return new Promise((resolve, reject) => {
      User.findOne({
        resetPasswordToken: requestObject.resetPasswordToken,
      }).then((userData) => {
        if (!userData) {
          reject({
            message: "Invalid token",
          });
        } else {
          jwt.verify(
            requestObject.resetPasswordToken,
            process.env.JWT_KEY,
            (err) => {
              if (err) {
                reject({
                  message: "Invalid token",
                });
              }
              let passwordhash = requestObject.password;
              passwordhash = bcrypt.hashSync(
                passwordhash,
                bcrypt.genSaltSync(8)
              );
              User.updateMany(
                {
                  resetPasswordToken: requestObject.resetPasswordToken,
                },
                {
                  $set: {
                    password: passwordhash,
                    resetPasswordToken: "",
                  },
                }
              )
                .then((result) => {
                  resolve({
                    result: result.nModified,
                    message: "Successfully updated your password ",
                  });
                })
                .catch((err) => {
                  reject({
                    message: "Failed to update password",
                    error: err,
                  });
                });
            }
          );
        }
      });
    });
  }
  //<---- end of reset password

  // forget password ---->/*
  static async forgetPassword(email, origin) {
    try {
      return new Promise(async (resolve, reject) => {
        let useremail = await User.findOne({
          email: email,
        });
        if (!useremail)
          reject({
            message: "No user found with this email address.",
          });
        const token = jwt.sign(
          {
            email: email,
          },
          process.env.JWT_KEY,
          {
            expiresIn: "12h",
          }
        );
        User.findOneAndUpdate(
          { email: email },
          {
            $set: {
              resetPasswordToken: token,
            },
          }
        )
          .then(async (user) => {
            if (!user) {
              reject({
                message: "User Not Found or invalid email id",
              });
            } else {
              const resetpasswordurl = `${origin}/reset-password?key=${token}`;

              const emaildata = {
                to: email,
                from: "dhruva@trucklink.com",
                subject: "TruckLink Reset password",
                text: "Hello, have a great day",
                html:
                  "<h3><b>Reset Password</b></h3>" +
                  "<p>You have requested to reset your password. Click on this link to reset your password:</p>" +
                  "<a href=" +
                  resetpasswordurl +
                  '>' +
                  resetpasswordurl +
                  "</a>" +
                  "<p> If you did not request to have your password reset, you can safely delete and ignore this email.<p>" +
                  "<br>",
              };

              sgMail.setApiKey(process.env.SENDGRID_API_KEY);
              const sg = await sgMail.send(emaildata);

              resolve({
                message: `Email has been sent to ${email}`,
                resetPasswordToken: token,
                // sg,
              });
            }
          })
          .catch((error) => {
            reject(error);
          });
      });
    } catch (err) {
      console.error(err);
      return Promise.reject(err, "Something went wrong try again");
    }
  }

  static async changePassword(passwordObject) {
    try {
      return new Promise((resolve, reject) => {
        const { email, oldPassword, newPassword } = passwordObject;
        User.getAuthenticated(email, oldPassword,
          (err, user, reason) => {
            if (err) reject(err);
            if (user) {
              const passwordHash = bcrypt.hashSync(newPassword, bcrypt.genSaltSync(8));
              User.updateOne({ email }, { $set: { password: passwordHash } }).then((data) => {
                return resolve({ data, message: "Changed user password successfully" });
              }).catch((error) => {
                return reject({ error, message: "Unable to change user password" });
              });
            } else {
              var reasons = User.failedLogin;
              switch (reason) {
                case reasons.NOT_FOUND:
                  reject({
                    message: "User not found",
                  });
                  break;
                case reasons.PASSWORD_INCORRECT:
                  reject({
                    message: "Password was incorrect",
                  });
                  break;
                default:
                  reject({
                    message: "Unknown exception",
                  });
              }
            }
          }
        );
      });
    } catch (err) {
      return Promise.reject({ error: err, message: "Unable to change password" });
    }
  }


  static async userLogout(id) {

    return new Promise((resolve, reject) => {

      ActivityLog.updateOne({ _id: id }, { $set: { logoutTime: Date.now() } }, { new: true }).then((logUpdate) => {
        if (logUpdate) {
          ActivityLog.findById({ _id: id })
            .then((result) => {
              if (result) {
                // let demo = (new Date(result.logoutTime).getTime() - new Date(result.loginTime).getTime())
                //  console.log(moment(demo).format("hh:mm:ss"))
                let diff = moment(result.logoutTime) - moment(result.loginTime);
                  
                let finalDuration = moment(diff).format("hh:mm:ss");  
                
                ActivityLog.updateOne({ _id: id }, { $set: { durationTime: finalDuration } }, { new: true })
                  .then((finalLogout) => {
                    if (finalLogout) {
                      resolve({
                        message: `Logout successfully`,
                        data: finalLogout 
                      });
                    } else {
                      return reject({ message: 'Unable to update duration time' })
                    }
                  }).catch((err) => {
                    return reject(err)
                  })
              } else {
                return reject({ message: 'Unable to find log data' })
              }
            })
        } else {
          return reject({ message: 'Unable to user logout' })
        }
      }).catch((err) => {
        return reject({ err })
      })

    });

  }


};
