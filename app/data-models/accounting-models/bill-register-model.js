const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const bill = new Schema({
  billNumber: { type: String, required: true, unique: true },
  billType: { type: String, required: true, enum: ["EPOD", "INCENTIVE", "PHYSICAL"] },
  valueRaised: { type: Number, required: true, default: 0 },

  valueReceived: { type: Number, required: true, default: 0 },

  tax: { type: Number, required: true, default: 0 },

  remarks: { type: String, required: false },

  difference: { type: Number, required: false, default: 0 },

  challan: [{ type: Schema.Types.ObjectId, ref: "challans" }],

  createdAt: { type: Date, default: Date.now },
  modifiedAt: { type: Date, default: Date.now },
});

const Bill = mongoose.model("billRegister", bill,"billRegister");
module.exports = Bill;
