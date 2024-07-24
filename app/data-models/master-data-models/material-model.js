const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const mType = new Schema({
  materialType: {
    type: String,
    required: true,
    unique: true,
    enum: ["CEMENT", "FLYASH", "MT", "C&T BAG", "GYPSUM","OTHERS"]
  },
  createdAt: { type: Date, default: Date.now },
});


const MaterialType = mongoose.model("materialTypes", mType, "materialTypes");
module.exports = MaterialType;
