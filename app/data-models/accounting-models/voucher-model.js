const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const voucher = new Schema({
  voucherNumber: { type: String },
  voucherDate: { type: String, required: true },
  voucherISODate: { type: Date, required: true },
  vehicleNumber: { type: String, required: true },
  vehicleId: { type: String, required: true },
  vehicleBank: { type: String, required: true },
  ownerName: { type: String, required: true },
  ownerId: { type: String, required: true },
  ownerPhone: { type: String, required: true },
  narration: { type: String, required: true },
  amount: { type: Number, required: true, default: 0 },
  ownerDetails: { type: Schema.Types.ObjectId, ref: "owners", required: true },
  vehicleDetails: { type: Schema.Types.ObjectId, ref: "vehicles", required: true },
  modeOfPayment: {
    type: String,
    enum: ["Bank Transfer", "Cash"],
    required: true,
    default: "Cash",
  },

  materialType: { type: String },
  materialId: { type: String },

  createdAt: { type: Date, default: Date.now },
  modifiedAt: { type: Date, default: Date.now },
});

const Voucher = mongoose.model("vouchers", voucher, "vouchers");
module.exports = Voucher;
