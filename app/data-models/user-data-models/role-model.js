const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const rolesSchema = new Schema({
  roleName: {
    type: String,
    required: true,
    enum: ["Admin", "General User"],
    default: "General User",
  },
  
  permissions: {
    masterLayout: {
      create: { type: Boolean, default: true },
      read: { type: Boolean, default: true },
      update: { type: Boolean, default: true },
      delete: { type: Boolean, default: true },
    },
  },

  createdAt: { type: Date, default: Date.now },
  modifiedAt: { type: Date, default: Date.now },
});

const Role = mongoose.model("Role", rolesSchema);
module.exports = Role;
