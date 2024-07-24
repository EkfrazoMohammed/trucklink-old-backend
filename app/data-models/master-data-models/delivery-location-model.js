const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const delivery = new Schema({
  location: { type: String, required: true, unique: true },
  createdAt: { type: Date, default: Date.now },
});

const DeliveryLocation = mongoose.model(
  "deliveryLocations",
  delivery,
  "deliveryLocations"
);
module.exports = DeliveryLocation;
