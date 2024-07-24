const Owner = require("../../data-models/onboarding-data-models/owner-model");
const Vehicle = require("../../data-models/onboarding-data-models/vehicle-model");
const Challan = require("../../data-models/dispatch-to-ledger-models/challan-model");
const OwnerTransferLog = require("../../data-models/onboarding-data-models/ownership-transfer-log-model");
const { compareSync } = require("bcrypt");
const mongoose = require('mongoose');
const moment = require("moment");



module.exports = class OwnerController {
  static async vehicleOnBoardingLogic(requestObject) {
    return new Promise(async (resolve, reject) => {
      Vehicle.findOne({
        registrationNumber: requestObject.registrationNumber,
      })
        .then(async (registrationNumber) => {
          if (registrationNumber) {
            return reject({
              message: "This vehicle number already exists",
            });
          } else {
            const {
              registrationNumber,
              truckType,
              driverName,
              rcBookProof,
              driverPhoneNumber,
              commission,
              ownerId,
              accountId,
            } = requestObject;

            const _onBoardingVehicle = new Vehicle({
              registrationNumber: registrationNumber
                ? registrationNumber.toUpperCase()
                : null,
              truckType: truckType ? truckType.toLowerCase() : null,
              driverName,
              rcBookProof,
              driverPhoneNumber,
              commission,
              ownerId,
              accountId,
            });
            return _onBoardingVehicle.save();
          }
        })
        .then((data) => {
          if (data) {
            const obj = JSON.parse(JSON.stringify(data));
            if (obj && obj._id) {
              Owner.updateOne(
                { _id: requestObject.ownerId },
                { $push: { vehicleIds: obj._id } }
              ).then((data) => {
                if (data) {
                  resolve({
                    user: data,
                    message: "Onboarded vehicle successfully",
                  });
                }
              });
            }
          }
        })
        .catch((err) => {
          return reject({ err, message: "Unable to create vehicle" });
        });
    }).catch((err) => {
      console.error(err);
      return Promise.reject({ error: err, message: "Something went wrong" });
    });
  }

  static getAllVehicles(requestObject) {
    const { page, limit, searchVehicleNumber } = requestObject;

    const pageInput = parseInt(page) || 1;
    const limitInput = parseInt(limit) || 50;

    const skip = limitInput * pageInput - limitInput;

    const searchData = new RegExp(searchVehicleNumber, "i");

    return new Promise((resolve, reject) => {
      // Vehicle.find({})
        // .populate("ownerId")
        // .populate("accountId")
      Vehicle.aggregate([
        {
          $match: { $or: [{ registrationNumber: new RegExp(searchData, "i") }] },
        },
        // { $sort: {name: 1 }},
        {
          $lookup: {
            from: "owners",
            localField: "ownerId",
            foreignField: "_id",
            as: "ownerId",
          },
        },
        {
          $lookup: {
            from: "accounts",
            localField: "accountId",
            foreignField: "_id",
            as: "accountId",
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
        .then((truck) => {
          if (truck) {
            resolve({
              truck,
              message: "Successfully retrived users informations",
            });
          } else {
            reject({ message: "Unable to retrive vehicles" });
          }
        })
        .catch((error) => {
          reject(error);
        });
    });
  }

  static getAllVehicleNumbers() {
    return new Promise((resolve, reject) => {
      Vehicle.find({})
        .populate("ownerId", ["name", "phoneNumber"])
        .select({
          registrationNumber: 1,
          truckType: 1,
          commission: 1,
          accountId: 1,
        })
        .then((data) => {
          if (data) {
            resolve({
              data,
              message: "Successfully retrived vehicle informations",
            });
          } else {
            reject({ message: "Unable to retrived vehicles" });
          }
        })
        .catch((error) => {
          reject(error);
        });
    });
  }

  static getAllOldVehicleNumbers() {
    return new Promise((resolve, reject) => {
      Vehicle.find({})
        .populate("ownerId", ["name", "phoneNumber"])
        .select({
          registrationNumber: 1,
          truckType: 1,
          commission: 1,
          accountId: 1,
        })
        .then((data) => {
          if (data) {

            //start
            Owner.aggregate([
              {
                $project: {
                  'oldVehicleDetails': 1,
                  'phoneNumber': 1,
                  'name': 1,
                  'accountId': 1
                }
              },
              { $unwind: '$oldVehicleDetails' },
            ])
              .then((userResult) => {
                if (userResult) {
                  let user = [];
                  let result = []
                  userResult.map((userData) => {
                    // console.log(userData)
                    let ownerId = {
                      _id: userData._id,
                      name: userData.name,
                      phoneNumber: userData.phoneNumber
                    }

                    result = {
                      _id: userData.oldVehicleDetails.vehicleIds,
                      truckType: userData.oldVehicleDetails.truckType,
                      commission: userData.oldVehicleDetails.commission,
                      registrationNumber: userData.oldVehicleDetails.vehicleNumber,
                      ownerId,
                      accountId: userData.oldVehicleDetails.accountId
                    }

                    user.push(result)
                  })
                  data = [...user, ...data]
                  resolve({
                    data,
                    message: "Successfully retrived all owners informations",
                  });

                } else {
                  reject({ message: "Unable to retrive information" });
                }
              })
            // ---end
            // resolve({
            //   data,
            //   message: "Successfully retrived vehicle informations",
            // });
          } else {
            reject({ message: "Unable to retrived vehicles" });
          }
        })
        .catch((error) => {
          reject(error);
        });
    });
  }


  static findVehicleDetailsById(id) {
    return new Promise((resolve, reject) => {
      Vehicle.find({ _id: id })
        .populate("ownerId")
        .populate("accountId")
        .then((truck) => {
          if (truck) {
            resolve({
              truck,
              message: "Successfully retrived users informations",
            });
          } else {
            reject({ message: "Unable to retrive vehicles" });
          }
        })
        .catch((error) => {
          reject(error);
        });
    });
  }
  static updateVehicleDetailsById(requestObject) {
    const { body, params } = requestObject;
    return new Promise((resolve, reject) => {
      const {
        registrationNumber,
        truckType,
        driverName,
        rcBookProof,
        driverPhoneNumber,
        commission,
        ownerId,
        accountId,
        ownerName
      } = body;  

      const updateObject = {
        registrationNumber: registrationNumber
          ? registrationNumber.toUpperCase()
          : null,
        truckType: truckType.toLowerCase(),
        driverName,
        rcBookProof,
        driverPhoneNumber,
        commission,
        ownerId,
        accountId,
        ownerName,
        modifiedAt: Date.now(),
      };

      Vehicle.findOneAndUpdate({ _id: params.id }, { $set: updateObject }, { new: true, runValidators: true })
        .then((user) => {
          if (user) {
            Owner.findOneAndUpdate(
              { _id: params.ownerId },
              { $pull: { vehicleIds: params.id } }, { safe: true, multi: true })
              .then((ownerResult) => {
                if (ownerResult) {
                  Challan.find({ vehicleId: params.id })
                    .then((challandata) => {
                      if (challandata) {
                        Owner.findById({ _id: params.ownerId }).then((ownerResult) => {

                          let transferInfo = ownerResult.vehicleDetails.filter((vehicleData) => {

                            const vehno = vehicleData.vehicleIds || "";
                            if (vehno == params.id) {
                              return vehicleData;
                            }
                          })
                          if (transferInfo && transferInfo.length > 0) {
                            transferInfo.map((resultData) => {

                              if (resultData.isOwnerTransfer) {

                                Challan.findOneAndUpdate({ vehicleId: params.id, ownerId: params.ownerId },
                                  {
                                    $set: {
                                      vehicleNumber: (updateObject.registrationNumber),
                                      vehicleType: updateObject.truckType,
                                      ownerId: updateObject.ownerId,
                                      ownerName:updateObject.ownerName,
                                    }
                                  }, { new: true })
                                  .then((updateResult) => {
                                    if (updateResult) {
                                      Owner.findOneAndUpdate({ _id: updateObject.ownerId },
                                        {
                                          $push: { vehicleIds: user._id }
                                        },
                                        { safe: true, new: true }
                                      ).then((updateVehicleId) => {
                                        if (updateVehicleId) {
                                          resolve({
                                            user,
                                            message: "Successfully updated user informations",
                                          });
                                        } else {
                                          return reject({ message: 'Unable to push vehicle id' })
                                        }
                                      })
                                    } else {
                                      Owner.findOneAndUpdate({ _id: updateObject.ownerId },
                                        {
                                          $push: { vehicleIds: user._id }
                                        },
                                        { safe: true, new: true }
                                      ).then((newOwnerResult) => {
                                        if (newOwnerResult) {
                                          resolve({
                                            user,
                                            message: "Successfully updated user informations",
                                          });
                                        } else {
                                          {
                                            return reject({ message: "Unable to Push Vehicle Ids" });
                                          }
                                        }
                                      })
                                      // return reject({ message: "Unable to Update Challan Vehical Number and Truck Type" });
                                    }
                                  })
                              }
                            })
                          } else {
                        
                            Challan.updateMany({ vehicleId: params.id },
                              {
                                $set: {
                                  vehicleNumber: updateObject.registrationNumber,
                                  vehicleType: updateObject.truckType,
                                  ownerId: updateObject.ownerId,
                                  ownerName:updateObject.ownerName
                                }
                              }, { new: true, runValidators: true })
                              .then((updateResult) => {
                                if (updateResult) {

                                  Owner.findOneAndUpdate({ _id: updateObject.ownerId },
                                    {
                                      $push: { vehicleIds: user._id }
                                    },
                                    { safe: true, new: true }
                                  ).then((newOwnerResult) => {
                                    if (newOwnerResult) {
                                      resolve({
                                        user,
                                        message: "Successfully updated user informations",
                                      });
                                    } else {
                                      {
                                        return reject({ message: "Unable to Push Vehicle Ids" });
                                      }
                                    }
                                  })
                                } else {
                                  Owner.findOneAndUpdate({ _id: updateObject.ownerId },
                                    {
                                      $push: { vehicleIds: user._id }
                                    },
                                    { safe: true, new: true }
                                  ).then((newOwnerResult) => {
                                    if (newOwnerResult) {
                                      resolve({
                                        user,
                                        message: "Successfully updated user informations",
                                      });
                                    } else {
                                      {
                                        return reject({ message: "Unable to Push Vehicle Ids" });
                                      }
                                    }
                                  })
                                  // return reject({ message: "Unable to Update Challan Vehical Number and Truck Type" });
                                }
                              })
                          }
                        })
                      } else {
                        reject({ message: "Unable to Find Challan Information" });
                      }
                    })
                    .catch((error) => {
                      reject({ error, message: 'Challan Vehical id Not Found' });
                    });
                } else {
                  return reject({ message: 'Unable to pull old vehicle ids' })
                }
              })
          } else {
            return reject({ message: "Unable to update owner information" });
          }
        })
        .catch((error) => {
          reject(error);
        });
    });
  }

  static updateVehicleOwnershipDetailsById(requestObject) {
    const { body, params } = requestObject;
    return new Promise((resolve, reject) => {
      const {
        registrationNumber,
        truckType,
        driverName,
        rcBookProof,
        driverPhoneNumber,
        commission,
        ownerId,
        userId,
        accountId,
        ownerTransferDate,
        ownerTransferFromDate
      } = body;

      const updateObject = {
        registrationNumber: registrationNumber
          ? registrationNumber.toUpperCase()
          : null,
        truckType: truckType.toLowerCase(),
        driverName,
        rcBookProof,
        driverPhoneNumber,
        commission,
        ownerId,
        accountId,
        modifiedAt: Date.now(),
      };


      Challan.find({ $and: [{ vehicleId: params.id, ownerId: params.ownerId }] }).then((challandata) => {
        
        if(challandata && challandata.length > 0){
          let maxGrDate = 0;
          challandata.forEach((maxResult) => {
            maxGrDate = Math.max(maxGrDate, new Date(maxResult.grISODate.getTime()))
          })
  
           if(new Date(ownerTransferDate) >= new Date(maxGrDate)){
            OwnerTransferLog.find({ vehicleIds: params.id }).then((logData) => {
  
              let max = 0;
              logData.forEach((result) => {
          
                max = Math.max(max, new Date(result.ownerTransferDate).getTime())
              })
      
      
              if (new Date(ownerTransferDate) >= new Date(max)) {
      
                // let logFilter = logData.filter((result) => { 
      
                //   return (result.newOwnerId == ownerId || result.oldOwnerId == ownerId)
                // })
      
      
                // if (!(logFilter && logFilter.length > 0)) {    
      
                  Vehicle.findOneAndUpdate({ _id: params.id }, { $set: updateObject }, { new: true, runValidators: true })
                    .then((user) => {
                      if (user) {
                        Owner.findOneAndUpdate(
                          { _id: params.ownerId },
                          { $pull: { vehicleIds: params.id } }, { safe: true, multi: true })
                          .then((ownerResult) => {
                            if (ownerResult) {
                              Challan.find({ vehicleId: params.id })
                                .then((challandata) => {
                                  if (challandata) {
                                    Challan.updateMany({ vehicleId: params.id },
                                      {
                                        $set: {
                                          vehicleNumber: (updateObject.registrationNumber),
                                          vehicleType: updateObject.truckType 
                                        }
                                      }, { new: true, runValidators: true })
                                      .then((updateResult) => {
                                        if (updateResult) {
                                          let transferIsoDate = this.convertTimestampToDate(ownerTransferDate);
                                          // let transferIsoFromDate = this.convertTimestampToDate(ownerTransferFromDate);
      
                                          Owner.findOneAndUpdate({ _id: updateObject.ownerId },
                                            {
                                              $push: {
                                                vehicleDetails: {
                                                  vehicleIds: user._id,
                                                  ownerTransferDate: new Date(transferIsoDate),
                                                  isOwnerTransfer: true,
                                                  ownerId: ownerId,
                                                  ownerTransferFromDate: ownerTransferFromDate
                                                },
                                                vehicleIds: user._id
                                              }
                                            },
                                            { safe: true, new: true }
                                          )
                                            .then((ownerData) => {
                                              if (ownerData) {
                                                Vehicle.findById(params.id).then((vehicleDetails) => {
                                                  if (vehicleDetails) {
                                                    Owner.findOneAndUpdate({ _id: params.ownerId },
                                                      {
                                                        $push: {
                                                          oldVehicleDetails: {
                                                            vehicleIds: params.id,
                                                            ownerId: params.ownerId,
                                                            ownerTransferDate: new Date(transferIsoDate),
                                                            ownerTransferFromDate: ownerTransferFromDate,
                                                            vehicleNumber: vehicleDetails.registrationNumber,
                                                            truckType: vehicleDetails.truckType,
                                                            commission: vehicleDetails.commission,
                                                            accountId: vehicleDetails.accountId
                                                          }
                                                        }
                                                      },
                                                      { safe: true, new: true }
                                                    ).then((oldvehicleDetails) => {
                                                      if (oldvehicleDetails) {
                                                        const OwenrTransferLogData = {
                                                          vehicleNumber: registrationNumber,
                                                          userId: userId,
                                                          oldOwnerId: params.ownerId,
                                                          newOwnerId: ownerId,
                                                          vehicleIds: params.id,
                                                          ownerTransferDate: ownerTransferDate,
                                                          ownerTransferFromDate: ownerTransferFromDate
                                                        }
                                                        const finalResult = new OwnerTransferLog(OwenrTransferLogData);
                                                        return finalResult.save((err, data) => {
                                                          if (err) {
                                                            return reject({ err, message: 'Unable to update logs' })
                                                          }
      
                                                          resolve({
                                                            user,
                                                            message: "Successfully updated user informations",
                                                          });
                                                        });
                                                      } else {
                                                        return reject({ message: 'Unable to update old Vehicle Details Info' })
                                                      }
                                                    })
                                                  } else {
                                                    return reject({ message: 'Unable to find vehicle number' })
                                                  }
                                                })
                                              } else {
                                                return reject({ message: "Unable to Update Vehicle details Info" });
                                              }
                                            })
                                        } else {
                                          return reject({ message: "Unable to Update Challan Vehical Number and Truck Type" });
                                        }
                                      })
                                  } else {
                                    reject({ message: "Unable to Find Challan Information" });
                                  }
                                })
                                .catch((error) => {
                                  reject({ error, message: 'Challan Vehical id Not Found' });
                                });
                            } else {
                              return reject({ message: 'Owner Vehicle Id  is not able to pull result' })
                            }
                          })
      
                      } else {
                        return reject({ message: "Unable to update owner information" });
                      }
                    })
                    .catch((error) => {
                      return reject(error);
                    });
                // } else {
                //   return reject({ message: 'This owner is already transfer' })
                // }
      
              } else {
                return reject({ message: 'Please choose transfer the later than latest dispatch challan date' })
              }
            }) 
           }else{
            return reject({ message: 'Please choose transfer the later than latest dispatch challan date' })
           }
        }else{
          OwnerTransferLog.find({ vehicleIds: params.id }).then((logData) => {
           
            let max = 0;
            logData.forEach((result) => {
        
              max = Math.max(max, new Date(result.ownerTransferDate).getTime())
            })
    
    
            if (new Date(ownerTransferDate) >= new Date(max)) {
    
              // let logFilter = logData.filter((result) => {
    
              //   return (result.newOwnerId == ownerId || result.oldOwnerId == ownerId)
              // })
    
    
              // if (!(logFilter && logFilter.length > 0)) {
    
                Vehicle.findOneAndUpdate({ _id: params.id }, { $set: updateObject }, { new: true, runValidators: true })
                  .then((user) => {
                    if (user) {
                      Owner.findOneAndUpdate(
                        { _id: params.ownerId },
                        { $pull: { vehicleIds: params.id } }, { safe: true, multi: true })
                        .then((ownerResult) => {
                          if (ownerResult) {
                            Challan.find({ vehicleId: params.id })
                              .then((challandata) => {
                                if (challandata) {
                                  Challan.updateMany({ vehicleId: params.id },
                                    {
                                      $set: {
                                        vehicleNumber: (updateObject.registrationNumber),
                                        vehicleType: updateObject.truckType 
                                      }
                                    }, { new: true, runValidators: true })
                                    .then((updateResult) => {
                                      if (updateResult) {
                                        let transferIsoDate = this.convertTimestampToDate(ownerTransferDate);
                                        // let transferIsoFromDate = this.convertTimestampToDate(ownerTransferFromDate);
    
                                        Owner.findOneAndUpdate({ _id: updateObject.ownerId },
                                          {
                                            $push: {
                                              vehicleDetails: {
                                                vehicleIds: user._id,
                                                ownerTransferDate: new Date(transferIsoDate),
                                                isOwnerTransfer: true,
                                                ownerId: ownerId,
                                                ownerTransferFromDate: ownerTransferFromDate
                                              },
                                              vehicleIds: user._id
                                            }
                                          },
                                          { safe: true, new: true }
                                        )
                                          .then((ownerData) => {
                                            if (ownerData) {
                                              Vehicle.findById(params.id).then((vehicleDetails) => {
                                                if (vehicleDetails) {
                                                  Owner.findOneAndUpdate({ _id: params.ownerId },
                                                    {
                                                      $push: {
                                                        oldVehicleDetails: {
                                                          vehicleIds: params.id,
                                                          ownerId: params.ownerId,
                                                          ownerTransferDate: new Date(transferIsoDate),
                                                          ownerTransferFromDate: ownerTransferFromDate,
                                                          vehicleNumber: vehicleDetails.registrationNumber,
                                                          truckType: vehicleDetails.truckType,
                                                          commission: vehicleDetails.commission,
                                                          accountId: vehicleDetails.accountId
                                                        }
                                                      }
                                                    },
                                                    { safe: true, new: true }
                                                  ).then((oldvehicleDetails) => {
                                                    if (oldvehicleDetails) {
                                                      const OwenrTransferLogData = {
                                                        vehicleNumber: registrationNumber,
                                                        userId: userId,
                                                        oldOwnerId: params.ownerId,
                                                        newOwnerId: ownerId,
                                                        vehicleIds: params.id,
                                                        ownerTransferDate: ownerTransferDate,
                                                        ownerTransferFromDate: ownerTransferFromDate
                                                      }
                                                      const finalResult = new OwnerTransferLog(OwenrTransferLogData);
                                                      return finalResult.save((err, data) => {
                                                        if (err) {
                                                          return reject({ err, message: 'Unable to update logs' })
                                                        }
    
                                                        resolve({
                                                          user,
                                                          message: "Successfully updated user informations",
                                                        });
                                                      });
                                                    } else {
                                                      return reject({ message: 'Unable to update old Vehicle Details Info' })
                                                    }
                                                  })
                                                } else {
                                                  return reject({ message: 'Unable to find vehicle number' })
                                                }
                                              })
                                            } else {
                                              return reject({ message: "Unable to Update Vehicle details Info" });
                                            }
                                          })
                                      } else {
                                        return reject({ message: "Unable to Update Challan Vehical Number and Truck Type" });
                                      }
                                    })
                                } else {
                                  reject({ message: "Unable to Find Challan Information" });
                                }
                              })
                              .catch((error) => {
                                reject({ error, message: 'Challan Vehical id Not Found' });
                              });
                          } else {
                            return reject({ message: 'Owner Vehicle Id  is not able to pull result' })
                          }
                        })
    
                    } else {
                      return reject({ message: "Unable to update owner information" });
                    }
                  })
                  .catch((error) => {
                    return reject(error);
                  });
              // } else {
              //   return reject({ message: 'This owner is already transfer' })
              // }
    
            } else {
              return reject({ message: 'Please choose transfer the later than latest dispatch challan date' })
            }
          }) 
        }
      })
    });
  }


  static deleteVehicleDetailsById({ id, ownerId }) {
    return new Promise((resolve, reject) => {
      Vehicle.findByIdAndRemove({ _id: id }).then((data) => {
        if (data) {
          Owner.updateOne(
            { _id: ownerId },
            { $pull: { vehicleIds: id } },
            { safe: true, multi: true }
          )
            .then((data) => {
              resolve({ data, message: "Deleted vehicle info" });
            })
            .catch((err) => {
              reject({
                err,
                message:
                  "Deleted vehicle but not the vehicle id from owners, nothing to worry",
              });
            });
        } else {
          reject("Not able to delete vehicle");
        }
      });
    });
  }
  static convertToISODate(data) {
    const entryDate = moment(data, "DD/MM/YYYY");
    const entryISODate = entryDate.format("YYYY-MM-DD") + "T00:00:00.000Z";
    return entryISODate;
  }
  static convertTimestampToDate(dateString) {
    const dt = new Date(Number(dateString));
    const dateEntry = dt.toISOString().split("T")[0];
    const entryDate = moment(dateEntry, "YYYY-MM-DD");
    const entryISODate = entryDate.format("YYYY-MM-DD") + "T00:00:00.000Z";
    return entryISODate;
  }
};


