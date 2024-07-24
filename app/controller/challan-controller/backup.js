// const MasterData = require("../../data-models/dispatch-to-ledger-models/master-data-model");

// module.exports = class OwnerController {
//   static async createMasterIndependentData(requestObject) {
//     try {
//       const { body, params } = requestObject;
//       const { value } = body;
//       const { id, type } = params;
//       if (value && typeof value === "string") {
//         if (type === "material") {
//           const returnObject = await this.createMaterial(id, value);
//           return returnObject;
//         } else if (type === "sourceLocation") {
//           const returnObject = await this.createLoadLocation(id, value);
//           return returnObject;
//         } else if (type === "deliveryLocation") {
//           const returnObject = await this.createDeliveryLocation(id, value);
//           return returnObject;
//         } else {
//           return Promise({ message: "invalid request" });
//         }
//       } else {
//         return Promise({ message: "invalid request" });
//       }
//     } catch (error) {
//       return Promise({ error, message: "Something went wrong !!!" });
//     }
//   }

//   static createMaterial(id, material) {
//     return new Promise((resolve, reject) => {
//       const materialType = material ? material.toUpperCase() : "";
//       MasterData.updateOne(
//         { _id: id },
//         { $push: { material: { materialType } } }
//       )
//         .then((data) => {
//           resolve({ data, message: "Updated master data successfully !!!" });
//         })
//         .catch((error) => {
//           reject({ error, message: "Unable to update master data" });
//         });
//     });
//   }

//   static createLoadLocation(id, loc) {
//     return new Promise((resolve, reject) => {
//       const location = loc
//         ? loc.charAt(0).toUpperCase() + loc.slice(1).toLowerCase()
//         : "";
//       MasterData.updateOne(
//         { _id: id },
//         { $push: { loadLocation: { location } } }
//       )
//         .then((data) => {
//           resolve({ data, message: "Updated master data successfully !!!" });
//         })
//         .catch((error) => {
//           reject({ error, message: "Unable to update master data" });
//         });
//     });
//   }

//   static createDeliveryLocation(id, loc) {
//     return new Promise((resolve, reject) => {
//       const location = loc
//         ? loc.charAt(0).toUpperCase() + loc.slice(1).toLowerCase()
//         : "";
//       MasterData.updateOne(
//         { _id: id },
//         { $push: { deliveryLocation: { location } } }
//       )
//         .then((data) => {
//           resolve({ data, message: "Updated master data successfully !!!" });
//         })
//         .catch((error) => {
//           reject({ error, message: "Unable to update master data" });
//         });
//     });
//   }

//   static async createMasterData() {
//     try {
//       const data = await MasterData.find({});
//       if (data && data.length <= 0) {
//         const createMaster = await this.createNewMasterData();
//         return createMaster;
//       } else {
//         const getMaster = await this.findAllMasterData();
//         return getMaster;
//       }
//     } catch (err) {
//       console.log(err);
//       return Promise.reject({ error: err, message: "something went wrong" });
//     }
//   }

//   static getAllMasterData() {
//     return new Promise((resolve, reject) => {
//       MasterData.find({})
//         .then((data) => {
//           resolve({ data, message: "Master data fetched successfully !!!" });
//         })
//         .catch((error) => {
//           reject({ error, message: "Unable to update master data" });
//         });
//     });
//   }

//   static createNewMasterData() {
//     return new Promise((resolve, reject) => {
//       const objectModel = {
//         material: [],
//         loadLocation: [],
//         deliveryLocation: [],
//       };
//       const _masterData = new MasterData(objectModel);
//       _masterData
//         .save()
//         .then((data) => {
//           const newRecord = JSON.parse(JSON.stringify(data));
//           resolve({
//             id: newRecord._id,
//             message: "Fetched id of master data $$$",
//           });
//         })
//         .catch((error) => {
//           reject({ error, message: "Something went wrong" });
//         });
//     });
//   }

//   static findAllMasterData() {
//     return new Promise((resolve, reject) => {
//       MasterData.find({})
//         .then((masterData) => {
//           resolve({
//             masterData,
//             message: "Fetched id of master data !!!",
//           });
//         })
//         .catch((error) => {
//           reject(error);
//         });
//     });
//   }

