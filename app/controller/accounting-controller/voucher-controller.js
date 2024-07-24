const Voucher = require("../../data-models/accounting-models/voucher-model");
const Vehicle = require("../../data-models/onboarding-data-models/vehicle-model");
const moment = require("moment");

module.exports = class VoucherController {
  static createVoucher(requestObject) {
    try {
      return new Promise(async (resolve, reject) => {
        // Voucher.findOne({ voucherNumber: requestObject.voucherNumber })
        //   .then((voucherNumber) => {
        //     if (voucherNumber) {
        //       return reject({
        //         message: "This voucher number already exists",
        //       });
        //     } else {
        const {
          voucherNumber,
          voucherDate,
          vehicleNumber,
          materialType,
          materialId,
          vehicleId,
          vehicleBank,
          ownerName,
          ownerId,
          ownerPhone,
          narration,
          amount,
          modeOfPayment,
        } = requestObject;
        const voucherISODate = voucherDate
          ? this.convertToISODate(voucherDate)
          : null;
        const objectModel = {
          voucherNumber: voucherNumber ? voucherNumber.toUpperCase() : null,
          voucherDate,
          voucherISODate,
          vehicleNumber,
          materialType,
          materialId,
          vehicleId,
          vehicleBank,
          ownerPhone,
          ownerDetails: ownerId,
          vehicleDetails: vehicleId,
          ownerName,
          ownerId,
          narration,
          amount,
          modeOfPayment,
        };
        const _voucher = new Voucher(objectModel);
        return (
          _voucher
            .save()
            // }
            //})
            .then((data) => {
              if (data) {
                return resolve({
                  voucherData: data,
                  message: "Voucher has been successfully created !!!!",
                });
              }
            })
            .catch((error) => {
              return reject({
                error,
                message: "Oh bad !!! Unable to create voucher",
              });
            })
        );
      });
    } catch (error) {
      return Promise.reject({
        error,
        message: "something went wrong try again",
      });
    }
  }

  static updateVoucher(requestObject) {
    const { body, params } = requestObject;
    return new Promise((resolve, reject) => {
      const {
        voucherNumber,
        voucherDate: date,
        vehicleNumber,
        vehicleId,
        ownerName,
        ownerId,
        vehicleBank,
        ownerPhone,
        narration,
        amount,
        modeOfPayment,
      } = body;
      if (
        date &&
        vehicleNumber &&
        vehicleId &&
        ownerName &&
        vehicleBank &&
        ownerPhone &&
        ownerId &&
        narration &&
        amount !== null &&
        modeOfPayment
      ) {
        const updateObject = {
          ...body,
          ownerDetails: ownerId,
          vehicleDetails: vehicleId,
          voucherISODate: date ? this.convertToISODate(date) : null,
          voucherNumber: voucherNumber ? voucherNumber.toUpperCase() : null,
          modifiedAt: Date.now(),
        };
        Voucher.updateOne({ _id: params.id }, { $set: updateObject })
          .then((voucher) => {
            if (voucher) {
              resolve({
                voucher,
                message: "Successfully updated voucher information",
              });
            } else {
              reject({ message: "Unable to update voucher info" });
            }
          })
          .catch((error) => {
            reject({ error });
          });
      } else {
        reject({ message: "Required feilds missing" });
      }
    });
  }

  static async getAllVouchersByMonth(requestObject) {

    try {
      const vaucharEntries = await this.monthlyCashBook(requestObject);
      const amounts = this.amountCalculation(
        vaucharEntries);

      if (amounts) {
        return Promise.resolve({
          vaucharEntries,
          amounts,
          message: "Retreived all the cash book data",
        });
      } else {
        return Promise.reject({
          error: "Something went wront with ledger retreival",
        });
      }
    } catch (err) {
      return Promise.reject({ error });
    }

  }


  static monthlyCashBook(requestObject) {
    return new Promise((resolve, reject) => {
      const { entryYear, entryMonth } = requestObject;
      
      Voucher.aggregate([
        {
          $project: {
            voucherDate: 1,
            voucherNumber: 1,
            voucherDate:1,
            voucherISODate: 1,
            narration: 1,
            vehicleNumber: 1,
            vehicleBank:1,
            vehicleId: 1,
            vehicleDetails:1,
            ownerId:1,
            ownerName: 1,
            materialId:1,
            ownerPhone:1,
            ownerDetails:1,
            amount: 1,
            materialType: 1,
            modeOfPayment: 1,
            year: { $year: "$voucherISODate" },
            month: { $month: "$voucherISODate" },
          },
        },
        {
          $match: {
            year: Number(entryYear),
            month: Number(entryMonth),
          },
        },
        { $sort: { voucherISODate: -1 } },
      ])
        .then((vaucharEntries) => {
          resolve(vaucharEntries);
        })
        .catch((error) => {
          reject({
            error,
            message: "Unable to fetch vauchar entries for this month",
          });
        });
    });
  }

  static amountCalculation(vaucharEntries) {
    try {

      let monthlyTotalAmount = 0;
      if (this.notNull(vaucharEntries)) {
        monthlyTotalAmount = vaucharEntries
          .map((item) => item.amount)
          .reduce((prev, curr) => prev + curr, 0);
      }

      const mAmount = monthlyTotalAmount;

      return {
        monthlyTotalAmount: this.roundUpNumbers(mAmount),
      };
    } catch (error) {
      console.log(error);
      return null;
    }
  }

  static notNull(val) {
    return (
      val !== null && val !== undefined && Array.isArray(val) && val.length > 0
    );
  }

  static roundUpNumbers(num) {
    if (num) {
      const val = num.toFixed(2);
      return val;
    }
    return "00.00";
  }

  static getVehicleInfo(id) {
    return new Promise((resolve, reject) => {
      Vehicle.find({}, { registrationNumber: 1, accountId: 1 })
        .populate("ownerId", ["name", "phoneNumber"])
        .then((vehicle) => {
          if (vehicle) {
            resolve({
              vehicle,
              message: "Fetched all vehicles successfully",
            });
          }
        })
        .catch((error) => {
          reject({
            error,
            message: "Unable to fetch vehicles info",
          });
        });
    });
  }

  static deleteVoucherById(id) {
    return new Promise((resolve, reject) => {
      Voucher.deleteOne({ _id: id })
        .then((voucher) => {
          if (voucher) {
            resolve({
              voucher,
              message: "Deleted voucher successfully",
            });
          }
        })
        .catch((error) => {
          reject({
            error,
            message: "Unable to delete voucher",
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
