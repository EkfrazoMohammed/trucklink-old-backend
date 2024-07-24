const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const account = new Schema({
  // account details
  accountNumber: { type: String, required: true, unique: true },
  accountHolderName: { type: String, required: true },
  ifscCode: { type: String, required: true },
  bankName: { type: String, required: true },
  branchName: { type: String, required: true },

  // linked schema details
  ownerId: { type: Schema.Types.ObjectId, ref: "owners", required: true },
  vehicleId: { type: Schema.Types.ObjectId, ref: "vehicles" },

  createdAt: { type: Date, default: Date.now },
  modifiedAt: { type: Date, default: Date.now },
});

const Account = mongoose.model("accounts", account, "accounts");
module.exports = Account;
