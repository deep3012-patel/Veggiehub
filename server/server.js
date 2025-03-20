require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const Contact = require('../models/Contact'); // Import the model

const Order = require('../models/order'); // Import the Order model
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Vendor = require("../models/Vendor");


const SECRET_KEY = "your_secret_key";


const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public')); // Serve static files

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.log('MongoDB Connection Error:', err));


// Handle Contact Form Submission
app.post('/contact', async (req, res) => {
    try {
        const { name, email, subject, message } = req.body;
        const newContact = new Contact({ name, email, subject, message });
        await newContact.save();
        res.json({ success: true, message: 'Your message has been sent successfully!' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error saving data', error });
    }
});

app.post('/checkout', async (req, res) => {
    try {
        const { name, address, phone, paymentMethod, cartItems, totalAmount } = req.body;

        const newOrder = new Order({
            name,
            address,
            phone,
            paymentMethod,
            cartItems,
            totalAmount
        });

        await newOrder.save();
        res.json({ success: true, message: "Order placed successfully!" });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error saving order", error });
    }
});


app.get('/track-order/:id', async (req, res) => {
    try {
        const orderId = req.params.id;

        // Convert string ID to ObjectId
        if (!mongoose.Types.ObjectId.isValid(orderId)) {
            return res.json({ success: false, message: "Invalid Order ID" });
        }

        const order = await Order.findById(orderId);

        if (!order) {
            return res.json({ success: false, message: "Order Not Found" });
        }

        res.json({ success: true, order });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error fetching order", error });
    }
});

// Vendor Registration
app.post("/vendor/register", async (req, res) => {
    try {
        const { name, email, password, businessName } = req.body;

        const existingVendor = await Vendor.findOne({ email });
        if (existingVendor) return res.status(400).json({ message: "Vendor already exists" });

        const hashedPassword = await bcrypt.hash(password, 10);
        const newVendor = new Vendor({ name, email, password: hashedPassword, businessName, products: [] });

        await newVendor.save();
        res.json({ success: true, message: "Vendor registered successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error registering vendor", error });
    }
});

// Vendor Login
app.post("/vendor/login", async (req, res) => {
    try {
        const { email, password } = req.body;
        const vendor = await Vendor.findOne({ email });

        if (!vendor) return res.status(400).json({ message: "Vendor not found" });

        const isMatch = await bcrypt.compare(password, vendor.password);
        if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

        const token = jwt.sign({ vendorId: vendor._id }, SECRET_KEY, { expiresIn: "1h" });
        res.json({ success: true, token, vendor });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error logging in", error });
    }
});

// Vendor adds a product
app.post("/vendor/add-product", async (req, res) => {
    try {
        const { vendorId, name, price, stock, image } = req.body;

        const vendor = await Vendor.findById(vendorId);
        if (!vendor) return res.status(404).json({ message: "Vendor not found" });

        vendor.products.push({ name, price, stock, image });
        await vendor.save();

        res.json({ success: true, message: "Product added successfully", vendor });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error adding product", error });
    }
});

// Get all vendor products
app.get("/vendor/products", async (req, res) => {
    try {
        const vendors = await Vendor.find();
        const products = vendors.flatMap(vendor => vendor.products.map(p => ({ ...p, vendor: vendor.businessName })));

        res.json({ success: true, products });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error fetching products", error });
    }
});




// Start the Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
