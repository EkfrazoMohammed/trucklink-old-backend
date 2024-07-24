const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const LogSchema = new Schema({

    userEmail: { type: String, required: false },
    ipAddress: { type: String, required: false },
    browserAgent: { type: String, required: false },
    referrer: { type: String, required: false },
    userId: { type: Schema.Types.ObjectId, ref: "User" },
    loginTime: { type: Date, default: Date.now },
    logoutTime: { type: Date },
    durationTime: { type: String, required: false },
});

const ActivityLog = mongoose.model("ActivityLog", LogSchema, "ActivityLog");
module.exports = ActivityLog;