//   static findMasterDataById(id) {
//     return new Promise((resolve, reject) => {
//       MasterData.find({ _id: id })
//         .then((masterData) => {
//           if (masterData) {
//             resolve({
//               masterData,
//               message: "Successfully retrived user informations :)",
//             });
//           } else {
//             reject({ message: "Unable to retrive owner info :(" });
//           }
//         })
//         .catch((error) => {
//           reject(error);
//         });
//     });
//   }
// };

// const express = require("express");
// const router = express.Router();
// const masterController = require("../controller/challan-controller/master-data-controller");

// // Create master data
// router.put("/update-master-data/:id/:type", (req, res) => {
//   masterController
//     .createMasterIndependentData(req)
//     .then((data) => {
//       res.status(201).send(data);
//     })
//     .catch((err) => {
//       res.status(400).send(err);
//     });
// });

// // Read master data  by id
// router.get("/get-master-datas-id", (req, res) => {
//   masterController
//     .createMasterData()
//     .then((data) => {
//       res.status(201).send(data);
//     })
//     .catch((err) => {
//       res.status(400).send(err);
//     });
// });

// router.get("/get-master-data", (req, res) => {
//   masterController
//     .getAllMasterData()
//     .then((data) => {
//       res.status(201).send(data);
//     })
//     .catch((err) => {
//       res.status(400).send(err);
//     });
// });

// // Read master data by id
// router.get("/get-master-data/:id", (req, res) => {
//   masterController
//     .findMasterDataById(req.params.id)
//     .then((data) => {
//       res.status(201).send(data);
//     })
//     .catch((err) => {
//       res.status(400).send(err);
// //     });
// // });

// // module.exports = router;

// static async createCashBookEntry(requestObject) {
//     try {
//       if (this.booleanChecks(requestObject)) {
//         const { entryISODate, monthISODate, isEntryValid } = this.isValidEntryDate(entryDate);
//         if (isEntryValid) {
//           let ledgerData = null;
//           let monthData;
//           Months.find({ monthDetails: monthISODate }).then((monthExists) => {
//             if (monthExists) {
//               ledgerData = await this.cashBookEntry(requestObject, entryISODate);
//             } else {
//               ledgerData = await this.cashBookEntry(requestObject, entryISODate);
//               monthData = await this.createNewMonth(monthISODate);
//             }
//             return resolve({ ledgerData, monthData, message: "Ledger Data has been successfully created" })
//           });
//         } else {
//           return Promise.reject({
//             message: "Invalid cash book creation request.",
//           });
//         }
//       } else {
//         return Promise.reject({
//           message: "Invalid cash book creation request.",
//         });
//       }
//     } catch (error) {
//       return Promise.reject({ error, message: "Something went wrong" });
//     }
//   }
// const CashBook = require("../../data-models/accounting-models/cash-book-model");
// // const Months = require("../../data-models/accounting-models/transaction-month-model");

// module.exports = class CashBookController {
//   static async createCashBookEntry(requestObject) {
//     try {
//       if (this.booleanChecks(requestObject)) {
//         const { entryISODate, monthISODate, isEntryValid } = this.isValidEntryDate(entryDate);
//         if (isEntryValid) {
//           const { entryDate, debit, credit, narration } = requestObject;
//           const objectModel = {
//             entryDate,
//             entryISODate,
//             debit,
//             credit,
//             narration,
//           };
//           const _CashBook = new CashBook(objectModel);
//           return _CashBook
//             .save()
//             .then((cashBook) => {
//               if (cashBook) {
//                 return resolve({ cashBook, message: "Cash book created" });
//               }
//             })
//             .catch((error) => {
//               return reject({ error, message: "Cash book not created" });
//             });

//         } else {
//           return Promise.reject({
//             message: "Invalid cash book creation request.",
//           });
//         }
//       } else {
//         return Promise.reject({
//           message: "Invalid cash book creation request.",
//         });
//       }
//     } catch (error) {
//       return Promise.reject({ error, message: "Something went wrong" });
//     }
//   }

//   static createNewMonth(newMonth) {
//     try {
//       return new Promise(async (resolve, reject) => {
//         const _month = new Months({ monthDetails: newMonth });
//         return _month
//           .save()
//           .then((mnt) => {
//             if (mnt) {
//               return resolve({ monthDetails: mnt, message: "Month created" });
//             }
//           })
//           .catch((error) => {
//             return reject({ error, message: "Month not created" });
//           });
//       });
//     } catch (error) {
//       return Promise.reject({ error, message: "Month not created" });
//     }
//   }

