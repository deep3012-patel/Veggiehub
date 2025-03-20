const mongoose = require("mongoose");

const VendorSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    businessName: { type: String, required: true },
    products: [
        {
            name: String,
            price: Number,
            stock: Number,
            image: String
        }
    ]
});

const Vendor = mongoose.model("Vendor", VendorSchema);
module.exports = Vendor;
