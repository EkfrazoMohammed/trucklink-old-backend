const Owner = require("../../data-models/onboarding-data-models/owner-model");
const Vehicle = require("../../data-models/onboarding-data-models/vehicle-model");
const Bank = require("../../data-models/onboarding-data-models/bank-model");
const moment = require("moment");

const { slice } = require("../../configure/state-list");

module.exports = class OwnerController {
  // static async createVehicleOwner(requestObject) {
  //   try {
  //     return new Promise(async (resolve, reject) => {
  //       Owner.findOne({ phoneNumber: requestObject.phoneNumber })
  //         .then((phoneNumber) => {
  //           if (phoneNumber) {
  //             return reject({
  //               message: "This Owner already exists",
  //             });
  //           } else {
  //             const {
  //               name,
  //               email,
  //               phoneNumber,
  //               panNumber,
  //               address,
  //               district,
  //               state,
  //             } = requestObject;
  //             const objectModel = {
  //               name,
  //               email,
  //               phoneNumber,
  //               panNumber,
  //               address,
  //               district,
  //               state,
  //             };
  //             const _onBoardingOwner = new Owner(objectModel);
  //             return _onBoardingOwner.save();
  //           }
  //         })
  //         .then((data) => {
  //           const obj = JSON.parse(JSON.stringify(data));
  //           if (obj && obj._id) {

  //             return resolve({
  //               ownerId: obj._id,
  //               user: data,
  //               message: "Owner has been successfully created",
  //             });
  //           }
  //         })
  //         .catch((err) => {
  //           return reject({
  //             err,
  //             message: "Unable to create owner",
  //           });
  //         });
  //     });
  //   } catch (err) {
  //     return Promise.reject({ err, message: "something went wrong try again" });
  //   }
  // }

  static async createVehicleOwner(requestObject) {
    try {
      return new Promise(async (resolve, reject) => {
        let { body, params } = requestObject;

        let ownerDetais = body.owner_details;

        let bankDetails = body.bank_details;

        let allAccounts = bankDetails;

        Owner.findOne({ phoneNumber: ownerDetais.phoneNumber })
          .then((phoneNumber) => {
            if (phoneNumber) {
              return reject({
                message: "This Owner already exists",
              });
            } else {
              const {
                name,
                email,
                phoneNumber,
                panNumber,
                address,
                district,
                state,
              } = ownerDetais;
              const objectModel = {
                name,
                email,
                phoneNumber,
                panNumber,
                address,
                district,
                state,
              };
              const _onBoardingOwner = new Owner(objectModel);
              return _onBoardingOwner.save();
            }
          })
          .then((data) => {
            const obj = JSON.parse(JSON.stringify(data));
            if (obj && obj._id) {
              //--- starting

              const isValidOwnerId = new RegExp("^[0-9a-fA-F]{24}$");
              if (
                allAccounts &&
                allAccounts.length > 0 &&
                isValidOwnerId.test(obj._id)
              ) {
                let uniqueAc = [
                  ...new Set(allAccounts.map((item) => item.accountNumber)),
                ];

                let finalAllAccounts = allAccounts.map((result) => {
                  return (result.ownerId = obj._id);
                });

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
                                Owner.updateOne(
                                  { _id: obj._id },
                                  updateQuery
                                ).then((data) => {
                                  if (data) {
                                    if (obj._id && data) {
                                      resolve({
                                        ownerId: obj._id,
                                        user: data,
                                        message:
                                          "Owner has been successfully created",
                                      });
                                    } else {
                                      Owner.findOneAndDelete({
                                        _id: obj._id,
                                      }).then((deleteOwner) => {
                                        if (deleteOwner) {
                                          resolve({
                                            message:
                                              "Unable to create owner please try again later",
                                          });
                                        }
                                      });
                                    }
                                  }
                                });
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
                      reject({
                        err,
                        message: "Something went wrong please try again",
                      });
                    });
                } else {
                  reject({ message: "Duplicate accounts not allowed" });
                }
              } else {
                reject({ message: "Bank details required" });
              }

              // ---
              // return resolve({
              //   ownerId: obj._id,
              //   user: data,
              //   message: "Owner has been successfully created",
              // });
            }
          })
          .catch((err) => {
            return reject({
              err,
              message: "Unable to create owner",
            });
          });
      });
    } catch (err) {
      return Promise.reject({ err, message: "something went wrong try again" });
    }
  }

  static async createVehicleOwnerByXsl(requestObject) {
    try {
      return new Promise(async (resolve, reject) => {
        requestObject.map((ownerResult) => {
          let sliceResult = ownerResult.owner_data_sheet.slice(1);
          //  console.log(sliceResult)

          sliceResult.map((excelResult) => {
            let {
              name,
              address,
              phoneNumber,
              state,
              district,
              panNumber,
              email,
              accountNumber,
              accountHolderName,
              ifscCode,
              bankName,
              branchName,
            } = excelResult;

            // let pattern = new RegExp('/^[(]{0,1}[0-9]{3}[)]{0,1}[-\s\.]{0,1}[0-9]{3}[-\s\.]{0,1}[0-9]{4}$/');
            // console.log(pNumber)

            let pattern = new RegExp("^[0-9]{10}$");

            let phoneValidate = sliceResult.filter((result) => {
              let pNo = result.phoneNumber;

              return pattern.test(pNo);
            });

            let dataCount = Object.keys(sliceResult);

            if (phoneValidate.length == dataCount.length) {
              Owner.findOne({ phoneNumber: phoneNumber })
                .then((phoneNumberData) => {
                  if (phoneNumberData) {
                    return reject({
                      message: "This Owner already exists",
                    });
                  } else {
                    const objectModel = {
                      name,
                      email,
                      phoneNumber,
                      panNumber,
                      address,
                      district,
                      state,
                    };

                    let dataFilter = sliceResult.filter((result) => {
                      return (
                        result.name == undefined || result.phoneNumber == undefined ||
                        
                        result.accountNumber == undefined ||
                        result.accountHolderName == undefined ||
                        
                        result.ifscCode == undefined ||
                        
                        result.bankName == undefined ||
                        result.branchName == undefined 
                        
                      );
                    });

                    if (dataFilter.length > 0 && dataFilter) {
                      return reject({
                        message: "Please add your validate fields",
                      });
                    } else {
                      const _onBoardingOwner = new Owner(objectModel);
                      return _onBoardingOwner.save();
                    }
                  }
                })
                .then((data) => {
                  const obj = JSON.parse(JSON.stringify(data));
                  if (obj && obj._id) {
                    if (
                      accountNumber &&
                      accountHolderName &&
                      ifscCode &&
                      bankName &&
                      branchName
                    ) {
                      let objectModel = {
                        accountNumber: +accountNumber,
                        accountHolderName: accountHolderName,
                        ifscCode: ifscCode,
                        bankName: bankName,
                        branchName: branchName,
                        ownerId: obj._id,
                      };
                      const _bankDetails = new Bank(objectModel);
                      return _bankDetails.save((err, bankdata) => {
                        if (err) {
                          return reject({
                            err,
                            message: "Unable to save bank details",
                          });
                        }

                        if (bankdata) {
                          Owner.findByIdAndUpdate(
                            obj._id,
                            { $push: { accountIds: bankdata._id } },
                            { new: true }
                          ).then((ownerBankDetails) => {
                            if (ownerBankDetails) {
                              return resolve({
                                user: data,
                                message: "Owner has been successfully created",
                              });
                            }
                          });
                        } else {
                          return reject({
                            message: "Unable to find bank details",
                          });
                        }
                      });
                    } else {
                      return reject({
                        message: "Please add your valid details",
                      });
                    }
                  }
                })
                .catch((err) => {
                  return reject({
                    err,
                    message: "Unable to create owner",
                  });
                });
            } else {
              return reject({
                message: "Please validate your PhoneNumber fields",
              });
            }
          });
        });
      });
    } catch (err) {
      return Promise.reject({ err, message: "something went wrong try again" });
    }
  }

  static async updateVehicleOwnerByXsl(requestObject) {
    try {
      return new Promise(async (resolve, reject) => {
        requestObject.map((ownerResult) => {
          let sliceOwnerResult = ownerResult.owner_data_sheet.slice(1);

          let sliceAccountDetails = ownerResult.account_data_sheet.slice(1);

          sliceOwnerResult.map((excelResult) => {
            let {
              _id,
              name,
              address,
              phoneNumber,
              state,
              district,
              panNumber,
              email,
            } = excelResult;

            let dataFilter = sliceOwnerResult.filter((result) => {
              return (
                result.name == undefined ||
                result.phoneNumber == undefined ||
                result.phoneNumber == null
              );
            });

            if (dataFilter.length > 0 && dataFilter) {
              return reject({ message: "Please validate your owners fields" });
            } else {
              const objectModel = {
                name,
                email: email ? email.toLowerCase() : null,
                phoneNumber,
                panNumber,
                address,
                district,
                state,
                modifiedAt: Date.now(),
              };

              Owner.findByIdAndUpdate(_id, { $set: objectModel }, { new: true })
                .then((ownerUpdate) => {
                  // console.log(ownerUpdate)
                  if (ownerUpdate) {
                    sliceAccountDetails.map((excelBankResult) => {
                      let dataFilter = sliceAccountDetails.filter((result) => {
                        return (
                          result.accountNumber == undefined ||
                          
                          result.accountHolderName == undefined ||
                          
                          result.ifscCode == undefined ||
                          
                          result.bankName == undefined ||
                          
                          result.branchName == undefined
                          
                        );
                      });

                      if (dataFilter.length > 0 && dataFilter) {
                        return reject({
                          message: "Please validate your account fields",
                        });
                      } else {
                        let {
                          accountNumber,
                          accountHolderName,
                          ifscCode,
                          bankName,
                          branchName,
                          ownerId,
                        } = excelBankResult;

                        let updateObject = {
                          accountNumber,
                          accountHolderName,
                          ifscCode,
                          bankName,
                          branchName,
                          ownerId,
                        };

                        Bank.findOneAndUpdate(
                          { ownerId: ownerId },
                          { $set: updateObject },
                          { new: true }
                        )
                          .then((bankData) => {
                            if (bankData) {
                              return resolve({
                                user: ownerUpdate,
                                message:
                                  "Owner and Bank has been successfully updated",
                              });
                            } else {
                              return reject({
                                message: "Unable to update bank details",
                              });
                            }
                          })
                          .catch((err) => {
                            return reject({
                              err,
                              message: "Unable to update bank info",
                            });
                          });
                      }
                    });
                  } else {
                    return reject({ message: "Unable to update owner Info" });
                  }
                })
                .catch((err) => {
                  return reject({
                    err,
                    message: "Unable to update owner",
                  });
                });
            }
          });
        });
      });
    } catch (err) {
      return Promise.reject({ err, message: "something went wrong try again" });
    }
  }

  static findAllOwnerDetails() {
    return new Promise((resolve, reject) => {
      Owner.aggregate([
        {
          $project: {
            oldVehicleDetails: 1,
            phoneNumber: 1,
            name: 1,
            accountId: 1,
          },
        },
        { $unwind: "$oldVehicleDetails" },
        // {
        //   $match: {
        //     'oldVehicleDetails.ownerTransferDate': {
        //       $gt: new Date(startDate)
        //     }
        //   }
        // }
      ])
        .then((userResult) => {
          if (userResult) {
            let user = [];
            let result = [];
            userResult.map((userData) => {
              // console.log(userData)
              let ownerId = {
                _id: userData._id,
                name: userData.name,
                phoneNumber: userData.phoneNumber,
              };

              result = {
                _id: userData.oldVehicleDetails.vehicleIds,
                truckType: userData.oldVehicleDetails.truckType,
                commission: userData.oldVehicleDetails.commission,
                registrationNumber: userData.oldVehicleDetails.vehicleNumber,
                ownerId,
                accountId: userData.oldVehicleDetails.accountId,
              };

              user.push(result);
            });
            resolve({
              user,
              message: "Successfully retrived all owners informations",
            });
          } else {
            reject({ message: "Unable to retrive information" });
          }
        })
        .catch((error) => {
          reject(error);
        });
    });
  }

  static findAllOwnerPhoneNumbers() {
    return new Promise((resolve, reject) => {
      Owner.find({}, { _id: 1, phoneNumber: 1, name: 1 })
        .then((data) => {
          if (data) {
            resolve({
              ownerPhoneNumbers: data,
              message: "Successfully retrived user information",
            });
          } else {
            reject({ message: "Unable to retrive owner information" });
          }
        })
        .catch((error) => {
          reject(error);
        });
    });
  }

  static findOwnerDetailsById(id) {
    return new Promise((resolve, reject) => {
      Owner.find({ _id: id })
        .then((data) => {
          if (data) {
            resolve({
              ownerDetails: data,
              message: "Successfully retrived user informations",
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

  static getAllOwnerWithBanks(requestObject) {
    const { page, limit, searchOwnerName } = requestObject;

    const pageInput = parseInt(page) || 1;
    const limitInput = parseInt(limit) || 50;

    const skip = limitInput * pageInput - limitInput;

    const searchData = new RegExp(searchOwnerName, "i");

    return new Promise((resolve, reject) => {
      // Owner.find().countDocuments().then((totalCount)=>{
      //     if(totalCount){
      //       Owner.find({name: searchData})
      //       .populate("accountIds")
      //       .skip(skip)
      //       .limit(limitInput)
      //       .sort({name: 1 })
      Owner.aggregate([
        {
          $match: { $or: [{ name: new RegExp(searchData, "i") }] },
        },
        { $sort: {name: 1 }},
        {
          $lookup: {
            from: "accounts",
            localField: "accountIds",
            foreignField: "_id",
            as: "accountIds",
          },
        },
        {
          $facet: {
            stage1: [
              {
                $group: {
                  _id: null,
                  count: { $sum: 1 },
                },
              },
            ],

            stage2: [{ $skip: skip }, { $limit: limitInput }],
          },
        },
        { $unwind: "$stage1" },
        {
          $project: {
            count: "$stage1.count",
            data: "$stage2",
          },
        },
      ])
        .then((data) => {
          if (data) {
            resolve({
              ownerDetails: data,
              message: "Successfully retrived user informations",
            });
          } else {
            reject({ message: "Unable to retrive owner info" });
          }
        })
        .catch((error) => {
          reject(error);
        });
      // }
      // })
    });
  }

  static getTotalOwnerdetails(requestObject) {
    return new Promise((resolve, reject) => {
      const { query } = requestObject;

      const page = parseInt(query.page) || 1;
      const limit = parseInt(query.limit) || 10;

      const skip = limit * page - limit;

      Owner.find({})
        .countDocuments()
        .then((totalCount) => {
          if (totalCount) {
            Owner.find({})
              .populate("vehicleIds")
              .populate("accountIds")
              .skip(skip)
              .limit(limit)
              .then((data) => {
                if (data) {
                  resolve({
                    ownerDetails: data,
                    totalCount,
                    message: "Successfully retrived user information",
                  });
                } else {
                  reject({ message: "Unable to retrive owner info" });
                }
              })
              .catch((error) => {
                reject(error);
              });
          } else {
            return reject({ message: "Unable to found count " });
          }
        });
    });
  }

  static getOwnerNames() {
    return new Promise((resolve, reject) => {
      Owner.find({})
        .select({ name: 1 })
        .then((data) => {
          if (data) {
            resolve({
              ownerDetails: data,
              message: "Successfully retrived user informations",
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

  static getOwnerBanksById(id) {
    return new Promise((resolve, reject) => {
      Owner.find({ _id: id })
        .populate("accountIds")
        .then((data) => {
          if (data) {
            resolve({
              ownerDetails: data,
              message: "Successfully retrived user informations",
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

  static updateOwnerDetailsById(requestObject) {
    const { body, params } = requestObject;
    return new Promise((resolve, reject) => {
      const {
        name,
        email,
        phoneNumber,
        panNumber,
        address,
        district,
        state,
      } = body;

      const updateObject = {
        name,
        email: email ? email.toLowerCase() : null,
        phoneNumber,
        panNumber,
        address,
        district,
        state,
        modifiedAt: Date.now(),
      };

      Owner.updateOne({ _id: params.id }, { $set: updateObject })
        .then((user) => {
          if (user) {
            resolve({
              user,
              message: "Successfully updated user informations",
            });
          } else {
            reject({ message: "Unable to update owner info" });
          }
        })
        .catch((error) => {
          reject(error);
        });
    });
  }

  static async deleteOwnerDetailsById(id) {
    let owner = null;
    let bank = null;
    let vehicle = null;
    try {
      owner = await Owner.findOneAndRemove({ _id: id });
      if (owner && owner.accountIds && owner.accountIds.length > 0) {
        bank = await Bank.deleteMany({ ownerId: id });
      } else {
        return Promise.reject({ owner, message: "Unable to delete" });
      }
      if (owner && owner.vehicleIds && owner.vehicleIds.length > 0) {
        vehicle = await Vehicle.deleteMany({ ownerId: id });
      }
      return Promise.resolve({
        owner,
        bank,
        vehicle,
        message: "Deleted owner succesfully",
      });
    } catch (err) {
      return Promise.reject({
        error: err,
        owner,
        bank,
        vehicle,
        message: "Unable to delete owner",
      });
    }
  }

  static convertTimestampToDate(dateString) {
    const dt = new Date(Number(dateString));
    const dateEntry = dt.toISOString().split("T")[0];
    const entryDate = moment(dateEntry, "YYYY-MM-DD");
    const entryISODate = entryDate.format("YYYY-MM-DD") + "T00:00:00.000Z";
    return entryISODate;
  }
};
