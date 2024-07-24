const moment = require("moment");
const Challan = require("../../data-models/dispatch-to-ledger-models/challan-model");
const OwnerAdavance = require("../../data-models/accounting-models/owner-advance-model");

module.exports = class GetChallanController {


  static findAllDispatchChallansPrintData(requestObject) {
    return new Promise((resolve, reject) => {

      const { body, query } = requestObject;

      const obj = {};

      const { materialType, vehicleType, startDate, endDate, searchTDNo } = body;

      if (vehicleType) {
        obj.vehicleType = vehicleType;
      }


      if (materialType) {
        obj.materialType = materialType;
      }

      let dateQuery = {};

      if (startDate && endDate) {

        const st = this.convertTimestampToDate(startDate);
        const et = this.convertTimestampToDate(endDate);

        dateQuery = {
          $and: [
            {
              $gte: [
                { $dateFromString: { dateString: "$grDate", format: "%d/%m/%Y" } },
                new Date(st)
              ]
            },
            {
              $lte: [
                { $dateFromString: { dateString: "$grDate", format: "%d/%m/%Y" } },
                new Date(et)
              ]
            },
          ],
        }

      } else if (startDate) {

        const st = this.convertTimestampToDate(startDate);
        
        dateQuery = {
          $and: [
            {
              $gte: [
                { $dateFromString: { dateString: "$grDate", format: "%d/%m/%Y" } },
                new Date(st)
              ]
            }
          ],
        };

      } else if (endDate) {
        const et = this.convertTimestampToDate(endDate);
        dateQuery = {
          $and: [
            {
              $lte: [
                { $dateFromString: { dateString: "$grDate", format: "%d/%m/%Y" } },
                new Date(et)
              ]
            }
          ],
        }
      }


      Challan.find({}).countDocuments().then((allTotalCount) => {
        if (allTotalCount) {

          // let temp =obj.materialType || [];  
          if (obj.materialType && obj.vehicleType) {
            Challan.aggregate([
              { $match: { $or: [{ materialType: { $in: obj.materialType } }] } },
              { $match: { $or: [{ vehicleType: { $in: obj.vehicleType } }] } },
              { $match: { $and: [{ isReceived: false }] } },
              {
                $match: {
                  $or: [{ deliveryNumber: new RegExp(searchTDNo, 'i') },
                  {
                    vehicleNumber: new RegExp(searchTDNo, 'i')
                  }]
                }
              },
              { $match: { $expr: dateQuery } },
              { $sort: { grISODate: -1 } }
            ])
              .then((disptachData) => {
                if (disptachData) {
                  resolve({
                    disptachData,
                    allTotalCount,
                    message:
                      "Successfully retrived all dispatch challan informations",
                  });
                } else {
                  reject({ message: "Unable to retrive challans" });
                }
              })
              .catch((error) => {
                reject(error);
              });
          } else if (obj.materialType) {
            Challan.aggregate([
              { $match: { $or: [{ materialType: { $in: obj.materialType } }] } },
              { $match: { $and: [{ isReceived: false }] } },
              {
                $match: {
                  $or: [{ deliveryNumber: new RegExp(searchTDNo, 'i') },
                  {
                    vehicleNumber: new RegExp(searchTDNo, 'i')
                  }]
                }
              },
              { $match: { $expr: dateQuery } },
              { $sort: { grISODate: -1 } },

            ])
              .then((disptachData) => {
                if (disptachData) {
                  resolve({
                    disptachData,
                    allTotalCount,
                    message:
                      "Successfully retrived all dispatch challan informations",
                  });
                } else {
                  reject({ message: "Unable to retrive challans" });
                }
              })
              .catch((error) => {
                reject(error);
              });
          } else if (obj.vehicleType) {
            Challan.aggregate([
              { $match: { $or: [{ vehicleType: { $in: obj.vehicleType } }] } },
              { $match: { $and: [{ isReceived: false }] } },
              {
                $match: {
                  $or: [{ deliveryNumber: new RegExp(searchTDNo, 'i') },
                  {
                    vehicleNumber: new RegExp(searchTDNo, 'i')
                  }]
                }
              },
              { $match: { $expr: dateQuery } },
              { $sort: { grISODate: -1 } }

            ])
              .then((disptachData) => {
                if (disptachData) {
                  resolve({
                    disptachData,
                    allTotalCount,
                    message:
                      "Successfully retrived all dispatch challan informations",
                  });
                } else {
                  reject({ message: "Unable to retrive challans" });
                }
              })
              .catch((error) => {
                reject(error);
              });
          } else {
            
            Challan.aggregate([

              { $match: { $and: [{ isReceived: false }] } },
              {
                $match: {
                  $or: [{ deliveryNumber: new RegExp(searchTDNo, 'i') },
                  {
                    vehicleNumber: new RegExp(searchTDNo, 'i')
                  }]
                }
              },
              { $match: { $expr: dateQuery } },
              { $sort: { grISODate: -1 } }
            ])
              .then((disptachData) => {
                if (disptachData) {
                  resolve({
                    disptachData,
                    allTotalCount,
                    message:
                      "Successfully retrived all dispatch challan informations123",
                  });
                } else {
                  reject({ message: "Unable to retrive challans" });
                }
              })
              .catch((error) => {
                reject(error);
              });
          }
        } else {
          return reject({ message: 'Unable to found Count' })
        }
      })
    });
  }  


  static findAllDispatchChallans(requestObject) {
    return new Promise((resolve, reject) => {

      const { body, query } = requestObject;

      const obj = {};

      const { materialType, vehicleType, startDate, endDate, searchTDNo } = body;

      if (vehicleType) {
        obj.vehicleType = vehicleType;
      }


      if (materialType) {
        obj.materialType = materialType;
      }


      // if (material) {

      //   const str = requestObject.originalUrl.split("?").pop();
      //   const plainString = decodeURIComponent(str);
      //   console.log(plainString)
      //   const material1 = plainString.substring(
      //     plainString.indexOf("=(") + 2,
      //     plainString.indexOf(")"));
      //    console.log(material1) 
      //   if (plainString && plainString !== "") {
      //     obj.materialType = material1;
      //   }
      // }


      let dateQuery = {};

      if (startDate && endDate) {

        const st = this.convertTimestampToDate(startDate);
        const et = this.convertTimestampToDate(endDate);

        dateQuery = {
          $and: [
            {
              $gte: [
                { $dateFromString: { dateString: "$grDate", format: "%d/%m/%Y" } },
                new Date(st)
              ]
            },
            {
              $lte: [
                { $dateFromString: { dateString: "$grDate", format: "%d/%m/%Y" } },
                new Date(et)
              ]
            },
          ],
        }

      } else if (startDate) {

        const st = this.convertTimestampToDate(startDate);
        
        dateQuery = {
          $and: [
            {
              $gte: [
                { $dateFromString: { dateString: "$grDate", format: "%d/%m/%Y" } },
                new Date(st)
              ]
            }
          ],
        };

      } else if (endDate) {
        const et = this.convertTimestampToDate(endDate);
        dateQuery = {
          $and: [
            {
              $lte: [
                { $dateFromString: { dateString: "$grDate", format: "%d/%m/%Y" } },
                new Date(et)
              ]
            }
          ],
        }
      }


      const page = parseInt(query.page) || 1;
      const limit = parseInt(query.limit) || 50;

      const skip = ((limit * page) - limit);


      Challan.find({}).countDocuments().then((allTotalCount) => {
        if (allTotalCount) {

          // let temp =obj.materialType || [];  
          if (obj.materialType && obj.vehicleType) {
            Challan.aggregate([
              { $match: { $or: [{ materialType: { $in: obj.materialType } }] } },
              { $match: { $or: [{ vehicleType: { $in: obj.vehicleType } }] } },
              { $match: { $and: [{ isReceived: false }] } },
              {
                $match: {
                  $or: [{ deliveryNumber: new RegExp(searchTDNo, 'i') },
                  {
                    vehicleNumber: new RegExp(searchTDNo, 'i')
                  }]
                }
              },
              { $match: { $expr: dateQuery } },
              { $sort: { grISODate: -1 } },

              {
                "$facet": {

                  "stage1": [{
                    $group: {
                      _id: null, count: { $sum: 1 }
                    }
                  }],

                  "stage2": [{ "$skip": skip }, { "$limit": limit }]
                }
              },
              { $unwind: "$stage1" },
              {
                $project: {
                  count: "$stage1.count",
                  data: "$stage2"
                }
              }
            ])
              .then((disptachData) => {
                if (disptachData) {
                  resolve({
                    disptachData,
                    allTotalCount,
                    message:
                      "Successfully retrived all dispatch challan informations",
                  });
                } else {
                  reject({ message: "Unable to retrive challans" });
                }
              })
              .catch((error) => {
                reject(error);
              });
          } else if (obj.materialType) {
            Challan.aggregate([
              { $match: { $or: [{ materialType: { $in: obj.materialType } }] } },
              { $match: { $and: [{ isReceived: false }] } },
              {
                $match: {
                  $or: [{ deliveryNumber: new RegExp(searchTDNo, 'i') },
                  {
                    vehicleNumber: new RegExp(searchTDNo, 'i')
                  }]
                }
              },
              { $match: { $expr: dateQuery } },
              { $sort: { grISODate: -1 } },

              {
                "$facet": {

                  "stage1": [{
                    $group: {
                      _id: null, count: { $sum: 1 }
                    }
                  }],

                  "stage2": [{ "$skip": skip }, { "$limit": limit }]
                }
              },
              { $unwind: "$stage1" },
              {
                $project: {
                  count: "$stage1.count",
                  data: "$stage2"
                }
              }
            ])
              .then((disptachData) => {
                if (disptachData) {
                  resolve({
                    disptachData,
                    allTotalCount,
                    message:
                      "Successfully retrived all dispatch challan informations",
                  });
                } else {
                  reject({ message: "Unable to retrive challans" });
                }
              })
              .catch((error) => {
                reject(error);
              });
          } else if (obj.vehicleType) {
            Challan.aggregate([
              { $match: { $or: [{ vehicleType: { $in: obj.vehicleType } }] } },
              { $match: { $and: [{ isReceived: false }] } },
              {
                $match: {
                  $or: [{ deliveryNumber: new RegExp(searchTDNo, 'i') },
                  {
                    vehicleNumber: new RegExp(searchTDNo, 'i')
                  }]
                }
              },
              { $match: { $expr: dateQuery } },
              { $sort: { grISODate: -1 } },

              {
                "$facet": {

                  "stage1": [{
                    $group: {
                      _id: null, count: { $sum: 1 }
                    }
                  }],

                  "stage2": [{ "$skip": skip }, { "$limit": limit }]
                }
              },
              { $unwind: "$stage1" },
              {
                $project: {
                  count: "$stage1.count",
                  data: "$stage2"
                }
              }

            ])
              .then((disptachData) => {
                if (disptachData) {
                  resolve({
                    disptachData,
                    allTotalCount,
                    message:
                      "Successfully retrived all dispatch challan informations",
                  });
                } else {
                  reject({ message: "Unable to retrive challans" });
                }
              })
              .catch((error) => {
                reject(error);
              });
          } else {
            
            Challan.aggregate([

              { $match: { $and: [{ isReceived: false }] } },
              {
                $match: {
                  $or: [{ deliveryNumber: new RegExp(searchTDNo, 'i') },
                  {
                    vehicleNumber: new RegExp(searchTDNo, 'i')
                  }]
                }
              },
              { $match: { $expr: dateQuery } },
              { $sort: { grISODate: -1 } },

              {
                "$facet": {

                  "stage1": [{
                    $group: {
                      _id: null, count: { $sum: 1 }
                    }
                  }],

                  "stage2": [{ "$skip": skip }, { "$limit": limit }]
                }
              },
              { $unwind: "$stage1" },
              {
                $project: {
                  count: "$stage1.count",
                  data: "$stage2"
                }
              }
            ])
              .then((disptachData) => {
                if (disptachData) {
                  resolve({
                    disptachData,
                    allTotalCount,
                    message:
                      "Successfully retrived all dispatch challan informations123",
                  });
                } else {
                  reject({ message: "Unable to retrive challans" });
                }
              })
              .catch((error) => {
                reject(error);
              });
          }
        } else {
          return reject({ message: 'Unable to found Count' })
        }
      })
    });
  }


  static findOwnerDispatchChallansById(id) {
    return new Promise((resolve, reject) => {
      // const query = type === "owner" ? { ownerId: id } : { _id: id };
      Challan.find({ ownerId: id })
        .then((dispatchData) => {
          if (dispatchData) {
            resolve({
              dispatchData,
              message:
                "Successfully retrived requested dispatch challan information",
            });
          } else {
            reject({ message: "Unable to retrive challans" });
          }
        })
        .catch((error) => {
          reject(error);
        });
    });
  }

  static async findChallanData(opt, queryparams) {
    if (opt) {
      const data = this.getAckData(queryparams);
      return data;
    } else {
      const data = this.getRcvData(queryparams);
      return data;
    }
  }

  static getAckData(queryparams) {
    return new Promise((resolve, reject) => {
      const { startDate, endDate, searchTDNo, page, limit } = queryparams;

      let dateQuery = {};
      if (startDate && endDate) {
        const st = this.convertTimestampToDate(startDate);
        const et = this.convertTimestampToDate(endDate);
        dateQuery = {
          $and: [
            {
              $gte: [
                { $dateFromString: { dateString: "$grDate", format: "%d/%m/%Y" } },
                new Date(st)
              ]
            },
            {
              $lte: [
                { $dateFromString: { dateString: "$grDate", format: "%d/%m/%Y" } },
                new Date(et)
              ]
            },
          ],
        }

      } else if (startDate) {
        const st = this.convertTimestampToDate(startDate);
        dateQuery = {
          $and: [
            {
              $gte: [
                { $dateFromString: { dateString: "$grDate", format: "%d/%m/%Y" } },
                new Date(st)
              ]
            }
          ],
        };

      } else if (endDate) {
        const et = this.convertTimestampToDate(endDate);
        dateQuery = {
          $and: [
            {
              $lte: [
                { $dateFromString: { dateString: "$grDate", format: "%d/%m/%Y" } },
                new Date(et)
              ]
            }
          ],
        }

      }

      const pageInput = parseInt(page) || 1;
      const limitInput = parseInt(limit) || 50;

      const skip = ((limitInput * pageInput) - limitInput);

      Challan.find({}).countDocuments().then((totalCount) => {
        if (totalCount) {
          // Challan.find({
          //   isAcknowledged: false,
          //   isReceived: false,
          //   $expr: dateQuery,
          //   $or: [
          //     { deliveryNumber: new RegExp(searchTDNo, 'i') },
          //     {
          //       vehicleNumber: new RegExp(searchTDNo, 'i')
          //     }]
          // })
          //   .sort({ createdAt: -1 })
          //   .skip(skip)
          //   .limit(limitInput)
          //   .then((disptachData) => {
          //     if (disptachData) {

          //       Challan.countDocuments({
          //         isAcknowledged: false,
          //         isReceived: false,
          //         $expr: dateQuery,
          //         $or: [
          //           { deliveryNumber: new RegExp(searchTDNo, 'i') },
          //           {
          //             vehicleNumber: new RegExp(searchTDNo, 'i')
          //           }]
          //       }).then((filterCount) => {
          //         if (filterCount) {
          //           resolve({
          //             totalCount,
          //             filterCount,
          //             disptachData,
          //             message:
          //               "Successfully retrived all dispatch challan informations",
          //           });
          //         } else {
          //           return reject({ message: 'Unable find filter count' })
          //         }
          //       })

          //     } else {
          //       reject({ message: "Unable to retrive challans" });
          //     }
          //   })
          //   .catch((error) => {
          //     reject(error);
          //   });
          Challan.aggregate([

            { $match: { $and: [{ isAcknowledged: false, }] } },
            { $match: { $and: [{ isReceived: false }] } },
            {
              $match: {
                $or: [{ deliveryNumber: new RegExp(searchTDNo, 'i') },
                {
                  vehicleNumber: new RegExp(searchTDNo, 'i')
                }]
              }
            },
            { $match: { $expr: dateQuery } },
            { $sort: { createdAt: -1 } },
            {
              "$facet": {
                "stage1": [{
                  $group: {
                    _id: null, count: { $sum: 1 }
                  }
                }],

                "stage2": [{ "$skip": skip }, { "$limit": limitInput }]
              }
            },
            { $unwind: "$stage1" },
            {
              $project: {
                count: "$stage1.count",
                data: "$stage2"
              }
            }
          ]).then((dispatchData) => {
            if (dispatchData) {
              resolve({
                totalCount,
                dispatchData,
                message:
                  "Successfully retrived all dispatch challan informations",
              });
            } else {
              return reject({ message: 'Unable to find dispatch data' })
            }
          })
        } else {
          return reject({ message: 'Unable to find total count' })
        }
      })
    });
  }

  static getRcvData(queryparams) {
    return new Promise((resolve, reject) => {
      const { startDate, endDate, searchTDNo, page, limit } = queryparams;

      let dateQuery = {};
      if (startDate && endDate) {
        const st = this.convertTimestampToDate(startDate);
        const et = this.convertTimestampToDate(endDate);
        dateQuery = {
          $and: [
            {
              $gte: [
                { $dateFromString: { dateString: "$grDate", format: "%d/%m/%Y" } },
                new Date(st)
              ]
            },
            {
              $lte: [
                { $dateFromString: { dateString: "$grDate", format: "%d/%m/%Y" } },
                new Date(et)
              ]
            },
          ],
        }

      } else if (startDate) {
        const st = this.convertTimestampToDate(startDate);
        dateQuery = {
          $and: [
            {
              $gte: [
                { $dateFromString: { dateString: "$grDate", format: "%d/%m/%Y" } },
                new Date(st)
              ]
            }
          ],
        };

      } else if (endDate) {
        const et = this.convertTimestampToDate(endDate);
        dateQuery = {
          $and: [
            {
              $lte: [
                { $dateFromString: { dateString: "$grDate", format: "%d/%m/%Y" } },
                new Date(et)
              ]
            }
          ],
        }

      }

      const pageInput = parseInt(page) || 1;
      const limitInput = parseInt(limit) || 50;

      const skip = ((limitInput * pageInput) - limitInput);

      Challan.countDocuments().then((totalCount) => {
        if (totalCount) {
          // Challan.find({
          //   isAcknowledged: true, $expr: dateQuery,
          //   $or: [
          //     { deliveryNumber: new RegExp(searchTDNo, 'i') },
          //     {
          //       vehicleNumber: new RegExp(searchTDNo, 'i')
          //     }]
          // })
          //   .sort({ isReceived: 1 })
          //   .skip(skip)
          //   .limit(limitInput)
          //   .then((disptachData) => {
          //     if (disptachData) {
          //       Challan.countDocuments({
          //         isAcknowledged: true, $expr: dateQuery,
          //         $or: [
          //           { deliveryNumber: new RegExp(searchTDNo, 'i') },
          //           {
          //             vehicleNumber: new RegExp(searchTDNo, 'i')
          //           }]
          //       }).then((filterCount) => {
          //         if (filterCount) {
          //           resolve({
          //             totalCount,
          //             filterCount,
          //             disptachData,
          //             message:
          //               "Successfully retrived all dispatch challan informations",
          //           });
          //         } else {
          //           return reject({ message: 'Unable to find filter count' })
          //         }
          //       })
          //     } else {
          //       reject({ message: "Unable to retrive challans" });
          //     }
          //   })
          //   .catch((error) => {
          //     reject(error);
          //   });
          Challan.aggregate([

            { $match: { $and: [{ isAcknowledged: true, }] } },
            {
              $match: {
                $or: [{ deliveryNumber: new RegExp(searchTDNo, 'i') },
                {
                  vehicleNumber: new RegExp(searchTDNo, 'i')
                }]
              }
            },
            { $match: { $expr: dateQuery } },
            { $sort: { isReceived: 1 } },
            {
              "$facet": {
                "stage1": [{
                  $group: {
                    _id: null, count: { $sum: 1 }
                  }
                }],

                "stage2": [{ "$skip": skip }, { "$limit": limitInput }]
              }
            },
            { $unwind: "$stage1" },
            {
              $project: {
                count: "$stage1.count",
                data: "$stage2"
              }
            }
          ]).then((dispatchData) => {
            if (dispatchData) {
              resolve({
                totalCount,
                dispatchData,
                message:
                  "Successfully retrived all dispatch challan informations",
              });
            } else {
              return reject({ message: 'Unable to find dispatch data' })
            }
          })
        } else {
          return reject({ message: 'Unable to find total count' })
        }
      })

    });
  }

  static getAllDeliveryNumber(queryparams) {
    return new Promise((resolve, reject) => {
      const { searchDNo, page, limit } = queryparams;

      const pageInput = parseInt(page) || 1;
      const limitInput = parseInt(limit) || 300;

      const skip = (limitInput * pageInput) - limitInput;

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
            resolve({
              deliveryData,
              message:
                "Successfully retrived all delivery numbers informations",
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

  static getAllMaterialTypeByChart(requestObject) {
    return new Promise((resolve, reject) => {
      const { entryYear } = requestObject;

      Challan.aggregate([
        { $match: { isAcknowledged: true } },
        {
          $project: {
            year: { $year: "$grISODate" },
            month: { $month: "$grISODate" },
            materialType: 1,
            balance: 1
          }
        },
        {
          $match: {
            year: Number(entryYear)
          },
        },
        {
          $group: {
            _id: {
              month: "$month",
              year: "$year",

            },
            CEMENT: {
              $sum: {
                $cond: [{ $eq: ["$materialType", "CEMENT"] }, 1, 0]
              }
            },
            FLYASH: {
              $sum: {
                $cond: [{ $eq: ["$materialType", "FLYASH"] }, 1, 0]
              }
            },
            MT: {
              $sum: {
                $cond: [{ $eq: ["$materialType", "MT"] }, 1, 0]
              }
            },
            "C&T BAG": {
              $sum: {
                $cond: [{ $eq: ["$materialType", "C&T BAG"] }, 1, 0]
              }
            },
            GYPSUM: {
              $sum: {
                $cond: [{ $eq: ["$materialType", "GYPSUM"] }, 1, 0]
              }
            },
            OTHERS: {
              $sum: {
                $cond: [{ $eq: ["$materialType", "OTHERS"] }, 1, 0]
              }
            },
            amount: {
              $sum: "$balance"
            },
          },
        },
        { $sort: { _id: 1 } },
        // {
        //   $group: {
        //     _id: { month: "$_id.month", year: "$_id.year" },
        //     counts: {
        //       $push: {
        //         materialType: "$_id.materialType",
        //         count: "$count"
        //       },
        //     },
        //     totalAmount: { $sum: "$amount"}
        //   }
        // }
      ])
        .then((materialType) => {
          if (materialType) {
            resolve({
              materialType,
              message:
                "Successfully retrived all material type informations",
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


  static getAllEarningVisulation(requestObject) {
    return new Promise((resolve, reject) => {
      let { entryYear, entryMonth } = requestObject;
      let previousMonth = parseInt(entryMonth) - 1;
      let previousEntryYear = entryYear;

      if (parseInt(entryMonth) == 1) {
        previousMonth = 12;
        previousEntryYear = parseInt(entryYear) - 1;
      }

      Challan.aggregate([
        { $match: { isAcknowledged: true } },
        {
          $project: {
            year: { $year: "$grISODate" },
            month: { $month: "$grISODate" },
            balance: 1
          }
        },
        {
          $match: {
            year: Number(entryYear),
            month: Number(entryMonth)
          },
        },
        {
          $group: {
            _id: { month: "$month", year: "$year" },
            totalEarning: {
              $sum: "$balance"
            },
          }
        },
      ])
        .then((currentEarningData) => {
          if (currentEarningData) {
            Challan.aggregate([
              { $match: { isAcknowledged: true } },
              {
                $project: {
                  year: { $year: "$grISODate" },
                  month: { $month: "$grISODate" },
                  balance: 1
                }
              },
              {
                $match: {
                  year: Number(previousEntryYear),
                  month: Number(previousMonth),
                },
              },
              {
                $group: {
                  _id: { month: "$month", year: "$year" },
                  totalEarning: {
                    $sum: "$balance"
                  },
                }
              }
            ]).then((previousEarningData) => {
              if (previousEarningData) {
                resolve({
                  currentEarningData,
                  previousEarningData,
                  message:
                    "Successfully retrived all informations",
                });
              }
            })
          } else {
            reject({ message: "Unable to retrive informations" });
          }
        })

    });
  }

  static getAllHeaderVisulation(requestObject) {
    return new Promise((resolve, reject) => {

      let { entryYear } = requestObject;


      // Challan.find({}).countDocuments()
      Challan.aggregate([
        { $match: { isAcknowledged: true } },
        { $project: { year: { $year: "$grISODate" }, } },
        {
          $match: { year: Number(entryYear) }
        },
        { $group: { _id: null, myCount: { $sum: 1 } } },
        { $project: { _id: 0 } }
      ])
        .then((totalTrips) => {
          if (totalTrips) {
            let totalTrip;
            totalTrips.map((result) => {
              totalTrip = result.myCount;
            })
            Challan.aggregate([
              { $match: { isAcknowledged: true } },
              {
                $project: {
                  year: { $year: "$grISODate" },
                  balance: 1,
                  commisionTotal: 1
                }
              },
              {
                $match: { year: Number(entryYear) }
              },
              
              {
                $group: {
                  _id: { year: "$year" },
                  totalRevenue: {
                    $sum: "$balance"
                  },
                  totalCommission: {
                    $sum: "$commisionTotal"
                  }
                }
              }
            ])
              .then((challanData) => {
                 
                if (challanData) {
                  // let totalRevenue = challanData.reduce((sum, val) => sum + +val.balance, 0);
                  // let totalCommission = challanData.reduce((sum, val) => sum + +val.commisionTotal, 0);
                  let totalRevenue;
                  let totalCommission;
                  challanData.map((result) => {
                    totalRevenue = result.totalRevenue;
                    totalCommission = result.totalCommission;
                  })
                  OwnerAdavance.aggregate([

                    { $unwind: "$ledgerEntries" },
                    {
                      $project: {
                        year: { $year: "$initialISODate" },
                        "ledgerEntries.debit": 1,
                        "ledgerEntries.credit": 1
                      }
                    },
                    {
                      $match: { year: Number(entryYear) }
                    },
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
                        let outStandingAmount;
                        amountData.map((data) => {
                          outStandingAmount = data.outStandingAmount;
                        })
                        resolve({
                          totalTrip,
                          totalRevenue,
                          totalCommission,
                          outStandingAmount,
                          message:
                            "Successfully retrived all informations",
                        });
                      } else {
                        return reject({ message: 'Unable to find owner advance info' })
                      }
                    })
                    .catch((error) => {
                      reject({
                        error,
                        message: "Unable to fetch owners outstanding amount",
                      });
                    });
                } else {
                  reject({ message: "Unable to retrive informations" });
                }
              })
          } else {
            reject({ message: "Unable to retrive count  informations" });
          }
        })
        .catch((error) => {
          reject(error);
        });
    });
  }

  static getMonthYearExpensesVisulation(requestObject) {
    return new Promise((resolve, reject) => {
      let { entryYear } = requestObject;

      Challan.aggregate([
        { $match: { isAcknowledged: true } },
        {
          $project: {
            year: { $year: "$grISODate" },
            month: { $month: "$grISODate" },
            diesel: 1,
            cash: 1,
            bankTransfer: 1,
            shortage:1
          }
        },
        {
          $match: { year: Number(entryYear) }
        },
        {
          $group: {
            _id: { month: "$month" 
          },

            totalDiesel: {
              $sum: "$diesel"
            },
            totalCash: {
              $sum: "$cash"
            },
            totalBankTransfer: {
              $sum: "$bankTransfer"
            },
            totalShortage:{
              $sum: "$shortage" 
            },
          }
        },
        { $sort: { _id: 1 } },
      ])
        .then((totalTrip) => {
          if (totalTrip) {
            resolve({
              totalTrip,
              message:
                "Successfully retrived all informations",
            });
          } else {
            reject({ message: "Unable to retrive count  informations" });
          }
        })
        .catch((error) => {
          reject(error);
        });
    });
  }


  static convertTimestampToDate(dateString) {

    const dt = new Date(Number(dateString));
    const dateEntry = dt.toISOString().split("T")[0];
    const entryDate = moment(dateEntry, "YYYY-MM-DD");
    const entryISODate = entryDate.format("YYYY-MM-DD") + "T00:00:00.000Z";
    return entryISODate;
  }
};


