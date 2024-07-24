const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const dispatchChallans = new Schema({
  materialType: { type: String, required: true },

  // GR details
  grNumber: { type: String },
  grDate: { type: String, required: true },
  grISODate: { type: Date, required: true },

  // invoice date
  invoiceDate: { type: String },
  invoiceISODate: { type: Date },
  invoiceProof: { type: String },

  // location details
  loadLocation: { type: String, required: true },
  deliveryLocation: { type: String, required: true },

  // vehicle details
  vehicleNumber: { type: String, required: true },
  vehicleBank: { type: String, required: true },
  vehicleId: { type: String, required: true },
  ownerId: { type: String, required: true },
  ownerName: { type: String, required: true },
  ownerPhone: { type: String, required: true },
  vehicleType: { type: String, required: true },

  // delivery details
  deliveryNumber: { type: String, required: true, unique: true },

  // numeric calculations and entries
  quantityInMetricTons: { type: Number, required: true, default: 0 },
  rate: { type: Number, required: true, default: 0 },
  commisionRate: { type: Number, default: 0 },
  commisionTotal: { type: Number, default: 0 },
  totalExpense: { type: Number, default: 0 },
  shortage: { type: Number, default: 0 },
  balance: { type: Number, default: 0 },

  // load trip expense details
  diesel: { type: Number, default: 0 },
  cash: { type: Number, default: 0 },
  bankTransfer: { type: Number, default: 0 },

  recovery: { type: Number, default: 0 },
  outstanding: { type: Number, default: 0 },

  isAcknowledged: { type: Boolean, default: false },
  isReceived: { type: Boolean, default: false },
  vehicleReferenceId: { type: Schema.Types.ObjectId, ref: "vehicles" },
  vehicleBankReferenceId: { type: Schema.Types.ObjectId, ref: "accounts", required: true },
  ownerReferenceId: { type: Schema.Types.ObjectId, ref: "owners", required: true },
  createdAt: { type: Date, default: Date.now },
  modifiedAt: { type: Date, default: Date.now },
});

const Challan = mongoose.model("challans", dispatchChallans, "challans");
module.exports = Challan;
