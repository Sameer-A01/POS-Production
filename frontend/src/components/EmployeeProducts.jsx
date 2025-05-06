import React, { useState, useEffect, useRef } from "react";
import axiosInstance from "../utils/api";
import { ShoppingCart, X, Plus, Minus, Printer, Settings, Search, Tag, Package, DollarSign } from "lucide-react";

const POSPage = () => {
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [orderData, setOrderData] = useState({
    products: [],
    totalAmount: 0,
  });
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showBill, setShowBill] = useState(false);
  const [companyInfo, setCompanyInfo] = useState({
    name: localStorage.getItem("company_name") || "My Store",
    address: localStorage.getItem("company_address") || "123 Business Street",
    phone: localStorage.getItem("company_phone") || "555-123-4567",
    email: localStorage.getItem("company_email") || "contact@mystore.com",
    taxRate: localStorage.getItem("company_taxRate") || "18",
  });
  const [showSettings, setShowSettings] = useState(false);
  
  const billRef = useRef(null);

  // Get user from localStorage
  const user = JSON.parse(localStorage.getItem("ims_user"));
  const userId = user?._id;
  const userName = user?.name;

  // Generate invoice number
  const invoiceNum = `INV-${Date.now().toString().substr(-6)}`;

  // Fetch products from server
  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get("/products", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("ims_token")}`,
        },
      });
      if (response.data.success) {
        setCategories(response.data.categories);
        setProducts(response.data.products);
        setFilteredProducts(response.data.products);
      }
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  // On component mount
  useEffect(() => {
    fetchProducts();
    // Load cart from localStorage
    const savedCart = localStorage.getItem("ims_cart");
    if (savedCart) {
      setOrderData(JSON.parse(savedCart));
    }
  }, []);

  // Save cart to localStorage whenever orderData changes
  useEffect(() => {
    localStorage.setItem("ims_cart", JSON.stringify(orderData));
  }, [orderData]);

  const handleFilterProducts = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    setFilteredProducts(
      products.filter((product) =>
        product.name.toLowerCase().includes(query.toLowerCase())
      )
    );
  };

  const handleChangeCategory = (categoryId) => {
    if (categoryId === selectedCategory) {
      // If clicking the same category, show all products
      setSelectedCategory("");
      setFilteredProducts(products);
    } else {
      setFilteredProducts(
        products.filter((product) => product.category._id === categoryId)
      );
      setSelectedCategory(categoryId);
    }
  };

  const handleOrderClick = (product) => {
    const existingProductIndex = orderData.products.findIndex(
      (item) => item.productId === product._id
    );

    if (existingProductIndex >= 0) {
      const updatedOrder = [...orderData.products];
      updatedOrder[existingProductIndex].quantity += 1;

      const updatedTotalAmount = updatedOrder.reduce(
        (total, item) =>
          total + item.quantity * products.find((p) => p._id === item.productId).price,
        0
      );

      setOrderData({
        products: updatedOrder,
        totalAmount: updatedTotalAmount,
      });
    } else {
      setOrderData({
        products: [
          ...orderData.products,
          { productId: product._id, quantity: 1 },
        ],
        totalAmount: orderData.totalAmount + product.price,
      });
    }
  };

  const handleQuantityChange = (productId, quantity) => {
    const product = products.find(p => p._id === productId);
    if (quantity > product.stock) return;
    
    if (quantity < 1) {
      handleRemoveProduct(productId);
      return;
    }
    
    const updatedProducts = orderData.products.map((item) =>
      item.productId === productId
        ? { ...item, quantity }
        : item
    );

    const updatedTotalAmount = updatedProducts.reduce(
      (total, item) =>
        total + item.quantity * products.find((p) => p._id === item.productId).price,
      0
    );

    setOrderData({ products: updatedProducts, totalAmount: updatedTotalAmount });
  };

  const handleRemoveProduct = (productId) => {
    const updatedProducts = orderData.products.filter(
      (item) => item.productId !== productId
    );

    const updatedTotalAmount = updatedProducts.reduce(
      (total, item) =>
        total + item.quantity * products.find((p) => p._id === item.productId).price,
      0
    );

    setOrderData({ products: updatedProducts, totalAmount: updatedTotalAmount });
  };

  const handleOrderSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axiosInstance.post(
        "/order/add",
        { products: orderData.products, totalAmount: orderData.totalAmount },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("ims_token")}`,
          },
        }
      );
      if (response.data.success) {
        setShowBill(true);
        // Keep the order data for bill display
      }
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePrintBill = () => {
    // Create a new window for printing to avoid header/footer issues
    const printWindow = window.open('', '_blank');
    
    // Create clean HTML with only what we need
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Invoice - ${companyInfo.name}</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 20px;
            color: #333;
          }
          .invoice-container {
            max-width: 800px;
            margin: 0 auto;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
          }
          th, td {
            padding: 8px;
            text-align: left;
            border-bottom: 1px solid #ddd;
          }
          th {
            background-color: #f8f9fa;
          }
          .text-right {
            text-align: right;
          }
          .text-center {
            text-align: center;
          }
          .company-header {
            text-align: center;
            margin-bottom: 30px;
          }
          .company-header h1 {
            margin-bottom: 5px;
          }
          .invoice-details {
            display: flex;
            justify-content: space-between;
            margin-bottom: 30px;
          }
          .summary-table {
            width: 250px;
            margin-left: auto;
          }
          .summary-row {
            display: flex;
            justify-content: space-between;
            padding: 5px 0;
          }
          .summary-row.total {
            font-weight: bold;
            border-top: 1px solid #ddd;
            padding-top: 10px;
            margin-top: 5px;
          }
          .footer {
            text-align: center;
            margin-top: 50px;
            color: #777;
          }
          @media print {
            @page {
              size: auto;
              margin: 10mm;
            }
          }
        </style>
      </head>
      <body>
        <div class="invoice-container">
          <div class="company-header">
            <h1>${companyInfo.name}</h1>
            <p>${companyInfo.address}</p>
            <p>Phone: ${companyInfo.phone} | Email: ${companyInfo.email}</p>
          </div>
          
          <div class="invoice-details">
            <div>
              <p><strong>Invoice #:</strong> ${invoiceNum}</p>
              <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
              <p><strong>Time:</strong> ${new Date().toLocaleTimeString()}</p>
            </div>
            <div>
              <p><strong>Cashier:</strong> ${userName || 'Admin'}</p>
            </div>
          </div>
          
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Item</th>
                <th class="text-right">Price</th>
                <th class="text-right">Qty</th>
                <th class="text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              ${orderData.products.map((item, index) => {
                const product = products.find((p) => p._id === item.productId);
                return `
                  <tr>
                    <td>${index + 1}</td>
                    <td>${product?.name}</td>
                    <td class="text-right">₹${product?.price.toFixed(2)}</td>
                    <td class="text-right">${item.quantity}</td>
                    <td class="text-right">₹${(product?.price * item.quantity).toFixed(2)}</td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
          
          <div class="summary-table">
            <div class="summary-row">
              <span>Subtotal:</span>
              <span>₹${orderData.totalAmount.toFixed(2)}</span>
            </div>
            <div class="summary-row">
              <span>GST (${companyInfo.taxRate}%):</span>
              <span>₹${calculateTax()}</span>
            </div>
            <div class="summary-row total">
              <span>Grand Total:</span>
              <span>₹${calculateGrandTotal()}</span>
            </div>
          </div>
          
          <div class="footer">
            <p>Thank you for your business!</p>
          </div>
        </div>
      </body>
      </html>
    `);
    
    // Give the browser a moment to process the document
    setTimeout(() => {
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
      printWindow.onafterprint = () => printWindow.close();
    }, 250);
  };

  const handleNewOrder = () => {
    setOrderData({ products: [], totalAmount: 0 });
    localStorage.removeItem("ims_cart");
    setShowBill(false);
  };

  const handleCompanyInfoChange = (e) => {
    const { name, value } = e.target;
    setCompanyInfo(prev => {
      const updated = { ...prev, [name]: value };
      localStorage.setItem(`company_${name}`, value);
      return updated;
    });
  };

  const calculateTax = () => {
    // Use the custom tax rate from company settings
    const taxRatePercent = parseFloat(companyInfo.taxRate) || 0;
    return (orderData.totalAmount * (taxRatePercent / 100)).toFixed(2);
  };

  const calculateGrandTotal = () => {
    return (parseFloat(orderData.totalAmount) + parseFloat(calculateTax())).toFixed(2);
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-blue-700 text-white p-4 shadow-md">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold">{companyInfo.name} POS</h1>
            {userName && (
              <p className="text-sm bg-blue-600 px-3 py-1 rounded-full">
                Cashier: {userName}
              </p>
            )}
          </div>
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => setShowSettings(!showSettings)}
              className="flex items-center space-x-1 bg-blue-800 hover:bg-blue-900 px-3 py-2 rounded-md"
            >
              <Settings size={18} />
              <span>Settings</span>
            </button>
          </div>
        </div>
      </header>

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Company Settings</h2>
              <button onClick={() => setShowSettings(false)} className="text-gray-500 hover:text-gray-700">
                <X size={24} />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
                <input
                  type="text"
                  name="name"
                  value={companyInfo.name}
                  onChange={handleCompanyInfoChange}
                  className="w-full p-2 border rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <input
                  type="text"
                  name="address"
                  value={companyInfo.address}
                  onChange={handleCompanyInfoChange}
                  className="w-full p-2 border rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input
                  type="text"
                  name="phone"
                  value={companyInfo.phone}
                  onChange={handleCompanyInfoChange}
                  className="w-full p-2 border rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  name="email"
                  value={companyInfo.email}
                  onChange={handleCompanyInfoChange}
                  className="w-full p-2 border rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">GST Rate (%)</label>
                <input
                  type="number"
                  name="taxRate"
                  min="0"
                  max="100"
                  step="0.1"
                  value={companyInfo.taxRate}
                  onChange={handleCompanyInfoChange}
                  className="w-full p-2 border rounded"
                />
              </div>
              <button
                onClick={() => setShowSettings(false)}
                className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
              >
                Save Settings
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bill Modal */}
      {showBill && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-40">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-screen overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Invoice</h2>
              <button onClick={handleNewOrder} className="text-gray-500 hover:text-gray-700">
                <X size={24} />
              </button>
            </div>
            
            <div ref={billRef} className="p-6 border rounded-lg">
              {/* Bill Header */}
              <div className="text-center mb-6">
                <h1 className="text-2xl font-bold">{companyInfo.name}</h1>
                <p className="text-gray-600">{companyInfo.address}</p>
                <p className="text-gray-600">Phone: {companyInfo.phone}</p>
                <p className="text-gray-600">Email: {companyInfo.email}</p>
              </div>
              
              <div className="flex justify-between mb-6">
                <div>
                  <p className="font-semibold">Invoice #: {invoiceNum}</p>
                  <p className="text-gray-600">Date: {new Date().toLocaleDateString()}</p>
                  <p className="text-gray-600">Time: {new Date().toLocaleTimeString()}</p>
                </div>
                <div>
                  <p className="text-gray-600">Cashier: {userName}</p>
                </div>
              </div>
              
              <table className="w-full mb-6">
                <thead>
                  <tr className="border-b border-gray-300">
                    <th className="text-left py-2">#</th>
                    <th className="text-left py-2">Item</th>
                    <th className="text-right py-2">Price</th>
                    <th className="text-right py-2">Qty</th>
                    <th className="text-right py-2">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {orderData.products.map((item, index) => {
                    const product = products.find((p) => p._id === item.productId);
                    return (
                      <tr key={index} className="border-b border-gray-200">
                        <td className="py-2">{index + 1}</td>
                        <td className="py-2">{product?.name}</td>
                        <td className="text-right py-2">₹{product?.price.toFixed(2)}</td>
                        <td className="text-right py-2">{item.quantity}</td>
                        <td className="text-right py-2">₹{(product?.price * item.quantity).toFixed(2)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              
              <div className="flex justify-end">
                <div className="w-64">
                  <div className="flex justify-between py-1">
                    <span>Subtotal:</span>
                    <span>₹{orderData.totalAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span>GST ({companyInfo.taxRate}%):</span>
                    <span>₹{calculateTax()}</span>
                  </div>
                  <div className="flex justify-between py-2 font-bold border-t border-gray-300 mt-1">
                    <span>Grand Total:</span>
                    <span>₹{calculateGrandTotal()}</span>
                  </div>
                </div>
              </div>
              
              <div className="text-center mt-8 text-gray-600">
                <p>Thank you for your business!</p>
              </div>
            </div>
            
            <div className="mt-6 flex justify-end space-x-4">
              <button 
                onClick={handlePrintBill}
                className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
              >
                <Printer size={18} />
                <span>Print Invoice</span>
              </button>
              <button 
                onClick={handleNewOrder}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
              >
                New Order
              </button>
            </div>
          </div>
        </div>
      )}

      {!showBill && (
        <div className="flex flex-1 overflow-hidden">
          {/* Left side - Products */}
          <div className="w-8/12 flex flex-col bg-white shadow-lg">
            {/* Search and filter */}
            <div className="p-4 border-b">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search size={18} className="text-gray-400" />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={handleFilterProducts}
                  placeholder="Search products..."
                  className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  disabled={loading}
                />
              </div>
            </div>
            
            {/* Categories */}
            <div className="px-4 py-3 border-b overflow-x-auto">
              <div className="flex space-x-2">
                {categories.map((category) => (
                  <button
                    key={category._id}
                    onClick={() => handleChangeCategory(category._id)}
                    className={`flex items-center px-3 py-2 rounded-md text-sm whitespace-nowrap ${
                      selectedCategory === category._id
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    <Tag size={14} className="mr-1" />
                    {category.name}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Products Grid */}
            <div className="flex-1 p-4 overflow-y-auto">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {filteredProducts.map((product) => (
                  <div
                    key={product._id}
                    onClick={() => product.stock > 0 && handleOrderClick(product)}
                    className={`border rounded-lg p-4 flex flex-col justify-between cursor-pointer transition-all ${
                      product.stock > 0
                        ? "hover:shadow-md hover:border-blue-300"
                        : "opacity-60 cursor-not-allowed"
                    }`}
                  >
                    <div>
                      <div className="bg-gray-100 p-2 rounded-md flex items-center justify-center mb-3">
                        <Package size={24} className="text-blue-600" />
                      </div>
                      <h3 className="font-medium text-gray-800">{product.name}</h3>
                      <div className="flex justify-between items-center mt-1">
                        <p className="text-blue-600 font-bold">₹{product.price.toFixed(2)}</p>
                        <p className={`text-xs px-2 py-1 rounded ${
                          product.stock > 10 
                            ? "bg-green-100 text-green-800" 
                            : product.stock > 0 
                              ? "bg-yellow-100 text-yellow-800" 
                              : "bg-red-100 text-red-800"
                        }`}>
                          Stock: {product.stock}
                        </p>
                      </div>
                    </div>
                    {product.stock > 0 && (
                      <button
                        className="mt-3 bg-blue-50 text-blue-600 border border-blue-200 px-2 py-1 rounded-md text-sm hover:bg-blue-100 flex items-center justify-center"
                      >
                        <Plus size={16} className="mr-1" /> Add to Cart
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {/* Right side - Order */}
          <div className="w-4/12 bg-gray-50 border-l border-gray-200 flex flex-col">
            {/* Order Header */}
            <div className="p-4 border-b bg-white">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold flex items-center">
                  <ShoppingCart size={20} className="mr-2 text-blue-600" />
                  Current Order
                </h2>
                {orderData.products.length > 0 && (
                  <button
                    onClick={() => setOrderData({ products: [], totalAmount: 0 })}
                    className="text-xs bg-gray-200 hover:bg-gray-300 text-gray-600 px-2 py-1 rounded"
                  >
                    Clear All
                  </button>
                )}
              </div>
            </div>
            
            {/* Order Items */}
            <div className="flex-1 overflow-y-auto p-4">
              {orderData.products.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-gray-500">
                  <ShoppingCart size={48} className="mb-4 opacity-30" />
                  <p>Your cart is empty</p>
                  <p className="text-sm mt-2">Add products to get started</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {orderData.products.map((item, index) => {
                    const product = products.find((p) => p._id === item.productId);
                    return (
                      <div key={index} className="flex items-center bg-white p-3 rounded-lg shadow-sm">
                        <div className="flex-1">
                          <h4 className="font-medium">{product?.name}</h4>
                          <p className="text-sm text-gray-600">₹{product?.price.toFixed(2)} each</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleQuantityChange(item.productId, item.quantity - 1)}
                            className="w-8 h-8 flex items-center justify-center bg-gray-200 rounded-full hover:bg-gray-300"
                          >
                            <Minus size={16} />
                          </button>
                          <span className="w-8 text-center">{item.quantity}</span>
                          <button
                            onClick={() => handleQuantityChange(item.productId, item.quantity + 1)}
                            disabled={item.quantity >= product?.stock}
                            className={`w-8 h-8 flex items-center justify-center rounded-full ${
                              item.quantity >= product?.stock
                                ? "bg-gray-200 text-gray-400"
                                : "bg-gray-200 hover:bg-gray-300"
                            }`}
                          >
                            <Plus size={16} />
                          </button>
                        </div>
                        <div className="w-20 text-right font-medium">
                          ₹{(product?.price * item.quantity).toFixed(2)}
                        </div>
                        <button
                          onClick={() => handleRemoveProduct(item.productId)}
                          className="ml-2 text-red-500 hover:text-red-700"
                        >
                          <X size={18} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
            
            {/* Order Summary */}
            <div className="p-4 bg-white border-t">
              <div className="space-y-2">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>₹{orderData.totalAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>GST ({companyInfo.taxRate}%)</span>
                  <span>₹{calculateTax()}</span>
                </div>
                <div className="border-t pt-2 mt-2 flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span className="text-blue-700">₹{calculateGrandTotal()}</span>
                </div>
              </div>
              
              {/* Place Order Button */}
              <button
                onClick={handleOrderSubmit}
                disabled={orderData.products.length === 0 || loading}
                className="w-full mt-4 flex items-center justify-center bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white py-3 rounded-lg font-medium"
              >
                <DollarSign size={18} className="mr-2" />
                {loading ? "Processing..." : "Checkout"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default POSPage;