//   static ifYearFirstEntry(){
//     try {
//       return new Promise(async (resolve, reject) => {
//         const _month = new Months({ monthDetails: newMonth });
//         return _month
//           .save()
//           .then((mnt) => {
//             if (mnt) {
//               return resolve({ monthDetails: mnt, message: "Month created" });
//             }
//           })
//           .catch((error) => {
//             return reject({ error, message: "Month not created" });
//           });
//       });
//     } catch (error) {
//       return Promise.reject({ error, message: "Month not created" });
//     }
//   }

//   static async cashBookEntry(requestObject, entryISODate) {
//     try {
//       return new Promise(async (resolve, reject) => {
//         const { entryDate, debit, credit, narration } = requestObject;
//         const objectModel = {
//           entryDate,
//           entryISODate,
//           debit,
//           credit,
//           narration,
//         };
//         const _CashBook = new CashBook(objectModel);
//         return _CashBook
//           .save()
//           .then((cashBook) => {
//             if (cashBook) {
//               return resolve({ cashBook, message: "Cash book created" });
//             }
//           })
//           .catch((error) => {
//             return reject({ error, message: "Cash book not created" });
//           });
//       });
//     } catch (error) {
//       return Promise.reject({ error, message: "something went wrong" });
//     }
//   }

//   static updateCashBookEntry(requestObject) {
//     const { body, params } = requestObject;
//     return new Promise((resolve, reject) => {
//       if (this.booleanChecks(body)) {
//         const { entryDate } = body;
//         const updateObject = {
//           ...body,
//           entryISODate: entryDate ? this.convertToISODate(entryDate) : null,
//           modifiedAt: Date.now(),
//         };
//         CashBook.updateOne({ _id: params.id }, { $set: updateObject })
//           .then((cashBook) => {
//             if (cashBook) {
//               resolve({ cashBook, message: "Updated cash book entry" });
//             } else {
//               reject({ message: "Unable to update cash book entry" });
//             }
//           })
//           .catch((error) => {
//             reject({ error, message: "Unable to update cash book entry" });
//           });
//       } else {
//         reject({ message: "Invalid cash book entry." });
//       }
//     });
//   }

//   static async getCashBookByMonth(requestObject) {
//     try {
//       const cashBookEntries = await this.monthlyCashBook(requestObject);
//       const previousMonthData = await this.previousMonthCashBook(requestObject);
//       const totalCalculations = await this.getYearTotalBalance(requestObject);
//       const amounts = this.amountCalculation(
//         cashBookEntries,
//         previousMonthData,
//         totalCalculations
//       );
//       if (amounts) {
//         return Promise.resolve({
//           cashBookEntries,
//           amounts,
//           message: "Retreived all the cash book data",
//         });
//       } else {
//         return Promise.reject({
//           error: "Something went wront with ledger retreival",
//         });
//       }
//     } catch (error) {
//       return Promise.reject({ error });
//     }
//   }

//   static monthlyCashBook(requestObject) {
//     return new Promise((resolve, reject) => {
//       const { entryYear, entryMonth } = requestObject;
//       CashBook.aggregate([
//         {
//           $project: {
//             entryDate: 1,
//             debit: 1,
//             credit: 1,
//             narration: 1,
//             entryISODate: 1,
//             year: { $year: "$entryISODate" },
//             month: { $month: "$entryISODate" },
//           },
//         },
//         {
//           $match: {
//             year: Number(entryYear),
//             month: Number(entryMonth),
//           },
//         },
//         { $sort: { entryISODate: -1 } },
//       ])
//         .then((cashBookEntries) => {
//           resolve(cashBookEntries);
//         })
//         .catch((error) => {
//           reject({
//             error,
//             message: "Unable to fetch cash book entries for this month",
//           });
//         });
//     });
//   }

//   static previousMonthCashBook(requestObject) {
//     return new Promise((resolve, reject) => {
//       const { entryYear, entryMonth } = requestObject;

