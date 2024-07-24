const BillRegister = require("../../data-models/accounting-models/bill-register-model");
const Challan = require("../../data-models/dispatch-to-ledger-models/challan-model");

module.exports = class BillRegisterController {
    static async createBillRegister(requestObject) {
        try {
            return new Promise(async (resolve, reject) => {
                BillRegister.findOne({ billNumber: requestObject.billNumber })
                    .then((billnumber) => {
                        if (billnumber) {
                            return reject({
                                message: "This billNumber already exists",
                            });
                        }
                        else {
                            const billTypeConvert = requestObject.billType
                                ? requestObject.billType.toUpperCase()
                                : null;

                            const { billNumber, valueRaised, tax, remarks, challan } = requestObject;

                            const objectData = {
                                billNumber: billNumber,
                                billType: billTypeConvert,
                                valueRaised: valueRaised,
                                tax: tax,
                                remarks: remarks,
                                challan: challan,
                                difference: (- valueRaised)
                            }

                            const _billRegister = new BillRegister(objectData);
                            return _billRegister.save();
                        }
                    })
                    .then((data) => {
                        if (data) {
                            return resolve({
                                data: data,
                                message: "Bill Register has been successfully created !!!!",
                            });
                        }
                    })
                    .catch((err) => {
                        return reject({
                            err,
                            message: "This billNumber already exists",
                        });
                    });
            });
        } catch (err) {
            return Promise.reject({ err, message: "Something went wrong try again" });
        }
    }

    static findAllBillRegister(requestObject) {
    return new Promise((resolve, reject) => {
      // BillRegister.find({}).sort({ createdAt: -1 })
      const { page, limit, searchBNT } = requestObject;

      const pageInput = parseInt(page) || 1;
      const limitInput = parseInt(limit) || 10;

      const skip = limitInput * pageInput - limitInput;

      const searchData = new RegExp(searchBNT, "i");

      BillRegister.aggregate([
        {
          $match: {
            $or: [
              { billNumber: new RegExp(searchData, "i") },
              {
                billType: new RegExp(searchData, "i"),
              },
            ],
          },
        },
        { $sort: { createdAt: -1 } },
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
        .then((bill) => {
           if(bill){
             BillRegister.find({}).then((totalData)=>{
                if(totalData){
                  if (totalData && totalData.length> 0) {
          
                    let totalValueReceived = totalData.reduce((sum, val) => sum + +val.valueReceived,0);
                    let totalValueRaised = totalData.reduce((sum, val) => sum + +val.valueRaised,0);
                    let totalDifference = totalData.reduce((sum, val) => sum + +val.difference,0);
                    let totalTax = totalData.reduce((sum, val) => sum + +val.tax, 0);
        
                    resolve({
                      bill,
                      totalValueRaised,
                      totalValueReceived,
                      totalDifference,
                      totalTax,
                      message: "Successfully retrived all Bill Register informations",
                    });
                  } else {
                    resolve({
                        bill,
                        message: "Successfully retrived all Bill Register informations",
                      }); 
                  }
                }
             })
           }else{
             reject({ message: "Unable to retrive information" });
           }  
           
        })
        .catch((error) => {
          reject(error);
        });
    });
  }

    static getDeliveryInfoById(recoverId) {
        return new Promise((resolve, reject) => {
            BillRegister.findById({ _id: recoverId })
                .populate('challan', 'deliveryLocation invoiceDate quantityInMetricTons rate totalExpense vehicleNumber deliveryNumber')
                .then((data) => {
                    if (data) {
                        resolve({
                            deliveryDetails: data,
                            message: "Successfully retrived Delivery Details informations",
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

    static getAllBillDeliveryNumber(queryparams) {
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
                BillRegister.find()
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

    static updateDifferenceInfoById(requestObject) {
        const { body, params } = requestObject;
        return new Promise((resolve, reject) => {

            return BillRegister.find({ _id: params.id })
                .then((data) => {
                    if (data) {
                        data.map((result) => {
                            BillRegister.findOneAndUpdate(
                                { _id: params.id },
                                {
                                    $set:
                                        { difference: (+body.valueReceived - +result.valueRaised), valueReceived: +body.valueReceived }
                                },
                                { new: true })
                                .then((result) => {
                                    if (!result) {
                                        reject({
                                            message: "Unable to update Difference status",
                                        });
                                    } else {
                                        resolve({
                                            deliveryDetails: result,
                                            message: "Successfully Updated Difference Data informations",
                                        });
                                    }
                                })
                                .catch((err) => {
                                    reject({
                                        err,
                                        message: "Unable to update Difference status",
                                    });
                                });
                        })
                    } else {
                        return reject({ message: "Unable to retrive Bill info" });
                    }
                })
                .catch((error) => {
                    return reject({ message: error.message });
                });
        });
    }

    static updateBillRegisterById(requestObject) {
        const { body, params } = requestObject;
        try {
            return new Promise((resolve, reject) => {

                return BillRegister.findById({ _id: params.id })
                    .then((data) => {
                        if (!data) {
                            return reject({ message: 'Your Param id not found' })
                        } else {
                            

                            const { billNumber, billType, valueRaised, tax, remarks, challan } = body;

                            let countDifference = data.valueReceived - valueRaised;
                            const updateObject = {
                                billNumber: billNumber,
                                billType: billType,
                                valueRaised: valueRaised,
                                tax: tax,
                                remarks: remarks,
                                challan: challan,
                                difference: countDifference,
                                modifiedAt: Date.now(),
                            };

                            BillRegister.findOneAndUpdate({ _id: data._id }, { $set: updateObject }, { new: true })
                                .then((data) => {
                                    if (data) {
                                        resolve({
                                            data,
                                            message: "Bill Register information updated successfully",
                                        });
                                    } else {
                                        reject({ message: "Unable to update Bill Register info" });
                                    }
                                })
                                .catch((error) => {
                                    if (error.code === 11000) {
                                        return reject({ message: 'BillNumber is exists in your System please update your new bill number' })
                                    } else {
                                        return reject(error);
                                    }
                                });

                        }
                    })
                    .catch((err) => {
                        reject({ err, message: "Your Parma Id is not found " });
                    })
            });
        } catch (err) {
            return Promise.reject({ err, message: "Something went wrong" });
        }
    }

    static deleteBillRegisterById(billId) {
        try {
            return new Promise((resolve, reject) => {
                return BillRegister.findById({ _id: billId })
                    .then((data) => {
                        if (!data) {
                            return reject({ message: 'Your Param id not found' })
                        } else {
                            BillRegister.findOneAndDelete({ _id: billId })
                                .then((data) => {
                                    if (data) {
                                        resolve({
                                            data,
                                            message: "Bill Register information Delete successfully",
                                        });
                                    } else {
                                        reject({ message: "Unable to Delete Bill  Code info" });
                                    }
                                })
                                .catch((error) => {
                                    reject(error);
                                });
                        }
                    })
            });
        } catch (err) {
            return Promise.reject({ err, message: "Something went wrong" });
        }
    }


}