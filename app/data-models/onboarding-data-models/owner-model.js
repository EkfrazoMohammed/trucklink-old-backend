const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ownerOnBoarding = new Schema({
  // owner details
  name: { type: String, required: true },
  email: { type: String },
  phoneNumber: { type: String, required: true, unique: true },
  countryCode: { type: String, default: "+91" },
  panNumber: { type: String },
  // phoneNumber: { type: String },
  countryCode: { type: String, default: "+91" },
  address: { type: String },
  district: { type: String },
  state: { type: String },

  oldVehicleDetails: [
    {
      vehicleIds: { type: Schema.Types.ObjectId, ref: "vehicles" },
      ownerId: { type: String, required: false },
      ownerTransferDate: { type: Date },
      ownerTransferFromDate: { type: Date },
      vehicleNumber: { type: String, required: false },
      commission: { type: Number, required: false, default: 0 },
      truckType: { type: String, required: false },
      accountId: { type: Schema.Types.ObjectId, ref: "accounts", required: false },
    }
  ],

  vehicleDetails: [
    {
      vehicleIds: { type: Schema.Types.ObjectId, ref: "vehicles" },
      ownerTransferDate: { type: Date },
      ownerTransferFromDate: { type: Date },
      isOwnerTransfer: { type: Boolean, default: false },
      ownerId: { type: String, required: false },
    },
  ],

  // linked schema detail
  vehicleIds: [{ type: Schema.Types.ObjectId, ref: "vehicles" }],
  accountIds: [{ type: Schema.Types.ObjectId, ref: "accounts" }],

  createdAt: { type: Date, default: Date.now },
  modifiedAt: { type: Date, default: Date.now },
});

const Owner = mongoose.model("owners", ownerOnBoarding, "owners");
module.exports = Owner;
