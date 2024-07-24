const Owner = require("../../data-models/onboarding-data-models/owner-model");
const Bank = require("../../data-models/onboarding-data-models/bank-model");

module.exports = class OwnerController {
  static async banksOnBoardingLogic(requestObject) {
    const { body: allAccounts, params } = requestObject;
    const { ownerId } = params;
    
    return new Promise(async (resolve, reject) => {
      const isValidOwnerId = new RegExp("^[0-9a-fA-F]{24}$");
      if (
        allAccounts &&
        params &&
        allAccounts.length > 0 &&
        isValidOwnerId.test(ownerId)
      ) {
        let uniqueAc = [
          ...new Set(allAccounts.map((item) => item.accountNumber)),
        ];
        if (uniqueAc.length === allAccounts.length) {
          Bank.find({ accountNumber: { $in: uniqueAc } })
            .then((data) => {
              if (data && data.length <= 0) {
                Bank.insertMany(allAccounts, { ordered: false })
                  .then((data) => {
                    if (data && data.length > 0) {
                      const returnedAccountObj = JSON.parse(
                        JSON.stringify(data)
                      );
                      const accountIds = returnedAccountObj.map(
                        ({ _id }) => _id
                      );
                      if (accountIds && accountIds.length > 0) {
                        const updateQuery = { $push: { accountIds } };
                        Owner.updateOne({ _id: ownerId }, updateQuery).then(
                          (data) => {
                            if (data) {
                              resolve({
                                user: data,
                                message:
                                  "Successfully updated your bank details",
                              });
                            }
                          }
                        );
                      }
                    } else {
                      return reject({
                        message: "Unable to update bank details",
                      });
                    }
                  })
                  .catch((err) => {
                    return reject({
                      err,
                      message: "Unable to update bank details",
                    });
                  });
              }
            })
            .catch((err) => {
              reject({ err, message: "Something went wrong please try again" });
            });
        } else {
          reject({ message: "Duplicate accounts not allowed" });
        }
      } else {
        reject({ message: "Bank details required" });
      }
    }).catch((err) => {
      console.error(err);
      return Promise.reject({ error: err, message: "Something went wrong" });
    });
  }

  static findAllOwnerAccounts() {}
  
  static findOwnerAccountById(id) {
    return new Promise((resolve, reject) => {
      Bank.find({ ownerId: id })
        .then((bankDetails) => {
          if (bankDetails) {
            resolve({
              bankDetails,
              message:
                "Successfully Bank Details information",
            });
          } else {
            reject({ message: "Unable to retrive challans" });
          }
        })
        .catch((error) => {
          reject(error);
        });
    });

  }

  static updateOwnerAccount(requestObject) {
    const { body: allBankDetails } = requestObject;
    try {
      return new Promise((resolve, reject) => {
        allBankDetails.map((data) => {
          const {
            accountNumber,
            accountHolderName,
            ifscCode,
            bankName,
            branchName,
            _id: id,
          } = data;

          const updateObject = {
            accountNumber,
            accountHolderName,
            ifscCode,
            bankName,
            branchName,
            modifiedAt: Date.now(),
          };

          Bank.updateOne({ _id: id }, { $set: updateObject })
            .then((user) => {
              if (user) {
                resolve({
                  user,
                  message: "All a/c information  updated successfully",
                });
              } else {
                reject({ message: "Unable to update owner info" });
              }
            })
            .catch((error) => {
              reject(error);
            });
        });
      });
    } catch (err) {
      return Promise.reject({ err, message: "Something went wrong" });
    }
  }
};
