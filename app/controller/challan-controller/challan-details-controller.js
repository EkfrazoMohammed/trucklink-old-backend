const Challan = require("../../data-models/dispatch-to-ledger-models/challan-model");
const Owner = require("../../data-models/onboarding-data-models/owner-model");
const Material = require("../../data-models/master-data-models/material-model");
const LoadLocation = require("../../data-models/master-data-models/load-location-model");
const DeliveryLocation = require("../../data-models/master-data-models/delivery-location-model");
const OwnerTransferLog = require("../../data-models/onboarding-data-models/ownership-transfer-log-model");
const moment = require("moment");

module.exports = class ChallanController {
  static createDispatchChallan(requestObject) {
    try {
      return new Promise(async (resolve, reject) => {
        Challan.findOne({ deliveryNumber: requestObject.deliveryNumber })
          .then((deliveryNumber) => {
            if (deliveryNumber) {
              return reject({
                message: "This Delivery Number already exists",
              });
            } else {
              const {
                materialType,
                grNumber,
                grDate,
                loadLocation,
                deliveryLocation,
                vehicleNumber,
                vehicleType,
                deliveryNumber,
                quantityInMetricTons,
                rate,
                diesel,
                cash,
                bankTransfer,
                ownerId,
                ownerName,
                vehicleId,
                vehicleBank,
                ownerPhone,
                invoiceDate,
                commisionRate,
                commisionTotal,
                totalExpense,
                invoiceProof,
                shortage,
                balance,
              } = requestObject;

              let grISODate;
              let invoiceISODate;
              if (
                grDate &&
                typeof grDate === "string" &&
                grDate.includes("/")
              ) {
                grISODate = this.convertToISODate(grDate);
              }

              if (
                invoiceDate &&
                typeof invoiceDate === "string" &&
                invoiceDate.includes("/")
              ) {
                invoiceISODate = this.convertToISODate(invoiceDate);
              }
              const objectModel = {
                materialType,
                grNumber,
                grDate,
                grISODate,
                loadLocation,
                deliveryLocation,
                vehicleNumber,
                ownerId,
                ownerName,
                vehicleId,
                vehicleBank,
                ownerPhone,
                vehicleType: vehicleType
                  ? vehicleType.charAt(0).toUpperCase() +
                  vehicleType.slice(1).toLowerCase()
                  : null,
                deliveryNumber,
                quantityInMetricTons,
                rate,
                diesel,
                cash,
                bankTransfer,
                invoiceDate,
                invoiceISODate,
                commisionRate,
                commisionTotal,
                totalExpense,
                invoiceProof,
                shortage,
                balance,
                vehicleReferenceId: vehicleId,
                vehicleBankReferenceId: vehicleBank,
                ownerReferenceId: ownerId
              };


              OwnerTransferLog.find({ vehicleIds: vehicleId }).then((ownerDateResult) => {

                if (ownerDateResult && ownerDateResult.length > 0) {
                  
                  let FindOwnerOld = "";
                  ownerDateResult.filter((data) => {
                    if (data.oldOwnerId == ownerId) {
                      FindOwnerOld = data;
                    }
                  });
                  if (FindOwnerOld) {
                    if (
                      FindOwnerOld.ownerTransferDate &&
                      FindOwnerOld.ownerTransferFromDate == null
                    ) {
                      if (
                        new Date(FindOwnerOld.ownerTransferDate) >=
                        new Date(grISODate)
                      ) {
                        const _dispatchChallan = new Challan(objectModel);
                        return _dispatchChallan.save((err, data) => {
                          if (err) {
                            return reject({ err, message: 'Unable to create challan' })
                          }
                          return resolve({
                            dispatchData: data,
                            message: "Dispatch challan has been successfully created",
                          });
                        });
                      } else {
                        return reject({ message: 'Please select right owner for the selected period' })
                      }
                    }
                    if (
                      FindOwnerOld.ownerTransferDate &&
                      FindOwnerOld.ownerTransferFromDate
                    ) {
                      if (
                        new Date(FindOwnerOld.ownerTransferDate) >=
                        new Date(grISODate) &&
                        new Date(FindOwnerOld.ownerTransferFromDate) <=
                        new Date(grISODate)
                      ) {
                        const _dispatchChallan = new Challan(objectModel);
                        return _dispatchChallan.save((err, data) => {
                          if (err) {
                            return reject({ err, message: 'Unable to create challan' })
                          }
                          return resolve({
                            dispatchData: data,
                            message: "Dispatch challan has been successfully created",
                          });
                        });
                      } else {
                        return reject({ message: 'Please select right owner for the selected period' })
                      }
                    }
                  } else {

                    let FindOwnerNew = "";
                    ownerDateResult.filter((data) => {
                      if (data.newOwnerId == ownerId) {
                        FindOwnerNew = data;
                      }
                    });

                    if (FindOwnerNew && FindOwnerNew.ownerTransferDate) {
                      if (
                        new Date(FindOwnerNew.ownerTransferDate) <=
                        new Date(grISODate)
                      ) {
                        const _dispatchChallan = new Challan(objectModel);
                        return _dispatchChallan.save((err, data) => {
                          if (err) {
                            return reject({ err, message: 'Unable to create challan' })
                          }
                          return resolve({
                            dispatchData: data,
                            message: "Dispatch challan has been successfully created",
                          });
                        });
                      } else {
                        return reject({ message: 'Please select right owner for the selected period' })
                      }
                    } else {
                      let max = 0;
                      ownerDateResult.forEach((result) => {
                        max = Math.max(max, new Date(result.ownerTransferDate).getTime())
                      })

                      if (new Date(grISODate) >= new Date(max)) {
                        const _dispatchChallan = new Challan(objectModel);
                        return _dispatchChallan.save((err, data) => {
                          if (err) {
                            return reject({ err, message: 'Unable to create challan' })
                          }
                          return resolve({
                            dispatchData: data,
                            message: "Dispatch challan has been successfully created",
                          });
                        });
                      } else {
                        return reject({ message: 'Please select right owner for the selected period' })
                      }

                    }
                  }
                }
                else {
                  
                  const _dispatchChallan = new Challan(objectModel);
                  return _dispatchChallan.save((err, data) => {

                    if (err) {
                      return reject({ err, message: 'Unable to create challan' })
                    }
                    return resolve({
                      dispatchData: data,
                      message: "Dispatch challan has been successfully created",
                    });
                  });
                }
              })
              // ----
            }
          })

      });
    } catch (err) {
      return Promise.reject({ err, message: "Something went wrong try again" });
    }
  }

  static updateDispatchChallanDetailsById(requestObject) {
    const { body, params } = requestObject;
    return new Promise((resolve, reject) => {
      const {
        materialType,
        grNumber,
        grDate,
        loadLocation,
        deliveryLocation,
        vehicleNumber,
        vehicleId,
        ownerId,
        ownerName,
        ownerPhone,
        vehicleBank,
        vehicleType,
        deliveryNumber,
        quantityInMetricTons,
        rate,
        diesel,
        cash,
        bankTransfer,
        invoiceDate,
        commisionRate,
        commisionTotal,
        totalExpense,
        invoiceProof,
        shortage,
        balance,
      } = body;

      let grISODate;
      let invoiceISODate;
      if (grDate && typeof grDate === "string" && grDate.includes("/")) {
        grISODate = this.convertToISODate(grDate);
      }

      if (
        invoiceDate &&
        typeof invoiceDate === "string" &&
        invoiceDate.includes("/")
      ) {
        invoiceISODate = this.convertToISODate(invoiceDate);
      }

      const updateObject = {
        materialType,
        grNumber,
        grDate,
        grISODate,
        invoiceISODate,
        loadLocation,
        deliveryLocation,
        vehicleNumber,
        ownerId,
        ownerName,
        vehicleId,
        ownerPhone,
        vehicleType: vehicleType
          ? vehicleType.charAt(0).toUpperCase() +
          vehicleType.slice(1).toLowerCase()
          : null,
        deliveryNumber,
        quantityInMetricTons,
        rate,
        diesel,
        cash,
        bankTransfer,
        invoiceDate,
        commisionRate,
        commisionTotal,
        vehicleBank,
        totalExpense,
        invoiceProof,
        shortage,
        balance,
        vehicleReferenceId: vehicleId,
        vehicleBankReferenceId: vehicleBank,
        ownerReferenceId: ownerId,
        modifiedAt: Date.now(),
      };

      OwnerTransferLog.find({ vehicleIds: vehicleId }).then((ownerDateResult) => {

        if ((ownerDateResult && ownerDateResult.length > 0)) {
          
          let FindOwnerOld = "";
          ownerDateResult.filter((data) => {
            if (data.oldOwnerId == ownerId) {
              FindOwnerOld = data;
            }
          });
          if (FindOwnerOld) {
            if (
              FindOwnerOld.ownerTransferDate &&
              FindOwnerOld.ownerTransferFromDate == null
            ) {
              if (
                new Date(FindOwnerOld.ownerTransferDate) >=
                new Date(grISODate)
              ) {
                Challan.updateOne({ _id: params.id }, { $set: updateObject })
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
              } else {
                return reject({ message: 'Please select right owner for the selected period' })
              }
            }
            if (
              FindOwnerOld.ownerTransferDate &&
              FindOwnerOld.ownerTransferFromDate
            ) {
              if (
                new Date(FindOwnerOld.ownerTransferDate) >=
                new Date(grISODate) &&
                new Date(FindOwnerOld.ownerTransferFromDate) <=
                new Date(grISODate)
              ) {
                Challan.updateOne({ _id: params.id }, { $set: updateObject })
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
              } else {
                return reject({ message: 'Please select right owner for the selected period' })
              }
            }
          } else {

            let FindOwnerNew = "";
            ownerDateResult.filter((data) => {
              if (data.newOwnerId == ownerId) {
                FindOwnerNew = data;
              }
            });

            if (FindOwnerNew && FindOwnerNew.ownerTransferDate) {
              if (
                new Date(FindOwnerNew.ownerTransferDate) <=
                new Date(grISODate)
              ) {
                Challan.updateOne({ _id: params.id }, { $set: updateObject })
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
              } else {
                return reject({ message: 'Please select right owner for the selected period' })
              }
            } else {
              let max = 0;
              ownerDateResult.forEach((result) => {
                max = Math.max(max, new Date(result.ownerTransferDate).getTime())
              })

              if (new Date(grISODate) >= new Date(max)) {
                Challan.updateOne({ _id: params.id }, { $set: updateObject })
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
              } else {
                return reject({ message: 'Please select right owner for the selected period' })
              }
            }
          }
        }
        else {
          
          Challan.updateOne({ _id: params.id }, { $set: updateObject })
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
        }
      })
    });
  }


  //---
  static updateDispatchChallanInvoiceById(requestObject) {
    const { body, params } = requestObject;
    return new Promise((resolve, reject) => {
      const {
        materialType,
        grNumber,
        grDate,
        loadLocation,
        deliveryLocation,
        vehicleNumber,
        vehicleId,
        ownerId,
        ownerName,
        ownerPhone,
        vehicleBank,
        vehicleType,
        deliveryNumber,
        quantityInMetricTons,
        rate,
        diesel,
        cash,
        bankTransfer,
        invoiceDate,
        commisionRate,
        commisionTotal,
        totalExpense,
        invoiceProof,
        shortage,
        balance,
      } = body;

      let grISODate;
      let invoiceISODate;
      if (grDate && typeof grDate === "string" && grDate.includes("/")) {
        grISODate = this.convertToISODate(grDate);
      }

      if (
        invoiceDate &&
        typeof invoiceDate === "string" &&
        invoiceDate.includes("/")
      ) {
        invoiceISODate = this.convertToISODate(invoiceDate);
      }

      const updateObject = {
        materialType,
        grNumber,
        grDate,
        grISODate,
        invoiceISODate,
        loadLocation,
        deliveryLocation,
        vehicleNumber,
        ownerId,
        ownerName,
        vehicleId,
        ownerPhone,
        vehicleType: vehicleType
          ? vehicleType.charAt(0).toUpperCase() +
          vehicleType.slice(1).toLowerCase()
          : null,
        deliveryNumber,
        quantityInMetricTons,
        rate,
        diesel,
        cash,
        bankTransfer,
        invoiceDate,
        commisionRate,
        commisionTotal,
        vehicleBank,
        totalExpense,
        invoiceProof,
        shortage,
        balance,
        vehicleReferenceId: vehicleId,
        vehicleBankReferenceId: vehicleBank,
        ownerReferenceId: ownerId,
        modifiedAt: Date.now(),
      };

      Challan.updateOne({ _id: params.id }, { $set: updateObject })
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
  //---
  static updateChallanStatus(requestObject) {
    return new Promise((resolve, reject) => {
      const status =
        requestObject.type === "ACK"
          ? { isAcknowledged: true }
          : { isReceived: true };

      Challan.updateOne({ _id: requestObject.id }, { $set: status })
        .then((data) => {
          if (data) {
            resolve({
              data,
              message: "Updated challan status successfully",
            });
          }
        })
        .catch((err) => {
          reject({
            err,
            message: "Unable to update challan status",
          });
        });
    });
  }

  //Upload Challan Xsl
  static updateChallanXsl(requestObject) {
    return new Promise((resolve, reject) => {

      requestObject.map((challanResult) => {

        let sliceResult = challanResult.vehicle_owner_details.slice(1);


        sliceResult.map((excelResult) => {

          let idData = excelResult._id;

          let rate = excelResult.rate;

          let diesel = excelResult.diesel;

          let cash = excelResult.cash;

          let bankTransfer = excelResult.bankTransfer;

          let quantityInMetricTons = excelResult.quantityInMetricTons;


          Challan.findByIdAndUpdate(idData, { $set: { rate: rate, diesel: diesel, cash: cash, bankTransfer: bankTransfer, quantityInMetricTons: quantityInMetricTons } }, { new: true })
            .then((updateResult) => {
              if (updateResult) {

                Challan.findById(idData).then((challanData) => {
                  if (challanData) {
                    let qtyInMat = challanData.quantityInMetricTons;

                    let rate = challanData.rate;

                    let tExpense = rate * qtyInMat;

                    let cRate = challanData.commisionRate;

                    let cTotal = ((cRate * tExpense) / 100);

                    let shortage = challanData.shortage;

                    let diesel = challanData.diesel;

                    let bankTransfer = challanData.bankTransfer;

                    let cash = challanData.cash;

                    let totalBalance = (cash + bankTransfer + diesel + shortage + cTotal);

                    let finalBalance = (tExpense - totalBalance);

                    Challan.findByIdAndUpdate(idData, { commisionTotal: cTotal, totalExpense: tExpense, balance: finalBalance })
                      .then((challanCountData) => {
                        if (challanCountData) {
                          resolve({
                            updateResult,
                            message: "Updated challan excel successfully",
                          });
                        } else {
                          return reject({ message: 'Unable to update challan count data' })
                        }
                      })
                  } else {
                    return reject({ message: 'Unable to find challan data' })
                  }
                })

              } else {
                return reject({ message: 'Unable to update challan excel' })
              }
            }).catch((err) => {
              reject({
                err,
                message: "Unable to update challan excel Info",
              });
            });


          // ----
        })
      })
    });
  }


  static deleteDispatchChallanById(id) {
    return new Promise((resolve, reject) => {
      Challan.deleteOne({ _id: id })
        .then((data) => {
          if (data) {
            resolve({
              data,
              message: "Deleted dispatch challan successfully",
            });
          }
        })
        .catch((err) => {
          reject({
            err,
            message: "Unable to delete dispatch challan",
          });
        });
    });
  }

  static convertToISODate(data) {
    const entryDate = moment(data, "DD/MM/YYYY");
    const entryISODate = entryDate.format("YYYY-MM-DD") + "T00:00:00.000Z";
    return entryISODate;
  }
};