//       CashBook.aggregate([
//         {
//           $project: {
//             credit: 1,
//             debit: 1,
//             year: { $year: "$entryISODate" },
//             month: { $month: "$entryISODate" },
//           },
//         },
//         {
//           $match: {
//             year: Number(entryYear),
//             month: Number(entryMonth) - 1,
//           },
//         },
//         {
//           $group: {
//             _id: null,
//             previousMonthTotalDebit: { $sum: "$debit" },
//             previousMonthTotalCredit: { $sum: "$credit" },
//             previousMonthOutstandingAmount: {
//               $sum: { $subtract: ["$credit", "$debit"] },
//             },
//           },
//         },
//       ])
//         .then((previousMonthData) => {
//           resolve({ previousMonthData });
//         })
//         .catch((error) => {
//           reject({
//             error,
//             message: "Unable to previous month data",
//           });
//         });
//     });
//   }

//   static getYearTotalBalance(requestObject) {
//     return new Promise((resolve, reject) => {
//       const { entryYear } = requestObject;
//       CashBook.aggregate([
//         { $project: { debit: 1, credit: 1, year: { $year: "$entryISODate" } } },
//         { $match: { year: Number(entryYear) } },
//         {
//           $group: {
//             _id: null,
//             totalDebit: { $sum: "$debit" },
//             totalCredit: { $sum: "$credit" },
//             outstandingAmount: { $sum: { $subtract: ["$credit", "$debit"] } },
//           },
//         },
//       ])
//         .then((totalBalance) => {
//           resolve({
//             totalBalance,
//             message: "Fetched overall outstanding values",
//           });
//         })
//         .catch((error) => {
//           reject({
//             error,
//             message: "Unable to fetch cash book entries",
//           });
//         });
//     });
//   }

//   static deleteCashBookEntry(id) {
//     return new Promise((resolve, reject) => {
//       CashBook.deleteOne({ _id: id })
//         .then((cashBook) => {
//           if (cashBook) {
//             resolve({ cashBook, message: "Deleted cash book entry" });
//           }
//         })
//         .catch((error) => {
//           reject({ error, message: "Unable to delete cash book" });
//         });
//     });
//   }

//   static amountCalculation(cashBookEntries, previousMonthDetails, total) {
//     try {
//       const { previousMonthData } = previousMonthDetails;
//       const { totalBalance } = total;
//       let monthlyTotalDebit = 0;
//       let monthlyTotalCredit = 0;
//       let monthlyOutstanding = 0;
//       if (this.notNull(cashBookEntries)) {
//         monthlyTotalDebit = cashBookEntries
//           .map((item) => item.debit)
//           .reduce((prev, curr) => prev + curr, 0);
//         monthlyTotalCredit = cashBookEntries
//           .map((item) => item.credit)
//           .reduce((prev, curr) => prev + curr, 0);
//         monthlyOutstanding = monthlyTotalCredit - monthlyTotalDebit;
//       }

//       const {
//         previousMonthTotalDebit,
//         previousMonthTotalCredit,
//         previousMonthOutstandingAmount,
//       } = this.notNull(previousMonthData) ? previousMonthData[0] : {};
//       const { totalDebit, totalCredit, outstandingAmount } = this.notNull(
//         totalBalance
//       )
//         ? totalBalance[0]
//         : {};
//       const pTotalDebit = previousMonthTotalDebit || 0;
//       const pTotalCredit = previousMonthTotalCredit || 0;
//       const pAmount = previousMonthOutstandingAmount || 0;

//       const amt = Number(pAmount);
//       const mTotalDebit =
//         amt < 0
//           ? Number(monthlyTotalDebit) + Math.abs(amt)
//           : Number(monthlyTotalDebit);
//       const mTotalCredit =
//         amt > 0
//           ? Number(monthlyTotalCredit) + Math.abs(amt)
//           : Number(monthlyTotalCredit);
//       const mAmount = mTotalCredit - mTotalDebit;

//       return {
//         monthlyTotalDebit: this.roundUpNumbers(mTotalDebit),
//         monthlyTotalCredit: this.roundUpNumbers(mTotalCredit),
//         monthlyOutstanding: this.roundUpNumbers(mAmount),
//         previousMonthTotalDebit: this.roundUpNumbers(pTotalDebit),
//         previousMonthTotalCredit: this.roundUpNumbers(pTotalCredit),
//         previousMonthOutstandingAmount: this.roundUpNumbers(pAmount),
//         totalDebit: this.roundUpNumbers(totalDebit),
//         totalCredit: this.roundUpNumbers(totalCredit),
//         outstandingAmount: this.roundUpNumbers(outstandingAmount),
//       };
//     } catch (error) {
//       console.log(error);
//       return null;
//     }
//   }

