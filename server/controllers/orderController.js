// controllers/orderController.js
import Product from "../models/Product.js";
import Order from "../models/Order.js";

const addOrder = async (req, res) => {
  try {
    const { products, totalAmount } = req.body; // products = [{ productId, quantity }]
    const userId = req.user._id;

    const orderItems = [];

    for (let item of products) {
      const product = await Product.findById(item.productId);
      if (!product) {
        return res.status(404).json({ error: `Product with ID ${item.productId} not found` });
      }

      if (item.quantity > product.stock) {
        return res.status(400).json({ error: `Not enough stock for product ${product.name}` });
      }

      // Deduct stock
      product.stock -= item.quantity;
      await product.save();

      // Push order item
      orderItems.push({
        product: item.productId,
        quantity: item.quantity,
        price: product.price
      });
    }

    // Create order
    const order = new Order({
      user: userId,
      products: orderItems,
      totalAmount
    });

    await order.save();

    res.status(201).json({ success: true, message: "Order created successfully" });
  } catch (error) {
    res.status(500).json({ success: false, error: "Server error" });
  }
};

const getOrders = async (req, res) => {
  try {
    const { id } = req.params;
    const userRole = req.user.role;

    let query = {};
    if (userRole === 'user') {
      query = { user: id };
    }

    const orders = await Order.find(query)
      .populate({
        path: 'products.product',
        populate: {
          path: 'category',
          select: 'name'
        },
        select: 'name'
      })
      .populate({
        path: 'user',
        select: 'name address'
      })
      .sort({ orderDate: -1 });

    res.status(200).json({ success: true, orders });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to fetch orders' });
  }
};




export {addOrder, getOrders}