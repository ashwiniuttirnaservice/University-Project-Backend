const mongoose = require("mongoose");

const permissionSchema = new mongoose.Schema(
  {
    module: { type: String, required: true },

    // module: {
    //   type: mongoose.Schema.Types.ObjectId,
    //   ref: "Module",
    //   required: true,
    // },
    actions: [
      {
        type: String,
        enum: ["create", "read", "update", "delete"],
      },
    ],
  },
  { _id: false }
);

const roleSchema = new mongoose.Schema(
  {
    role: { type: String, required: true, unique: true },
    permissions: [permissionSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Role", roleSchema);
