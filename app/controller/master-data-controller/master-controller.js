const Material = require("../../data-models/master-data-models/material-model");
const LoadLocation = require("../../data-models/master-data-models/load-location-model");
const DeliveryLocation = require("../../data-models/master-data-models/delivery-location-model");
const Challan = require("../../data-models/dispatch-to-ledger-models/challan-model");

module.exports = class OwnerController {
  static async createMaterial(requestObject) {
    try {
      const material = requestObject.materialType
        ? requestObject.materialType.toUpperCase()
        : null;
      return new Promise(async (resolve, reject) => {
        Material.findOne({ materialType: material })
          .then((materialType) => {
            if (materialType) {
              return reject({
                message: "This materialType already exists",
              });
            } else {
              Material.find({})
                .countDocuments()
                .then((countcheck) => {
                  
                  if (countcheck < 6) {
                    const _materialType = new Material({
                      materialType: material,
                    });
                    return _materialType.save((err, data) => {
                      if (err) {
                        return reject({
                          message: "Material Type is restricted",
                        });
                      }
                      return resolve({
                        Material: data,
                        message: "Material has been successfully created !!!!",
                      });
                    });
                  } else {
                    reject({ message: "Material Type is restricted" });
                  }
                });
            }
          })
          .catch((err) => {
            return reject({
              err,
              message: "Oh bad !!! Unable to create material",
            });
          });
      });
    } catch (err) {
      return Promise.reject({ err, message: "Something went wrong try again" });
    }
  }

  static async createLoadLocation(requestObject) {
    try {
      const place = requestObject.location
        ? requestObject.location.charAt(0).toUpperCase() +
          requestObject.location.slice(1).toLowerCase()
        : null;
      return new Promise(async (resolve, reject) => {
        LoadLocation.findOne({ location: place })
          .then((location) => {
            if (location) {
              return reject({
                message: "This location already exists",
              });
            } else {
              const _location = new LoadLocation({ location: place });
              return _location.save();
            }
          })
          .then((data) => {
            if (data) {
              return resolve({
                LoadLocation: data,
                message: "Location has been successfully created",
              });
            }
          })
          .catch((err) => {
            return reject({
              err,
              message: "Unable to create location",
            });
          });
      });
    } catch (err) {
      return Promise.reject({ err, message: "Something went wrong try again" });
    }
  }

  static async createDeliveryLocation(requestObject) {
    try {
      const place = requestObject.location
        ? requestObject.location.charAt(0).toUpperCase() +
          requestObject.location.slice(1).toLowerCase()
        : null;
      return new Promise(async (resolve, reject) => {
        DeliveryLocation.findOne({ location: place })
          .then((location) => {
            if (location) {
              return reject({
                message: "This location already exists",
              });
            } else {
              const _location = new DeliveryLocation({ location: place });
              return _location.save();
            }
          })
          .then((data) => {
            if (data) {
              return resolve({
                DeliveryLocation: data,
                message: "Location has been successfully created !!!!",
              });
            }
          })
          .catch((err) => {
            return reject({
              err,
              message: "Unable to create location",
            });
          });
      });
    } catch (err) {
      return Promise.reject({ err, message: "Something went wrong try again" });
    }
  }

  static findMaterial() {
    return new Promise((resolve, reject) => {
      Material.find({})
        .then((data) => {
          resolve({
            materials: data,
            message: "successfully fetched material data",
          });
        })
        .catch((error) => {
          reject({ error, message: "Unable to fetch material data" });
        });
    });
  }

  static findLoadLocation() {
    return new Promise((resolve, reject) => {
      LoadLocation.find({})
        .then((data) => {
          resolve({
            materials: data,
            message: "successfully fetched location data",
          });
        })
        .catch((error) => {
          reject({ error, message: "Unable to fetch location data" });
        });
    });
  }
  static findDeliveryLocation() {
    return new Promise((resolve, reject) => {
      DeliveryLocation.find({})
        .then((data) => {
          resolve({
            materials: data,
            message: "successfully fetched location data",
          });
        })
        .catch((error) => {
          reject({ error, message: "Unable to fetch location data" });
        });
    });
  }

  static updateMaterialType(updateRequestObject) {
    // Only pass neccessary feilds that needs to update
    let materialBody = updateRequestObject.body.materialType
      ? updateRequestObject.body.materialType.toUpperCase()
      : null;

    return new Promise((resolve, reject) => {
      const { params } = updateRequestObject;

      Material.findById({ _id: params.id })
        .then((materialtype) => {
          if (!materialtype) {
            return reject({
              message: "Material not found please add material and update",
            });
          } else {
            return Material.findOne({ materialType: materialBody }).then(
              (data) => {
                if (data) {
                  return reject({ message: "This Material already exixts" });
                } else {
                  Material.findOneAndUpdate(
                    {
                      _id: params.id,
                    },
                    {
                      $set: { materialType: materialBody },
                    },
                    { new: true }
                  )
                    .then((result) => {
                      if (!result) {
                        reject({
                          error,
                          message: "Unable to update Material data",
                        });
                      } else {
                        return Challan.updateMany(
                          { materialType: materialtype.materialType },
                          { $set: { materialType: materialBody } },
                          { new: true }
                        )
                          .then((chalandata) => {
                            if (chalandata) {
                              resolve({
                                updated: result,
                                message: "updated successfully",
                              });
                            } else {
                              reject({
                                message:
                                  "Unable to update Material data for challan",
                              });
                            }
                          })
                          .catch((err) => {
                            err.desc = "Unable to update challan materila type";
                            reject(err);
                          });
                      }
                    })
                    .catch((err) => {
                      err.desc = "Unable to update material Type";
                      reject(err);
                    });
                }
              }
            );
          }
        })
        .catch((err) => {
          reject({ err, message: "Your Material Param Id Not Found" });
        });
    });
  }

  static updateLoadLocation(updateRequestObject) {
    // Only pass neccessary feilds that needs to update
    let locationBody = updateRequestObject.body.location
      ? updateRequestObject.body.location.charAt(0).toUpperCase() +
        updateRequestObject.body.location.slice(1).toLowerCase()
      : null;

    return new Promise((resolve, reject) => {
      const { body, params } = updateRequestObject;
      LoadLocation.findById(params.id)
        .then((location) => {
          if (!location) {
            reject({
              message:
                "Load location not found please add load location and update",
            });
          } else {
            return LoadLocation.findOne({ location: locationBody }).then(
              (data) => {
                if (data) {
                  return reject({
                    message: "This Load Location already exixts",
                  });
                } else {
                  return LoadLocation.findOneAndUpdate(
                    {
                      _id: params.id,
                    },
                    {
                      $set: { location: locationBody },
                    },
                    { new: true }
                  )
                    .then((result) => {
                      if (!result) {
                        reject({
                          error,
                          message: "Unable to update Material data",
                        });
                      } else {
                        return Challan.updateMany(
                          { loadLocation: location.location },
                          { $set: { loadLocation: locationBody } },
                          { new: true }
                        )
                          .then((challandata) => {
                            if (challandata) {
                              resolve({
                                updated: result,
                                message: "updated successfully",
                              });
                            } else {
                              reject({
                                error,
                                message:
                                  "Unable to update Challan Material data",
                              });
                            }
                          })
                          .catch((err) => {
                            err.desc = "Unable to update challan load location";
                            reject(err);
                          });
                      }
                    })
                    .catch((err) => {
                      err.desc = "Unable to update master load Location";
                      reject(err);
                    });
                }
              }
            );
          }
        })
        .catch((err) => {
          reject({ err, message: "Your Load Location Param Id Not Found" });
        });
    });
  }

  static updateDeliveryLocation(updateRequestObject) {
    // Only pass neccessary feilds that needs to update

    let locationBody = updateRequestObject.body.location
      ? updateRequestObject.body.location.charAt(0).toUpperCase() +
        updateRequestObject.body.location.slice(1).toLowerCase()
      : null;

    return new Promise((resolve, reject) => {
      const { body, params } = updateRequestObject;
      DeliveryLocation.findById(params.id)
        .then((location) => {
          if (!location) {
            reject({
              message:
                "Delivery location not found please add Delivery location and update",
            });
          } else {
            return DeliveryLocation.findOne({ location: locationBody }).then(
              (data) => {
                if (data) {
                  return reject({
                    message: "This Delivery Location already exixts",
                  });
                } else {
                  return DeliveryLocation.findOneAndUpdate(
                    {
                      _id: params.id,
                    },
                    {
                      $set: { location: locationBody },
                    },
                    { new: true }
                  )
                    .then((result) => {
                      if (!result) {
                        reject({
                          error,
                          message: "Unable to update Material data",
                        });
                      } else {
                        return Challan.updateMany(
                          { deliveryLocation: location.location },
                          { $set: { deliveryLocation: locationBody } },
                          { new: true }
                        )
                          .then((challandata) => {
                            if (challandata) {
                              resolve({
                                updated: result,
                                message: "updated successfully",
                              });
                            } else {
                              reject({
                                error,
                                message:
                                  "Unable to update Challan Delivery Location data",
                              });
                            }
                          })
                          .catch((err) => {
                            reject({
                              err,
                              message:
                                "Unable to update challlan Delivery Location",
                            });
                          });
                      }
                    })
                    .catch((err) => {
                      err.desc =
                        "Unable to update master Delivery Location Date";
                      reject(err);
                    });
                }
              }
            );
          }
        })
        .catch((err) => {
          reject({ err, message: "Your Param Id Not found" });
        });
    });
  }
};
