const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const dispatchChallans = new Schema({
  materialType: { type: String },

  // GR details
  grNumber: { type: String },
  grDate: { type: String },
  grISODate: { type: Date },

  // invoice date
  invoiceDate: { type: String },
  invoiceISODate: { type: Date },
  invoiceProof: { type: String },

  // location details
  loadLocation: { type: String },
  deliveryLocation: { type: String },

  // vehicle details
  vehicleNumber: { type: String },
  vehicleId: { type: String },
  vehicleBank: { type: String },
  ownerId: { type: String },
  ownerName: { type: String },
  ownerPhone: { type: String },
  vehicleType: { type: String },

  // delivery details
  deliveryNumber: { type: String },

  // numeric calculations and entries
  quantityInMetricTons: { type: Number, default: 0 },
  rate: { type: Number, default: 0 },
  commisionRate: { type: Number, default: 0 },
  commisionTotal: { type: Number, default: 0 },
  totalExpense: { type: Number, default: 0 },
  shortage: { type: Number, default: 0 },
  balance: { type: Number, default: 0 },

  // load trip expense details
  diesel: { type: Number, default: 0 },
  cash: { type: Number, default: 0 },
  bankTransfer: { type: Number, default: 0 },

  isAcknowledged: { type: Boolean, default: false },
  isReceived: { type: Boolean, default: false },

  createdAt: { type: Date, default: Date.now },
  modifiedAt: { type: Date, default: Date.now },
});

const nChallan = mongoose.model("TruckLinkChallans", dispatchChallans, "TruckLinkChallans");
module.exports = nChallan;
