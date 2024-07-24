const RecoveryRegister = require("../../data-models/accounting-models/recovery-register-model");
const Challan = require("../../data-models/dispatch-to-ledger-models/challan-model");
const { param, use } = require("../../routes/recovery-register.routes");
const { json } = require("body-parser");

module.exports = class RecoveryController {
  static async createRecoveryRegister(requestObject) {
    try {
      return new Promise(async (resolve, reject) => {
        RecoveryRegister.findOne({ recoveryCode: requestObject.recoveryCode })
          .then((recoveryCode) => {
            if (recoveryCode) {
              return reject({
                message: "This Recovery Code already exists",
              });
            } else {
              const {
                recoveryCode,
                value,
                recovered,
                outstanding,
                challan,
              } = requestObject;

              const objectModel = {
                recoveryCode: recoveryCode,
                value: value,
                recovered: recovered,
                outstanding: -value,
                challan: challan,
              };

              const _onRecoveryRegister = new RecoveryRegister(objectModel);
              return _onRecoveryRegister.save();
            }
          })
          .then((data) => {
            if (data) {
              return resolve({
                data: data,
                message: "Recovery Register has been successfully created",
              });
            }
          })
          .catch((err) => {
            return reject({
              err: err.errmsg,
              message: "Unable to Create Recovery Code",
            });
          });
      });
    } catch (err) {
      return Promise.reject({ err, message: "something went wrong try again" });
    }
  }

  static findAllRecoveryCodes(requestObject) {
    let { page, limit, searchDN } = requestObject;

    const pageInput = parseInt(page) || 1;
    const limitInput = parseInt(limit) || 10;

    const skip = limitInput * pageInput - limitInput;

    const searchData = new RegExp(searchDN, "i");

    return new Promise((resolve, reject) => {
      // RecoveryRegister.find({})
      RecoveryRegister.aggregate([
        //  {$match : {}},
        {
          $match: { $or: [{ recoveryCode: searchData }] },
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
        .then((recovery) => {
          if (recovery) {
            RecoveryRegister.find({}).then((totalData) => {
              if (totalData) {
                if (totalData && totalData.length > 0) {
                  let totalRecovered = totalData.reduce(
                    (sum, val) => sum + +val.recovered,
                    0
                  );
                  let totalValue = totalData.reduce(
                    (sum, val) => sum + +val.value,
                    0
                  );
                  let totalOutstanding = totalData.reduce(
                    (sum, val) => sum + +val.outstanding,
                    0
                  );

                  resolve({
                    recovery,
                    totalRecovered,
                    totalValue,
                    totalOutstanding,
                    message:
                      "Successfully retrived all Recovery Code informations",
                  });
                } else {
                  resolve({
                    recovery,
                    message:
                      "Successfully retrived all Recovery Code informations",
                  });
                }
              }
            });
          } else {
            reject({ message: "Unable to retrive information" });
          }
        })
        .catch((error) => {
          reject(error);
        });
    }).catch((error) => {
      return reject({
        error,
        message: "Unable to fetch Recovery Register totals",
      });
    });
  }

  static getDeliveryInfoById(recoverId) {
    return new Promise((resolve, reject) => {
      RecoveryRegister.findById({ _id: recoverId })
        .populate(
          "challan",
          "deliveryLocation invoiceDate shortage recovery outstanding vehicleNumber deliveryNumber"
        )
        .then((data) => {
          if (data) {
            resolve({
              deliveryDetails: data,
              message: "Successfully retrived Delivery Details informations",
            });
          } else {
            reject({ message: "Unable to retrive delivery info" });
          }
        })
        .catch((error) => {
          reject(error);
        });
    });
  }

  static updateRecoverdInfoById(requestObject) {
    const { body, params } = requestObject;

    const { recovery } = body;

    return new Promise((resolve, reject) => {
      return Challan.findById({ _id: params.challanId })
        .then((challanData) => {
          if (!challanData) {
            return reject({
              message:
                "Your Challan Id Not Found please add correct challan Id",
            });
          } else {
            return RecoveryRegister.find({ _id: params.recoverId })
              .then((data) => {
                if (data) {
                  data.map((result) => {
                    let idCompareData = result.challan;
                    if (idCompareData.indexOf(`${challanData._id}`) > -1) {
                      return Challan.find({ _id: params.challanId }).then(
                        (data) => {
                          data.map((challanData) => {
                            return Challan.findOneAndUpdate(
                              { _id: params.challanId },
                              {
                                $set: {
                                  recovery: +recovery,
                                  outstanding:
                                    +recovery - +challanData.shortage,
                                },
                              },
                              { new: true }
                            )
                              .then((challanresult) => {
                                if (!challanresult) {
                                  reject({
                                    message:
                                      "Unable to update Challan Data status",
                                  });
                                } else {
                                  return RecoveryRegister.findById({
                                    _id: params.recoverId,
                                  })
                                    .populate("challan", "recovery")
                                    .then((recoverytotal) => {
                                      if (!recoverytotal) {
                                        reject({
                                          message:
                                            "Unable to find challan recovery Data ",
                                        });
                                      } else {
                                        let recoveryTotal = recoverytotal.challan.reduce(
                                          (sum, val) => sum + +val.recovery,
                                          0
                                        );
                                        return RecoveryRegister.findOneAndUpdate(
                                          { _id: params.recoverId },
                                          {
                                            $set: {
                                              recovered: +recoveryTotal,
                                              outstanding:
                                                +recoveryTotal - result.value,
                                            },
                                          },
                                          { new: true }
                                        )
                                          .then((recoverResult) => {
                                            resolve({
                                              recoverResult,
                                              message:
                                                "Successfully Updated Recovered Data informations",
                                            });
                                          })
                                          .catch((err) => {
                                            reject({
                                              message:
                                                "Unable to update parent Recovered data and outstanding",
                                            });
                                          });
                                      }
                                    })
                                    .catch((err) => {
                                      reject({
                                        message:
                                          "Unable to total Recovery data Info",
                                      });
                                    });
                                }
                              })
                              .catch((err) => {
                                reject({
                                  err,
                                  message:
                                    "Unable to update Recovery and outstanding status",
                                });
                              });
                          });
                        }
                      );
                    } else {
                      reject({
                        message:
                          "Your challan Id is not match with your recover Id",
                      });
                    }
                  });
                } else {
                  return reject({
                    message: "Unable to retrive Recovered info",
                  });
                }
              })
              .catch((error) => {
                return reject({
                  error: error.message,
                  message: "Your Recovery Param Id Not Found",
                });
              });
          }
        })
        .catch((error) => {
          return reject({ message: "Your Challan Param Id Not Found" });
        });
    });
  }

  static updateRecoveryRegisterById(requestObject) {
    const { body, params } = requestObject;

    try {
      return new Promise((resolve, reject) => {
        return RecoveryRegister.findById({ _id: params.id })
          .then((recoverdata) => {
            if (!recoverdata) {
              return reject({ message: "Your Param id not found" });
            } else {
              const { recoveryCode, value, challan } = body;
              const updateObject = {
                recoveryCode,
                value,
                challan,
                modifiedAt: Date.now(),
              };

              RecoveryRegister.findOneAndUpdate(
                { _id: recoverdata._id },
                { $set: updateObject },
                { new: true }
              )
                .then((data) => {
                  if (data) {
                    let countOutstanding = data.recovered - data.value;

                    RecoveryRegister.findOneAndUpdate(
                      { _id: params.id },
                      { $set: { outstanding: countOutstanding } },
                      { new: true }
                    ).then((finalData) => {
                      if (finalData) {
                        resolve({
                          data,
                          message: "Recovery information updated successfully",
                        });
                      } else {
                        reject({
                          message: "Unable to update outstanding Count info",
                        });
                      }
                    });
                  } else {
                    reject({
                      message: "Unable to update Recover Code and Value info",
                    });
                  }
                })
                .catch((error) => {
                  if (error.code === 11000) {
                    return reject({
                      message:
                        "Recoverycode is exists in your System please update your new recovery code",
                    });
                  } else {
                    return reject(error);
                  }
                });
            }
          })
          .catch((err) => {
            reject({ err, message: "Your Parma Id is not found " });
          });
      });
    } catch (err) {
      return Promise.reject({ err, message: "Something went wrong" });
    }
  }

  static deleteRecoveryRegisterById(recoverId) {
    try {
      return new Promise((resolve, reject) => {
        return RecoveryRegister.findById({ _id: recoverId }).then((data) => {
          if (!data) {
            return reject({ message: "Your Param id not found" });
          } else {
            RecoveryRegister.find({ _id: recoverId })
              .populate("challan", "recovery outstanding")
              .then((challanData) => {
                challanData.map((result) => {
                  let demo = result.challan;

                  if (!(demo.length === 0)) {
                    result.challan.map((datamap) => {
                      Challan.updateMany(
                        { _id: datamap._id },
                        { $set: { recovery: 0, outstanding: 0 } },
                        { new: true }
                      ).then((challanDel) => {
                        if (challanDel) {
                          RecoveryRegister.findOneAndDelete({ _id: recoverId })
                            .then((data) => {
                              if (data) {
                                resolve({
                                  data,
                                  message:
                                    "Recovery information Delete successfully",
                                });
                              } else {
                                reject({
                                  message: "Unable to Delete Recover Code info",
                                });
                              }
                            })
                            .catch((error) => {
                              reject(error);
                            });
                        } else {
                          reject({
                            message:
                              "your Recovery Challan Data are Not Deleted",
                          });
                        }
                      });
                    });
                  } else {
                    RecoveryRegister.findOneAndDelete({ _id: recoverId })
                      .then((deleteResult) => {
                        if (deleteResult) {
                          resolve({
                            deleteResult,
                            message: "Recovery information Delete successfully",
                          });
                        } else {
                          return reject({
                            message: "Unable to delete your data",
                          });
                        }
                      })
                      .catch((err) => {
                        return reject({ message: "Unable to delete data" });
                      });
                  }
                });
              });
          }
        });
      });
    } catch (err) {
      return Promise.reject({ err, message: "Something went wrong" });
    }
  }

  static getAllRecoveryDeliveryNumber(queryparams) {
    return new Promise((resolve, reject) => {
      const { searchDNo, page, limit } = queryparams;

      const pageInput = parseInt(page) || 1;
      const limitInput = parseInt(limit) || 300;

      const skip = limitInput * pageInput - limitInput;

      Challan.find({
        isAcknowledged: true,
        isReceived: false,
        deliveryNumber: new RegExp(searchDNo, "i"),
      })
        .select("_id deliveryNumber")
        .skip(skip)
        .limit(limitInput)
        .then((deliveryData) => {

          if (deliveryData) {
            RecoveryRegister.find()
              .populate("challan", "deliveryNumber")
              .select("challan -_id")
              .then((challanData) => {
                
                let dlNo  = [].concat.apply([], challanData.map((item) => item.challan.map((_item) => _item._id.toString() ) ) )
                
                let data = deliveryData.filter((item) => !dlNo.includes(item._id.toString()))
                
                resolve({
                  deliveryData : data,
                  message:
                    "Successfully retrived all delivery numbers informations",
                });
              });
          } else {
            reject({ message: "Unable to retrive delivery" });
          }
        })
        .catch((error) => {
          reject(error);
        });
    });
  }
};
