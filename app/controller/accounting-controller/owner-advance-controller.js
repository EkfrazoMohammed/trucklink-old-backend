const OwnerAdavance = require("../../data-models/accounting-models/owner-advance-model");
const moment = require("moment");
const { compareSync } = require("bcrypt");
const ObjectId = require("mongoose").Types.ObjectId;

module.exports = class CashBookController {
  static createOwnerAdvance(requestObject) {
    try {
      return new Promise((resolve, reject) => {
        OwnerAdavance.findOne({ ownerId: requestObject.ownerId })
          .then((ownerId) => {
            if (ownerId) {
              return reject({
                message: "The record for this owner already exists",
              });
            } else {
              const {
                ownerId,
                ownerName,
                entryDate,
                credit,
                narration,
              } = requestObject;
              const dt = entryDate ? this.convertToISODate(entryDate) : null;
              const objectModel = {
                ownerId,
                ownerDetails: ownerId,
                ownerName,
                initialAmount: credit,
                initialDate: entryDate,
                initialISODate: dt,
                ledgerEntries: [
                  {
                    entryDate,
                    entryISODate: dt,
                    debit: 0,
                    credit,
                    narration
                  },
                ],
              };
              
              const _OwnerAdavance = new OwnerAdavance(objectModel);
              return _OwnerAdavance.save();
            }
          })
          .then((ownerAdavance) => {
            if (ownerAdavance) {
              return resolve({
                ownerAdavance,
                message: "Created a new ledger entry for Owner",
              });
            }
          })
          .catch((error) => {
            return reject({ error, message: "Ledger entry not created" });
          });
      });
    } catch (error) {
      return Promise.reject({ error, message: "Something went wrong" });
    }
  }

  static createOwnerLedgerEntry(requestObject) {
    try {
      const { body, params } = requestObject;
      return new Promise((resolve, reject) => {
        if (this.booleanChecks(body)) {
          const { entryDate } = body;
          const entryISODate = entryDate ? this.convertToISODate(entryDate) : null;
          const updateObject = {
            ...body,
            entryISODate,

          };
          OwnerAdavance.findById({ _id: params.id }).select({ ledgerEntries: 1 }).then((data) => {
            const firstDate = data.ledgerEntries[0].entryISODate
            if (firstDate) {
              if (new Date(firstDate) <= new Date(entryISODate)) {
                OwnerAdavance.updateOne(
                  { _id: params.id },
                  { $push: { ledgerEntries: updateObject }, $set: { initialDate: entryDate, initialISODate: entryDate ? this.convertToISODate(entryDate) : null } }
                )
                  .then((cashBook) => {
                    if (cashBook) {
                      OwnerAdavance.findById({ _id: params.id }).then((data) => {
                        let max = 0;
                        data.ledgerEntries.forEach((result) => {
                          max = Math.max(max, new Date(result.entryISODate).getTime());
                        })
                        let finalEntryDate = moment(max).format('DD/MM/YYYY');
                        
                        OwnerAdavance.findOneAndUpdate({ _id: params.id },
                          { $set: { initialDate: finalEntryDate, initialISODate: new Date(max) } })
                          .then((topResult) => {
                            if (topResult) {
                              resolve({ cashBook, message: "Updated ledger entry" });
                            } else {
                              reject({ message: "Unable to update Owner Advance entry" });
                            }
                          })
                      })
                    } else {
                      reject({ message: "Unable to update ledger entry" });
                    }
                  })
                  .catch((error) => {
                    reject({ error, message: "Unable to update ledger entry" });
                  });
              } else {
                reject({ message: "Date is less than vehicle advance issued date" });
              }
            } else {
              reject({ message: "Invalid entry" });
            }
          });
        } else {
          reject({ message: "Invalid ledger entry" });
        }
      });
    } catch (error) {
      return Promise.reject({ error, message: "Something went wrong" });
    }
  }


  static updateIndividualLedgerEntry(requestObject) {
    try {
      const { body, params } = requestObject;

      return new Promise((resolve, reject) => {

        if (this.booleanChecks(body)) {
          const { entryDate } = body;
          const entryISODate = entryDate ? this.convertToISODate(entryDate) : null;
          const updateObject = {
            ...body,
            entryISODate: entryDate ? this.convertToISODate(entryDate) : null,
          };
          const { ownerId, ledgerId } = params;

          OwnerAdavance.findOneAndUpdate(
            { _id: ownerId, "ledgerEntries._id": ledgerId },
            { $set: { "ledgerEntries.$": updateObject, initialDate: entryDate, initialISODate: entryDate ? this.convertToISODate(entryDate) : null } }
          )
            .then((cashBook) => {
              if (cashBook) {
                OwnerAdavance.findById({ _id: ownerId }).then((data) => {
                  let max = 0;
                  data.ledgerEntries.forEach((result) => {
                    max = Math.max(max, new Date(result.entryISODate).getTime());
                  })
                  let finalEntryDate = moment(max).format('DD/MM/YYYY');
                  
                  OwnerAdavance.findOneAndUpdate({ _id: ownerId },
                    { $set: { initialDate: finalEntryDate, initialISODate: new Date(max) } })
                    .then((topResult) => {
                      if (topResult) {
                        resolve({ cashBook, message: "Updated ledger entry" });
                      } else {
                        reject({ message: "Unable to update Owner Advance entry" });
                      }
                    })
                })
              } else {
                reject({ message: "Unable to update ledger entry" });
              }
            })
            .catch((error) => {
              reject({ error, message: "Unable to update ledger entry" });
            });

          // OwnerAdavance.findById({ _id: ownerId }).select({ ledgerEntries: 1 })
          //   .then((result) => {
          // let max = 0;
          // result.ledgerEntries.forEach((result1) => {
          //   max = Math.max(max, new Date(result1.entryISODate).getTime());
          // })
          // console.log(max)

          // })

        } else {
          reject({ message: "Invalid ledger entry" });
        }
      });
    } catch (error) {
      return Promise.reject({ error, message: "Something went wrong" });
    }
  }



  static getOwnerAdvanceData() {
    return new Promise((resolve, reject) => {
      OwnerAdavance.find({}).populate("ownerDetails", "name")
        .then((ownersAdavance) => {
          if (ownersAdavance) {
            resolve({
              ownersAdavance,
              message: "Fetched all owners advance successfully",
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

  static fetchOwnerAdvanceData() {
    return new Promise((resolve, reject) => {
      OwnerAdavance.aggregate([
        { $match: {} },
        { $unwind: "$ledgerEntries" },
        {
          $lookup:
          {
            from: "owners",
            localField: "ownerDetails",
            foreignField: "_id",
            as: "ownerDetails"
          }
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
                ownerName: "$ownerDetails.name",
                ownerId: "$_id",
                initialDate: "$initialDate",
                initialISODate: "$initialISODate"
              },
            },
            // ledgerDetails: { $addToSet: "$ledgerEntries" }
          },
        },
        { $sort: { "ownerDetails.initialISODate": -1 } },
      ])
        .then((ownersAdavance) => {
          if (ownersAdavance) {
            resolve({
              ownersAdavance,
              message: "Fetched owners outstanding amount successfully",
            });
          }
        })
        .catch((error) => {
          reject({
            error,
            message: "Unable to fetch owners outstanding amount",
          });
        });
    });
  }

  static fetchOwnerLedgerData(id) {
    return new Promise((resolve, reject) => {
      OwnerAdavance.aggregate([
        { $match: { _id: new ObjectId(id) } },
        { $unwind: "$ledgerEntries" },
        { $sort: { "ledgerEntries.entryISODate": -1 } },
        {
          $group: {
            _id: null,
            ledgerEntries: { $push: "$ledgerEntries" },
            // ownerDetails: { $addToSet: { ownerId: "$_id", ownerName: "$ownerName" } }
          }
        },
        { $sort: { "ledgerEntries.entryISODate": -1 } }
      ])
        .then((ownersAdavances) => {
          if (ownersAdavances) {

            let ledgerEntrie = [];
            let ownerOutstanding = "";
            ownersAdavances.forEach((data) => {
              let ledgerData = data.ledgerEntries.sort(function (a, b) {
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

            // let ledgerEntries = ledgerEntrie.sort(function (a, b) {
            //   return new Date(b.entryISODate) - new Date(a.entryISODate);
            // });

            let ledgerEntries = ledgerEntrie.reverse();

            let ownersAdavance = [{
              ledgerEntries
            }]

            resolve({
              ownersAdavance,
              message: "Fetched all owners advance successfully",
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

  static getOwnersOutStandingAmount(id) {
    return new Promise((resolve, reject) => {
      const query = id ? { $match: { ownerId: id } } : { $match: {} };
      OwnerAdavance.aggregate([
        query,
        { $unwind: "$ledgerEntries" },
        {
          $group: {
            _id: "$_id",
            tDebit: { $sum: "$ledgerEntries.debit" },
            tCredit: { $sum: "$ledgerEntries.credit" },
            oAmount: {
              $sum: {
                $subtract: ["$ledgerEntries.credit", "$ledgerEntries.debit"],
              },
            },
          },
        },
        {
          $group: {
            _id: null,
            totalDebit: { $sum: "$tDebit" },
            totalCredit: { $sum: "$tCredit" },
            outStandingAmount: { $sum: "$oAmount" },
          },
        },
      ])
        .then((amountData) => {
          if (amountData) {
            resolve({
              amountData,
              message: "Fetched owners outstanding amount successfully",
            });
          }
        })
        .catch((error) => {
          reject({
            error,
            message: "Unable to fetch owners outstanding amount",
          });
        });
    });
  }

  static deleteOwnerLedger(ledgerId) {
    try {
      return new Promise((resolve, reject) => {
        OwnerAdavance.update(
          { "ledgerEntries._id": ledgerId },
          { $pull: { ledgerEntries: { _id: ledgerId } } },
          { safe: true }
        )
          .then((data) => {
            if (data) {
              resolve({ data, message: "Removed entry from owner ledger" });
            }
          })
          .catch((error) =>
            reject({ error, message: "Cannot remove entry from owner ledger" })
          );
      });
    } catch (error) {
      return Promise.reject({
        error,
        message: "Cannot remove entry from owner ledger",
      });
    }
  }

  static deleteOwner(id) {
    try {
      return new Promise((resolve, reject) => {
        OwnerAdavance.findByIdAndDelete(
          { _id: id }
        )
          .then((data) => {
            if (data) {
              resolve({ data, message: "Removed entry from owner ledger" });
            }
          })
          .catch((error) =>
            reject({ error, message: "Cannot remove entry from owner ledger" })
          );
      });
    } catch (error) {
      return Promise.reject({
        error,
        message: "Cannot remove entry from owner ledger",
      });
    }
  }

  static booleanChecks(body) {
    const { entryDate, debit, credit, narration } = body;
    const initialTest =
      entryDate &&
      debit !== null &&
      debit !== undefined &&
      credit !== undefined &&
      credit !== null &&
      narration;
    const amtCheck = (debit === 0 && credit > 0) || (credit === 0 && debit > 0);
    return initialTest && amtCheck;
  }

  static convertToISODate(data) {
    const entryDate = moment(data, "DD/MM/YYYY");
    const entryISODate = entryDate.format("YYYY-MM-DD") + "T00:00:00.000Z";
    return entryISODate;
  }
};
