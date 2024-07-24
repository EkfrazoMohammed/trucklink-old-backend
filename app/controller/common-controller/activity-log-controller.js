const ActivityLog = require("../../data-models/user-data-models/activity-log-model");

module.exports = class ActivityLogController {

  static getAllLogs() {
    return new Promise((resolve, reject) => {
      ActivityLog.find({})
        .sort({ loginTime: -1 })
        .then((data) => {
          if (data) {
            resolve({
              logsDetails: data,
              message: "Successfully retrived activity logs informations",
            });
          } else {
            reject({ message: "Unable to retrive activity logs info" });
          }
        })
        .catch((error) => {
          reject(error);
        });
    });
  }

};
