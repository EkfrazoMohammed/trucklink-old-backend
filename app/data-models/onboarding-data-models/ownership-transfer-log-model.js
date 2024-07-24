const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const OwnertransferLogSchema = new Schema({

    vehicleNumber: { type: String, required: false },
    userId: { type: Schema.Types.ObjectId, ref: "User" },
    vehicleIds: { type: Schema.Types.ObjectId, ref: "vehicles" },
    oldOwnerId: { type: Schema.Types.ObjectId, ref: "owners" },
    newOwnerId: { type: Schema.Types.ObjectId, ref: "owners" },
    ownerTransferDate: { type: Date },
      ownerTransferFromDate: { type: Date },
    createdAt: { type: Date, default: Date.now },
});

const OwnerTransferLog = mongoose.model("OwnertransferLog", OwnertransferLogSchema, "OwnertransferLog");
module.exports = OwnerTransferLog;
