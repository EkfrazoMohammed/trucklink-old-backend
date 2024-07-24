const User = require("../../data-models/user-data-models/user-model");
const bcrypt = require("bcrypt");
const sgMail = require("@sendgrid/mail");

module.exports = class UserController {
  static async createUser(creteUserData) {
    try {
      return new Promise(async (resolve, reject) => {
        User.findOne({ email: creteUserData.email })
          .then(async (email) => {
            if (email) {
              return reject({
                message: "This email address is already registered",
              });
            } else {
              const {
                email,
                name,
                roleName,
                phoneNumber
              } = creteUserData;
              const password = phoneNumber ? `Trucklink@${phoneNumber}` : null;
              if (!email || !name || !password) {
                return reject({
                  message:
                    "Invalid feilds, email, phone number and name fields are required",
                });
              }
              const passwordhash = await bcrypt.hashSync(password, bcrypt.genSaltSync(8));
              const user = new User({
                email: email ? email.toLowerCase() : null,
                password: passwordhash,
                phoneNumber,
                name,
                roleName,
                phoneNumber
              });
              return user.save();
            }
          })
          .then(async (data) => {
            if (data) {
              const { name, email, phoneNumber } = creteUserData;
              const password = phoneNumber ? `Trucklink@${phoneNumber}` : null;
              await this.welcomeEmail(name, email, password).then((dt) => {
                return resolve({
                  user: data,
                  dt,
                  message: "Successfully created a user",
                });
              })
            }
          })
          .catch((err) => {
            return reject({ err, message: "Unable to create user" });
          });
      }).catch((err) => {
        return Promise.reject({
          error: err,
          message: "Unable to create user",
        });
      });

    } catch (err) {
      return Promise.reject({ error: err, message: "Unable to create user, try again" });
    }
  }

  static updateUser(updateRequestObject) {
    const { body, params } = updateRequestObject;
    const { userId: id } = params;
    return new Promise((resolve, reject) => {
      User.find({ _id: id })
        .then(async (user) => {
          if (!user) {
            reject({ message: "User not found please create and update" });
          } else {
            const { email,
              name,
              roleName,
              phoneNumber } = body;
            if (email &&
              name &&
              roleName &&
              phoneNumber) {
              const res = await User.updateOne({ _id: id }, { $set: body });
              return res;
            } else {
              return reject({ message: "Missing required feilds" });
            }
          }
        })
        .then((result) => {
          resolve({
            updated: result,
            message: "updated successfully",
          });
        })
        .catch((err) => {
          err.desc = "Unable to update check user id and try again";
          reject(err);
        });
    });
  }

  static findUsers() {
    return new Promise((resolve, reject) => {
      User.find({}).then((user) => {
        if (user) {
          resolve({
            user,
            message: "Successfully retrived users informations",
          });
        } else {
          reject({ message: "Unable to retrived  no user found" });
        }
      })
        .catch((error) => {
          reject(error);
        });
    });
  }

  static findUserById(id) {
    return new Promise((resolve, reject) => {
      User.findById({ _id: id })
        .then((user) => {
          if (user) {
            resolve({
              user,
              message: "Successfully retrived user informations",
            });
          } else {
            reject({
              message: "No user found",
            });
          }
        })
        .catch((error) => {
          reject({ error, message: "Unable to retreive user information" });
        });
    });
  }

  static updateUserStatus(userObject) {
    return new Promise((resolve, reject) => {
      const { userId, status } = userObject || "";
      User.updateOne({ _id: userId }, { $set: { isActive: status } }).then((data) => {
        return resolve({ data, message: "Updated user status successfully" });
      }).catch((error) => {
        return reject({ error, message: "Unable to Update users status" });
      });
    });
  }

  static async welcomeEmail(name, email, Password) {
    try {
      const helloText = `Hello ${name}, have a great day`
      const username = `<p>User Name: ${name}</p>`;
      const password = `<p>Password: ${Password}</p>`;

      const emaildata = {
        to: email,
        from: "dhruva@trucklink.com",
        subject: "TruckLink User OnBoarding",
        text: helloText,
        html:
          "<h3><b>Welcome to the TruckLink!</b></h3>" +
          "<p>Your profile has ben created. Now you can login to the system using the login credentials.</p>" +
          username +
          password +
          "<p>Regards,</p>" +
          "<p>Team TruckLink</p>"
      };

      sgMail.setApiKey(process.env.SENDGRID_API_KEY);
      const sg = await sgMail.send(emaildata);
      return Promise.resolve(sg);
    } catch (error) {
      console.error(error);
    }
  }

  static async deleteUser(id) {
    try {
      return new Promise((resolve, reject) => {
        User.findByIdAndRemove({ _id: id }).then((data) => {
          return resolve({ data, message: "Deleted user successfully" });
        }).catch((error) => {
          return reject({ error, message: "Unable to delete the user" });
        });
      });
    }
    catch (error) {
      return Promise.reject({ error, message: "Unable to delete the user" });
    }
  }
};