//   static notNull(val) {
//     return (
//       val !== null && val !== undefined && Array.isArray(val) && val.length > 0
//     );
//   }

//   static roundUpNumbers(num) {
//     if (num) {
//       const val = num.toFixed(2);
//       return val;
//     }
//     return "00.00";
//   }

//   static booleanChecks(body) {
//     const { entryDate, debit, credit, narration } = body;
//     const initialTest =
//       entryDate &&
//       debit !== null &&
//       debit !== undefined &&
//       credit !== undefined &&
//       credit !== null &&
//       narration;
//     const amtCheck = (debit === 0 && credit > 0) || (credit === 0 && debit > 0);
//     return initialTest && amtCheck;
//   }

//   static earlyMonthDate(data) {
//     if (data && data.includes("/")) {
//       const date = data.split("/");
//       const year = Number(date[2]);
//       const month = Number(date[1]);
//       const dateObject = new Date(year, month, 1);
//       const finalDate = dateObject ? dateObject.toISOString() : null;
//       return finalDate;
//     }
//   }

//   static isValidEntryDate(data) {
//     if (data && data.includes("/")) {
//       const dt = new Date();
//       const date = data.split("/");
//       const firstDate = 1;
//       const april = 3;
//       const year = Number(date[2]);
//       const month = Number(date[1]) - 1;
//       const day = Number(date[0])
//       const dateObject = new Date(year, month, firstDate);
//       const entryDate = new Date(year, month, day);
//       const beginDate = new Date(dt.getFullYear(), april, firstDate);
//       const endDate = new Date(dt.getFullYear(), dt.getMonth() + 1, firstDate);
//       const isEntryValid = entryDate >= beginDate && entryDate < endDate;
//       const monthISODate = dateObject ? dateObject.toISOString() : null;
//       const entryISODate = entryDate ? entryDate.toISOString() : null;
//       return { entryISODate, monthISODate, isEntryValid };
//     } else {
//       return null;
//     }
//   }

//   static convertToISODate(data) {
//     const date = data.split("/");
//     const dateObject = new Date(
//       parseInt(date[2]),
//       parseInt(date[1]) - 1,
//       parseInt(date[0])
//     );
//     const finalDate = dateObject ? dateObject.toISOString() : null;
//     return finalDate;
//   }
// };
// {
//   $project:
//   {
//     monthISODate: 1,
//     description: 1,
//     nearest_month: {
//       // $abs: [{ $subtract: ["$monthISODate", new Date(monthISODate)] }],
//       $lt: new Date(monthISODate)
//     }
//   }
// },

// static dataMigration() {
//   try {
//     return new Promise((resolve, reject) => {
//       Challan.find({})
//         .select({ _id: 0, createdAt: 0, modifiedAt: 0, __v: 0 })
//         .lean()
//         .then((challans) => {
//           if (challans && Array.isArray(challans)) {
//             const newArray = challans.map(async (ch) => {
//               const { vehicleNumber: vn, grDate, invoiceDate } = ch;
//               let obj = {};
//               let grISODate;
//               let invoiceISODate;
//               if (grDate) {
//                 grISODate = await this.convertToISODate(grDate);
//               }

//               if (invoiceDate) {
//                 invoiceISODate = await this.convertToISODate(invoiceDate);
//               }

//               await Vehicle.find(
//                 { registrationNumber: vn },
//                 { _id: 1, accountId: 1 }
//               )
//                 .populate("ownerId")
//                 .select({ name: 1, phoneNumber: 1, _id: 1 })
//                 .lean()
//                 .then((vch) => {
//                   if (vch) {
//                     const {
//                       ownerId: ow,
//                       _id: vehicleId,
//                       accountId: vehicleBank,
//                     } = vch[0];
//                     const {
//                       name: ownerName,
//                       phoneNumber: ownerPhone,
//                       _id: ownerId,
//                     } = ow;
//                     obj = {
//                       ...ch,
//                       grISODate,
//                       invoiceISODate,
//                       vehicleId,
//                       vehicleBank,
//                       ownerName,
//                       ownerPhone,
//                       ownerId,
//                     };
//                     console.log(obj, "kk");
//                     const _nw = new Challan(obj);
//                     return _nw.save();
//                   }
//                 });
//               return obj;
//             });
//             console.log(newArray, "lll");
//           }
//         });
//     }).catch((error) => {
//       return reject({
//         error,
//         message: "Unable to fetch vouchers total amount",
//       });
//     });
//   } catch (error) {
//     return Promise.reject({ error, message: "Something went wrong" });
//   }
// }

