const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
    name: { type: String, required: true },
    address: { type: String, required: true },
    phone: { type: String, required: true },
    paymentMethod: { type: String, required: true },
    cartItems: { type: Array, required: true },
    totalAmount: { type: Number, required: true },
    status: { type: String, default: "Pending" }, // Order status
    date: { type: Date, default: Date.now }
});

const Order = mongoose.model('Order', OrderSchema);
module.exports = Order;
