const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const recovery = new Schema({
  recoveryCode: { type: String, required: true, unique: true },
  value: { type: String, required: true },
  recovered: { type: Number, required: true, default: 0 },

  outstanding: { type: Number, required: true, default: 0 },

  challan: [{ type: Schema.Types.ObjectId, ref: "challans"}],

  createdAt: { type: Date, default: Date.now },
  modifiedAt: { type: Date, default: Date.now },
});


const Recovery = mongoose.model("recovery", recovery, "recovery");
module.exports = Recovery;