// static findNearestMonth(requestObject) {
//     return new Promise((resolve, reject) => {
//       const { entryYear, entryMonth } = requestObject;
//       const monthDate = moment(`01/${entryMonth}/${entryYear}`, "DD/MM/YYYY");
//       const monthISODate = monthDate.format("YYYY-MM-DD") + "T00:00:00.000Z";
//       CashBook.aggregate([
//         {
//           $match: {
//             monthISODate: {
//               $lt: new Date(monthISODate),
//             },
//           },
//         },
//         { $sort: { monthISODate: -1 } },
//         { $limit: 1 },
//         {
//           $project: {
//             _id: 0,
//             monthISODate: 1,
//             year: { $year: "$monthISODate" },
//             month: { $month: "$monthISODate" },
//           },
//         },
//       ])
//         .then(async (data) => {
//           if (data && Array.isArray(data) && data.length > 0) {
//             const [dt] = data;
//             const { year, month } = dt;
//             const response = await this.previousMonthCashBook(year, month)
//             resolve(response);
//           }
//           else {
//             resolve(data)
//           }
//         })
//         .catch((error) => {
//           reject({
//             error,
//             message: "Unable to previous month data",
//           });
//         });
//     });
//   }

// // Read cash book data
// router.get("/get-cash-book-outstanding-details", (req, res) => {
//   cashBookController
//     .getCashBookOutstandingDetails()
//     .then((data) => {
//       res.status(201).send(data);
//     })
//     .catch((err) => {
//       res.status(400).send(err);
//     });
// });

// // Delete voucher data by id
// router.get("/test/:entryMonth/:entryYear", (req, res) => {
//   cashBookController
//     .findNearestMonth(req.params)
//     .then((data) => {
//       res.status(201).send(data);
//     })
//     .catch((err) => {
//       res.status(400).send(err);
//     });
// });

// static getYearTotalBalance(requestObject) {
//     return new Promise((resolve, reject) => {
//       const { entryYear } = requestObject;
//       const { yearBegin, yearEnd } = this.getFinancialYearDates(entryYear);
//       CashBook.aggregate([
//         { $project: { debit: 1, credit: 1, entryISODate: 1 } },
//         {
//           $match: {
//             entryISODate: {
//               $gte: new Date(yearBegin),
//               $lte: new Date(yearEnd),
//             },
//           },
//         },
//         {
//           $group: {
//             _id: null,
//             totalDebit: { $sum: "$debit" },
//             totalCredit: { $sum: "$credit" },
//             outstandingAmount: { $sum: { $subtract: ["$credit", "$debit"] } },
//           },
//         },
//       ])
//         .then((totalBalance) => {
//           resolve({
//             totalBalance,
//             message: "Fetched overall outstanding values",
//           });
//         })
//         .catch((error) => {
//           reject({
//             error,
//             message: "Unable to fetch cash book entries",
//           });
//         });
//     });
//   }

// static async assignRoleToUser(role) {
//     try {
//       const roleDetails = await Role.find({ roleName: role }, { _id: 1 }).then(
//         (data) => {
//           return data;
//         }
//       );
//       const { _id } =
//         roleDetails && roleDetails.length > 0 ? roleDetails[0] : {};
//       return _id;
//     } catch (err) {
//       console.error(err);
//       return null;
//     }
//   }
// static async createRole(req) {
//     try {
//       const secretKey = req.secretKey || "";
//       const isTrue = await bcrypt.compare(process.env.S_KEY, secretKey);
//       if (isTrue) {
//         const role = new Role(req);
//         return role.save();
//       } else {
//         return Promise.reject({ message: "Unauthorized access !!!!" });
//       }
//     } catch (err) {
//       console.error(err);
//     }
//   }
// router.post("/create-role", (req, res) => {
//     userController
//       .createRole(req.body)
//       .then((data) => {
//         res.status(201).send(data);
//       })
//       .catch((err) => {
//         res.status(400).send(err);
//       });
//   });