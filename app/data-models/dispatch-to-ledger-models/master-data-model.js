const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const masterData = new Schema({
  material: [{ _id: false, materialType: { type: String, unique: true } }],
  loadLocation: [{ _id: false, location: { type: String, unique: true } }],
  deliveryLocation: [{ _id: false, location: { type: String, unique: true } }],
  modifiedAt: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now },
});

const MasterData = mongoose.model("masterDatas", masterData, "masterDatas");
module.exports = MasterData;
