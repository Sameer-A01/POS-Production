import mongoose from "mongoose";

const inventorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Inventory item name is required"],
    trim: true,
    minlength: [2, "Name must be at least 2 characters"],
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
    required: [true, "Category is required"],
  },
  supplier: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Supply",
    required: [true, "Supplier is required"],
  },
  quantity: {
    type: Number,
    default: 0,
    min: [0, "Quantity cannot be negative"],
  },
  stock: {
    type: Boolean,
    default: true, // true means in stock, false means out of stock
  },
  reorderLevel: {
    type: Number,
    default: 10, // default threshold for reorder
    min: [0, "Reorder level cannot be negative"],
  },
  price: {
    type: Number,
    required: [true, "Price is required"],
    min: [0, "Price cannot be negative"],
  },
  unit: {
    type: String,
    default: "pcs",
    trim: true,
  },
  location: {
    type: String,
    trim: true,
    default: "Main Warehouse",
  },
  status: {
    type: String,
    enum: ["active", "inactive"],
    default: "active",
  },
  tags: {
    type: [String],
    default: [],
  },
  image: {
    type: String, // URL or filename
    default: null,
  },
  description: {
    type: String,
    trim: true,
  },
  expiryDate: {
    type: Date,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

inventorySchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

const Inventory = mongoose.model("Inventory", inventorySchema);
export default Inventory;
