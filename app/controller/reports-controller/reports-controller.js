const moment = require("moment");
var qs = require("qs");
const Challan = require("../../data-models/dispatch-to-ledger-models/challan-model");
const Voucher = require("../../data-models/accounting-models/voucher-model");
const OwnerAdavance = require("../../data-models/accounting-models/owner-advance-model");
const OwnerTransferLog = require("../../data-models/onboarding-data-models/ownership-transfer-log-model");

module.exports = class OwnerController {
  static async getTripRegisterAggregates(requestObject, req) {
    const { params } = req;

    try {
      let obj = {};

      const { material, vehicle, startDate, endDate } = requestObject;
      console.log(material);
      if (vehicle) {
        obj.vehicleType = vehicle;
      }
      if (material) {
        const str = req.originalUrl.split("?").pop();
        const plainString = decodeURIComponent(str);
        const material1 = plainString.substring(
          plainString.indexOf("=(") + 2,
          plainString.indexOf(")")
        );
        if (plainString && plainString !== "") {
          obj.materialType = material1;
        }
      }

      let dateQuery = {};
      if (startDate && endDate) {
        const st = this.convertTimestampToDate(startDate);
        const et = this.convertTimestampToDate(endDate);
        dateQuery = {
          $and: [
            {
              $gte: [
                {
                  $dateFromString: {
                    dateString: "$grDate",
                    format: "%d/%m/%Y",
                  },
                },
                new Date(st),
              ],
            },
            {
              $lte: [
                {
                  $dateFromString: {
                    dateString: "$grDate",
                    format: "%d/%m/%Y",
                  },
                },
                new Date(et),
              ],
            },
          ],
        };
      } else if (startDate) {
        const st = this.convertTimestampToDate(startDate);
        dateQuery = {
          $and: [
            {
              $gte: [
                {
                  $dateFromString: {
                    dateString: "$grDate",
                    format: "%d/%m/%Y",
                  },
                },
                new Date(st),
              ],
            },
          ],
        };
      } else if (endDate) {
        const et = this.convertTimestampToDate(endDate);
        dateQuery = {
          $and: [
            {
              $lte: [
                {
                  $dateFromString: {
                    dateString: "$grDate",
                    format: "%d/%m/%Y",
                  },
                },
                new Date(et),
              ],
            },
          ],
        };
      }

      return new Promise((resolve, reject) => {
        Challan.aggregate([
          { $match: { $and: [{ ownerId: params.id }] } },
          { $match: { $or: [obj] } },
          { $match: { $expr: dateQuery } },
          {
            $project: {
              quantityInMetricTons: 1,
              rate: 1,
              materialType: 1,
              vehicleType: 1,
              commisionTotal: 1,
              commisionRate: 1,
              shortage: 1,
              diesel: 1,
              cash: 1,
              bankTransfer: 1,
              invoiceDate: 1,
              deliveryLocation: 1,
              vehicleNumber: 1,
              deliveryNumber: 1,
              invoiceISODate: 1,
              vehicleId: 1,
              amount: { $multiply: ["$quantityInMetricTons", "$rate"] },
            },
          },
          {
            $group: {
              _id: null,
              tripDetails: {
                $addToSet: {
                  invoiceDate: "$invoiceDate",
                  deliveryLocation: "$deliveryLocation",
                  vehicleNumber: "$vehicleNumber",
                  vehicleId: "$vehicleId",
                  deliveryNumber: "$deliveryNumber",
                  quantityInMetricTons: "$quantityInMetricTons",
                  materialType: "$materialType",
                  vehicleType: "$vehicleType",
                  ratePerTon: "$rate",
                  commisionRate: "$commisionRate",
                  commisionTotal: "$commisionTotal",
                  shortage: "$shortage",
                  diesel: "$diesel",
                  cash: "$cash",
                  bankTransfer: "$bankTransfer",
                  invoiceISODate: "$invoiceISODate",
                  amount: "$amount",
                },
              },
              totalQuantity: { $sum: "$quantityInMetricTons" },
              totalAmount: { $sum: "$amount" },
              totalCommisionTotal: { $sum: "$commisionTotal" },
              totalShortage: { $sum: "$shortage" },
              totalDiesel: { $sum: "$diesel" },
              totalCash: { $sum: "$cash" },
              totalBankTransfer: { $sum: "$bankTransfer" },
            },
          },
        ])
          .then((tripAggregate) => {
            let demo = [];
            let demoall;
            let demoNull = [];
            let valuss = [];
            let tripAll;
            let totalCount;
            tripAggregate.forEach((data) => {
              data.tripDetails.map((result) => {
                if (result.invoiceISODate) {
                  demo.push(result);
                } else {
                  demoNull.push(result);
                }
              });
              let tripDetailsDate = demo.sort(function (a, b) {
                return new Date(a.invoiceISODate) - new Date(b.invoiceISODate);
              });
              demoall = tripDetailsDate.concat(demoNull);
            });

            OwnerTransferLog.find({}).then((data) => {
              tripAll = demoall.map((e, index) => {
                const vehNo = data.filter(
                  (x) => x.vehicleNumber == e.vehicleNumber
                );
                if (vehNo && vehNo.length > 0) {
                  valuss.push({ ...e, OwnwerTransfer: "true" });
                } else {
                  valuss.push({ ...e, OwnwerTransfer: "false" });
                }
              });
              // tripss = valuss;
              let tripDetails = valuss;
              tripAggregate.map((result) => {
                totalCount = {
                  totalAmount: result.totalAmount,
                  totalDiesel: result.totalDiesel,
                  totalShortage: result.totalShortage,
                  totalBankTransfer: result.totalBankTransfer,
                  totalCash: result.totalCash,
                  totalQuantity: result.totalQuantity,
                  totalCommisionTotal: result.totalCommisionTotal,
                };
              });
              let {
                totalAmount,
                totalBankTransfer,
                totalCash,
                totalCommisionTotal,
                totalDiesel,
                totalQuantity,
                totalShortage,
              } = totalCount;
              let tripAggregates = [
                {
                  tripDetails,
                  totalAmount,
                  totalBankTransfer,
                  totalCash,
                  totalCommisionTotal,
                  totalDiesel,
                  totalQuantity,
                  totalShortage,
                },
              ];
              resolve({ tripAggregates, message: "Fetched trip totals" });
            });
          })
          .catch((error) => {
            reject({
              error,
              message: "Unable to fetch trip totals",
            });
          });
      }).catch((error) => {
        return reject({ error, message: "Unable to fetch trip totals" });
      });
    } catch (error) {
      return Promise.reject({ error, message: "Something went wrong" });
    }
  }

  static getOwnerLedgerData(requestObject) {
    const { query, params } = requestObject;

    const { startDate, endDate } = query;

    // let dateQuery = {};
    // if (startDate && endDate) {
    //   const st = this.convertTimestampToDate(startDate);
    //   const et = this.convertTimestampToDate(endDate);

    //   dateQuery = {
    //     $and: [
    //       {
    //         $gte: [
    //           { $dateFromString: { dateString: "$ledgerEntries.entryDate", format: "%d/%m/%Y" } },
    //           new Date(st)
    //         ]
    //       },
    //       {
    //         $lte: [
    //           { $dateFromString: { dateString: "$ledgerEntries.entryDate", format: "%d/%m/%Y" } },
    //           new Date(et)
    //         ]
    //       },
    //     ],
    //   }

    // }
    // else if (startDate) {
    //   const st = this.convertTimestampToDate(startDate);
    //   console.log(st)
    //   dateQuery = {
    //     $and: [
    //       {
    //         $gte: [
    //           { $dateFromString: { dateString: "$ledgerEntries.entryDate", format: "%d/%m/%Y" } },
    //           new Date(st)
    //         ]
    //       }
    //     ],
    //   };

    // } else if (endDate) {
    //   const et = this.convertTimestampToDate(endDate);

    //   dateQuery = {
    //     $and: [
    //       {
    //         $lte: [
    //           { $dateFromString: { dateString: "$ledgerEntries.entryDate", format: "%d/%m/%Y" } },
    //           new Date(et)
    //         ]
    //       }
    //     ],
    //   }
    // }

    return new Promise((resolve, reject) => {
      OwnerAdavance.aggregate([
        { $match: { ownerId: params.id } },
        { $unwind: "$ledgerEntries" },
        // { $match: { $expr: dateQuery } },
        {
          $group: {
            _id: null,
            outStandingAmount: {
              $sum: {
                $subtract: ["$ledgerEntries.credit", "$ledgerEntries.debit"],
              },
            },
            totalOutstandingDebit: {
              $sum: "$ledgerEntries.debit",
            },
            ledgerDetails: { $push: "$ledgerEntries" },
          },
        },
        { $sort: { "ownerDetails.initialISODate": -1 } },
      ])
        .then((ownersAdavances) => {
          if (ownersAdavances) {
            let ledgerEntrie = [];
            let ownerOutstanding = "";
            let totalOutstandingDebit;
            let totalDebitCount;
            ownersAdavances.forEach((data) => {
              let ledgerData = data.ledgerDetails.sort(function (a, b) {
                return new Date(a.entryISODate) - new Date(b.entryISODate);
              });
              ledgerData.map((result, index) => {
                if (index == "0") {
                  ownerOutstanding = result.credit;
                  const val = { ...result, ownerOutstanding };
                  ledgerEntrie.push(val);
                  // ledgerEntries.push(result, ownerOutstanding);
                } else {
                  if (result.debit != 0) {
                    ownerOutstanding = ownerOutstanding - result.debit;
                  }
                  if (result.credit != 0) {
                    ownerOutstanding = ownerOutstanding + result.credit;
                  }
                  const value = { ...result, ownerOutstanding };
                  ledgerEntrie.push(value);
                }
              });
            });

            let ledgerEntries = ledgerEntrie.reverse();
            totalDebitCount = ledgerEntries.reduce(
              (sum, val) => sum + +val.debit,
              0
            );

            let ledgerDetails;
            let BalanceDate = "";
            if (startDate || endDate) {
              const st = startDate && this.convertTimestampToDate(startDate);
              if (st) {
                let month = new Date(st).getMonth() + 1;
                if (month < 10) {
                  month = "0" + month;
                }
                BalanceDate = "01/" + month + "/" + new Date(st).getFullYear();
              }
              const et = endDate && this.convertTimestampToDate(endDate);
              ledgerDetails = ledgerEntries.filter((result) => {
                var dt = result.entryISODate;
                if (st && et) {
                  return (
                    moment(dt).isSameOrAfter(st) &&
                    moment(dt).isSameOrBefore(et)
                  );
                }
                if (st) {
                  return moment(dt).isSameOrAfter(st);
                }
                if (et) {
                  return moment(dt).isSameOrBefore(et);
                }
              });

              let detailData = ledgerDetails;
              let lastItem = detailData[detailData.length - 1];

              let lastEntryDate;
              if (lastItem) {
                lastEntryDate = lastItem.entryISODate;
              }
              let lastEntries = [];
              let ownerAdvancePrevious = null;
              ledgerEntries.map((Item) => {
                if (new Date(lastEntryDate) > new Date(Item.entryISODate)) {
                  lastEntries.push(Item);
                }
              });
              if (lastEntries && lastEntries.length > 0) {
                lastEntries.map((Values, index) => {
                  if (index == 0) {
                    ownerAdvancePrevious = Values.ownerOutstanding;
                  }
                });

                let PreviousBalance = {
                  debit: 0,
                  credit: ownerAdvancePrevious,
                  _id: "1000",
                  entryDate: BalanceDate,
                  narration: "Oustanding Amount",
                  entryISODate: "2020-07-16T00:00:00.000Z",
                  ownerOutstanding: 0,
                };
                ledgerDetails.push(PreviousBalance);
              }

              totalOutstandingDebit = ledgerDetails.reduce(
                (sum, val) => sum + +val.debit,
                0
              );

              let ownersAdavance = [
                {
                  outStandingAmount: ledgerDetails
                    ? ledgerDetails[0].ownerOutstanding
                    : "",
                  totalOutstandingDebit,
                  ledgerDetails,
                },
              ];

              resolve({
                ownersAdavance,
                message: "Fetched all owners ledger successfully",
              });
            } else {
              ledgerDetails = ledgerEntries;
              let ownersAdavance = [
                {
                  outStandingAmount: ledgerDetails[0].ownerOutstanding,
                  totalOutstandingDebit: totalDebitCount,
                  ledgerDetails,
                },
              ];
              resolve({
                ownersAdavance,
                message: "Fetched all owners ledger successfully",
              });
            }
          }
        })
        .catch((error) => {
          reject({
            error,
            message: "Unable to fetch owners advance",
          });
        });
    });
  }

  static getOwnerAdvnanceDetailedData() {
    return new Promise((resolve, reject) => {
      OwnerAdavance.aggregate([
        { $match: {} },
        { $unwind: "$ledgerEntries" },
        {
          $lookup: {
            from: "owners",
            localField: "ownerDetails",
            foreignField: "_id",
            as: "ownerDetails",
          },
        },
        {
          $group: {
            _id: "$_id",
            outStandingAmount: {
              $sum: {
                $subtract: ["$ledgerEntries.credit", "$ledgerEntries.debit"],
              },
            },
            ownerDetails: {
              $addToSet: {
                initailDate: "$initialDate",
                ownerName: "$ownerDetails.name",
              },
            },
            ledgerDetails: { $push: "$ledgerEntries" },
          },
        },
        { $sort: { "ledgerEntries.initialISODate": -1 } },
        {
          $group: {
            _id: null,
            totalOutstanding: { $sum: "$outStandingAmount" },
            advanceDetails: {
              $push: {
                ledger: "$ledgerDetails",
                ownerDetails: "$ownerDetails",
                amount: "$outStandingAmount",
              },
            },
          },
        },
      ])
        .then((ownersAdavance) => {
          if (ownersAdavance) {
            resolve({
              ownersAdavance,
              message: "Fetched all owners ledger  successfully",
            });
          }
        })
        .catch((error) => {
          reject({
            error,
            message: "Unable to fetch owners advance",
          });
        });
    });
  }

  static getVoucherDetailsByOwnerId(requestObject) {
    const { query, params } = requestObject;

    const { startDate, endDate, material, vehicle } = query;

    let obj = {};
    if (vehicle) {
      obj.vehicleType = vehicle;
    }
    if (material) {
      const str = req.originalUrl.split("?").pop();
      const plainString = decodeURIComponent(str);
      const material1 = plainString.substring(
        plainString.indexOf("=(") + 2,
        plainString.indexOf(")")
      );
      if (plainString && plainString !== "") {
        obj.materialType = material1;
      }
    }

    let dateQuery = {};
    if (startDate && endDate) {
      const st = this.convertTimestampToDate(startDate);
      const et = this.convertTimestampToDate(endDate);
      dateQuery = {
        $and: [
          {
            $gte: [
              {
                $dateFromString: {
                  dateString: "$voucherDate",
                  format: "%d/%m/%Y",
                },
              },
              new Date(st),
            ],
          },
          {
            $lte: [
              {
                $dateFromString: {
                  dateString: "$voucherDate",
                  format: "%d/%m/%Y",
                },
              },
              new Date(et),
            ],
          },
        ],
      };
    } else if (startDate) {
      const st = this.convertTimestampToDate(startDate);
      dateQuery = {
        $and: [
          {
            $gte: [
              {
                $dateFromString: {
                  dateString: "$voucherDate",
                  format: "%d/%m/%Y",
                },
              },
              new Date(st),
            ],
          },
        ],
      };
    } else if (endDate) {
      const et = this.convertTimestampToDate(endDate);
      dateQuery = {
        $and: [
          {
            $lte: [
              {
                $dateFromString: {
                  dateString: "$voucherDate",
                  format: "%d/%m/%Y",
                },
              },
              new Date(et),
            ],
          },
        ],
      };
    }
    return new Promise((resolve, reject) => {
      Voucher.aggregate([
        { $match: { ownerId: params.id } },
        { $match: { $and: [obj] } },
        { $match: { $expr: dateQuery } },
        { $sort: { voucherISODate: -1 } },
        {
          $group: {
            _id: null,
            total: {
              $sum: "$amount",
            },
            voucherDetails: {
              $addToSet: {
                voucherDate: "$voucherDate",
                narration: "$narration",
                amount: "$amount",
              },
            },
          },
        },
        { $sort: { voucherISODate: -1 } },
      ])
        .then((voucher) => {
          if (voucher) {
            resolve({
              voucher,
              message: "Fetched owners voucher details successfully!!",
            });
          }
        })
        .catch((error) => {
          reject({
            error,
            message: "Unable to fetch voucher",
          });
        });
    });
  }

  static getReportTableData(requestObject, req) {
    try {
      let obj = {};
      const { material, vehicle, startDate, endDate,page,limit } = requestObject;
      if (vehicle) {
        obj.vehicleType = vehicle;
      }

      if (material) {
        const str = req.originalUrl.split("?").pop();
        const plainString = decodeURIComponent(str);
        const material1 = plainString.substring(
          plainString.indexOf("=(") + 2,
          plainString.indexOf(")")
        );
        if (plainString && plainString !== "") {
          obj.materialType = material1;
        }
      }
      let dateQuery = {};
      if (startDate && endDate) {
        const st = this.convertTimestampToDate(startDate);
        const et = this.convertTimestampToDate(endDate);
        dateQuery = {
          $and: [
            {
              $gte: [
                {
                  $dateFromString: {
                    dateString: "$grDate",
                    format: "%d/%m/%Y",
                  },
                },
                new Date(st),
              ],
            },
            {
              $lte: [
                {
                  $dateFromString: {
                    dateString: "$grDate",
                    format: "%d/%m/%Y",
                  },
                },
                new Date(et),
              ],
            },
          ],
        };
      } else if (startDate) {
        const st = this.convertTimestampToDate(startDate);
        dateQuery = {
          $and: [
            {
              $gte: [
                {
                  $dateFromString: {
                    dateString: "$grDate",
                    format: "%d/%m/%Y",
                  },
                },
                new Date(st),
              ],
            },
          ],
        };
      } else if (endDate) {
        const et = this.convertTimestampToDate(endDate);
        dateQuery = {
          $and: [
            {
              $lte: [
                {
                  $dateFromString: {
                    dateString: "$grDate",
                    format: "%d/%m/%Y",
                  },
                },
                new Date(et),
              ],
            },
          ],
        };
      }

      const pageInput = parseInt(page) || 1;
      const limitInput = parseInt(limit) || 10;

      const skip = limitInput * pageInput - limitInput;

      return new Promise((resolve, reject) => {
        Challan.aggregate([
          { $match: { $and: [obj] } },
          { $match: { $expr: dateQuery } },
          { 
            "$match": {
                "ownerId": { 
                    "$exists": true, 
                    "$ne": null 
                }
            }    
        },
          {
            $group: {
              _id: "$ownerId",
              noOfTrips: { $sum: 1 },
              ownerDetails: {
                $addToSet: {
                  ownerName: "$ownerName",
                  ownerId: "$ownerId",
                  ownerPhone: "$ownerPhone",
                  grISODate: "$grISODate",
                  grDate: "$grDate",
                  materialType: "$materialType",
                },
              },
              totalQuantity: { $sum: "$quantityInMetricTons" },
              totalAmount: {
                $sum: { $multiply: ["$quantityInMetricTons", "$rate"] },
              },
              totalCommisionTotal: { $sum: "$commisionTotal" },
              totalShortage: { $sum: "$shortage" },
              totalDiesel: { $sum: "$diesel" },
              totalCash: { $sum: "$cash" },
              totalBankTransfer: { $sum: "$bankTransfer" },
            },
          },
          {$sort: {"ownerDetails.ownerName": 1 }}, 
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
          .then((tripAggregates) => {
            resolve({ tripAggregates, message: "Fetched trip totals" });
          })
          .catch((error) => {
            reject({
              error,
              message: "Unable to fetch trip totals",
            });
          });
      });
    } catch (error) {
      return Promise.reject({ error, message: "Something went wrong" });
    }
  }

  static convertTimestampToDate(dateString) {
    const dt = new Date(Number(dateString));
    const dateEntry = dt.toISOString().split("T")[0];
    const entryDate = moment(dateEntry, "YYYY-MM-DD");
    const entryISODate = entryDate.format("YYYY-MM-DD") + "T00:00:00.000Z";
    return entryISODate;
  }

  static convertToISODate(data) {
    if (data) {
      const entryDate = moment(data, "DD/MM/YYYY");
      const entryISODate = entryDate.format("YYYY-MM-DD") + "T00:00:00.000Z";
      return entryISODate;
    }
    return null;
  }
};
