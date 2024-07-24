const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const vehicleDetails = new Schema({
  registrationNumber: { type: String, required: true, unique: true },
  rcBookProof: { type: String },
  isActive: { type: Boolean, default: true },
  truckType: {
    type: String,
    required: true,
    enum: ["bag", "bulk"],
    default: "bag",
  },

  // driver details
  driverName: { type: String },
  driverPhoneNumber: { type: String },
  driverCountryCode: { type: String, default: "+91" },

  commission: { type: Number, required: true, default: 0 },

  // linked schema details
  ownerId: { type: Schema.Types.ObjectId, ref: "owners", required: true },
  accountId: { type: Schema.Types.ObjectId, ref: "accounts", required: true },


  createdAt: { type: Date, default: Date.now },
  modifiedAt: { type: Date, default: Date.now },
});

const Vehicle = mongoose.model("vehicles", vehicleDetails, "vehicles");
module.exports = Vehicle;
