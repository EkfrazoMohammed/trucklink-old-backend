const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const load = new Schema({
  location: { type: String, required: true, unique: true },
  createdAt: { type: Date, default: Date.now },
});

const LoadLocation = mongoose.model("loadLocations", load, "loadLocations");
module.exports = LoadLocation;
