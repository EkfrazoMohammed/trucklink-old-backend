const CashBook = require("../../data-models/accounting-models/cash-book-model");
const moment = require("moment");

module.exports = class CashBookController {
  static async createCashBookEntry(requestObject) {
    try {
      return new Promise((resolve, reject) => {
        if (this.booleanChecks(requestObject)) {
          const { entryDate, debit, credit, narration } = requestObject;
          const { entryISODate, monthISODate } = this.retreiveISODate(
            entryDate
          );
          const objectModel = {
            entryDate,
            entryISODate,
            monthISODate,
            debit,
            credit,
            narration,
          };
          const _CashBook = new CashBook(objectModel);
          return _CashBook
            .save()
            .then((cashBook) => {
              if (cashBook) {
                return resolve({ cashBook, message: "Cash book created" });
              }
            })
            .catch((error) => {
              return reject({ error, message: "Cash book not created" });
            });
        } else {
          return reject({ message: "Invalid cash book creation request." });
        }
      }).catch((error) => this.rejectPromise(error));
    } catch (error) {
      this.rejectPromise(error);
    }
  }

  static updateCashBookEntry(requestObject) {
    try {
      const { body, params } = requestObject;
      return new Promise((resolve, reject) => {
        if (this.booleanChecks(body)) {
          const { entryDate, debit, credit, narration } = body;
          const { entryISODate, monthISODate } = this.retreiveISODate(
            entryDate
          );
          const updateObject = {
            entryDate,
            entryISODate,
            monthISODate,
            debit,
            credit,
            narration,
            modifiedAt: Date.now(),
          };
          CashBook.updateOne({ _id: params.id }, { $set: updateObject })
            .then((cashBook) => {
              if (cashBook) {
                resolve({ cashBook, message: "Updated cash book entry" });
              }
            })
            .catch((error) => {
              reject({ error, message: "Unable to update cash book entry" });
            });
        } else {
          reject({ message: "Invalid cash book entry." });
        }
      });
    } catch (error) {
      this.rejectPromise(error);
    }
  }

  static async getCashBookByMonth(requestObject) {
    try {
      const cashBookEntries = await this.monthlyCashBook(requestObject);
      const previousMonthData = await this.previousMonthCashBook(requestObject);
      const amounts = this.amountCalculation(
        cashBookEntries,
        previousMonthData);
      if (amounts) {
        return Promise.resolve({
          cashBookEntries,
          amounts,
          message: "Retreived all the cash book data",
        });
      } else {
        return Promise.reject({
          error: "Something went wront with ledger retreival",
        });
      }
    } catch (error) {
      return Promise.reject({ error });
    }
  }

  static monthlyCashBook(requestObject) {
    return new Promise((resolve, reject) => {
      const { entryYear, entryMonth } = requestObject;
      CashBook.aggregate([
        {
          $project: {
            entryDate: 1,
            debit: 1,
            credit: 1,
            narration: 1,
            entryISODate: 1,
            year: { $year: "$entryISODate" },
            month: { $month: "$entryISODate" },
          },
        },
        {
          $match: {
            year: Number(entryYear),
            month: Number(entryMonth),
          },
        },
        { $sort: { entryISODate: -1 } },
      ])
        .then((cashBookEntries) => {
          resolve(cashBookEntries);
        })
        .catch((error) => {
          reject({
            error,
            message: "Unable to fetch cash book entries for this month",
          });
        });
    });
  }

  static previousMonthCashBook(requestObject) {
    return new Promise((resolve, reject) => {
      const { entryYear, entryMonth } = requestObject;
      const monthDate = moment(`01/${entryMonth}/${entryYear}`, "DD/MM/YYYY");
      const monthISODate = monthDate.format("YYYY-MM-DD") + "T00:00:00.000Z";
      CashBook.aggregate([
        {
          $match: {
            monthISODate: {
              $lt: new Date(monthISODate),
            },
          },
        },
        {
          $group: {
            _id: null,
            previousMonthTotalDebit: { $sum: "$debit" },
            previousMonthTotalCredit: { $sum: "$credit" },
            previousMonthOutstandingAmount: {
              $sum: { $subtract: ["$credit", "$debit"] },
            }
          },
        },
      ])
        .then((previousMonthData) => {
          resolve({ previousMonthData });
        })
        .catch((error) => {
          reject({
            error,
            message: "Unable to previous month data",
          });
        })
    });
  }

  static amountCalculation(cashBookEntries, previousMonthDetails) {
    try {
      const { previousMonthData } = previousMonthDetails;
      let monthlyTotalDebit = 0;
      let monthlyTotalCredit = 0;
      if (this.notNull(cashBookEntries)) {
        monthlyTotalDebit = cashBookEntries
          .map((item) => item.debit)
          .reduce((prev, curr) => prev + curr, 0);
        monthlyTotalCredit = cashBookEntries
          .map((item) => item.credit)
          .reduce((prev, curr) => prev + curr, 0);
      }

      const {
        previousMonthTotalDebit,
        previousMonthTotalCredit,
        previousMonthOutstandingAmount,
        // pMonth
      } = this.notNull(previousMonthData) ? previousMonthData[0] : {};
      const pTotalDebit = previousMonthTotalDebit || 0;
      const pTotalCredit = previousMonthTotalCredit || 0;
      const pAmount = previousMonthOutstandingAmount || 0;

      const amt = Number(pAmount);
      const mTotalDebit =
        amt < 0
          ? Number(monthlyTotalDebit) + Math.abs(amt)
          : Number(monthlyTotalDebit);
      const mTotalCredit =
        amt > 0
          ? Number(monthlyTotalCredit) + Math.abs(amt)
          : Number(monthlyTotalCredit);
      const mAmount = mTotalCredit - mTotalDebit;

      return {
        monthlyTotalDebit: this.roundUpNumbers(mTotalDebit),
        monthlyTotalCredit: this.roundUpNumbers(mTotalCredit),
        monthlyOutstanding: this.roundUpNumbers(mAmount),
        previousMonthTotalDebit: this.roundUpNumbers(pTotalDebit),
        previousMonthTotalCredit: this.roundUpNumbers(pTotalCredit),
        previousMonthOutstandingAmount: this.roundUpNumbers(pAmount),
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

  static rejectPromise(error) {
    return Promise.reject({ error, message: "Unable to create cash book." });
  }

  static getFinancialYearDates(yr) {
    const year = Number(yr);
    const startDate = `01/04/${year}`;
    const endDate = `31/03/${year + 1}`;
    const st = moment(startDate, "DD/MM/YYYY");
    const yearBegin = st.format("YYYY-MM-DD") + "T00:00:00.000Z";
    const et = moment(endDate, "DD/MM/YYYY");
    const yearEnd = et.format("YYYY-MM-DD") + "T00:00:00.000Z";
    return { yearBegin, yearEnd };
  }

  static retreiveISODate(data) {
    if (data && data.includes("/")) {
      const firstDate = "01";
      const date = data.split("/");
      const [day, month, year] = date;
      const entryDate = moment(data, "DD/MM/YYYY");
      const entryISODate = entryDate.format("YYYY-MM-DD") + "T00:00:00.000Z";
      const monthDate = moment(
        `${firstDate} / ${month} / ${year}`,
        "DD/MM/YYYY"
      );
      const monthISODate = monthDate.format("YYYY-MM-DD") + "T00:00:00.000Z";
      return { entryISODate, monthISODate };
    }
  }

  static deleteCashBookEntry(id) {
    return new Promise((resolve, reject) => {
      CashBook.deleteOne({ _id: id })
        .then((cashBook) => {
          if (cashBook) {
            resolve({ cashBook, message: "Deleted cash book entry" });
          }
        })
        .catch((error) => {
          reject({ error, message: "Unable to delete cash book" });
        });
    });
  }
};
