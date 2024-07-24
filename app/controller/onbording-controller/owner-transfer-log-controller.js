const OwnerTransferLog = require("../../data-models/onboarding-data-models/ownership-transfer-log-model");
const Owner = require("../../data-models/onboarding-data-models/owner-model");
module.exports = class OwnerTransferController {

  static getAllLogs() {
    return new Promise((resolve, reject) => {
      OwnerTransferLog.find({})
        .populate('oldOwnerId', 'name')
        .populate('newOwnerId', 'name')
        .sort({ createdAt: -1 })
        .then((data) => {
          if (data) {
            resolve({
              ownerDetails: data,
              message: "Successfully retrived owner transfer logs informations",
            });
          } else {
            reject({ message: "Unable to retrive owner info" });
          }
        })
        .catch((error) => {
          reject(error);
        });
    });
  }


};
