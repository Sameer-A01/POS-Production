import React, { useState, useEffect } from "react";
import axiosInstance from "../utils/api";

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

  // Get user from localStorage
  const user = JSON.parse(localStorage.getItem("ims_user"));
  const userId = user?._id;
  const userName = user?.name;

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
    setFilteredProducts(
      products.filter((product) =>
        product.name.toLowerCase().includes(e.target.value.toLowerCase())
      )
    );
  };

  const handleChangeCategory = (e) => {
    setFilteredProducts(
      products.filter((product) => product.category._id === e.target.value)
    );
    setSelectedCategory(e.target.value);
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
        alert("Order placed successfully!");
        setOrderData({ products: [], totalAmount: 0 });
        localStorage.removeItem("ims_cart"); // Clear cart after order
        fetchProducts();
      }
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-start h-screen bg-gray-100">
      <div className="w-full sm:w-3/4 md:w-2/3 lg:w-1/2 xl:w-1/3 p-4 bg-white rounded-md shadow-lg">
        <h1 className="text-2xl font-bold mb-4">POS System</h1>
        {userName && (
          <p className="text-lg text-gray-700 mb-4">
            Welcome, <span className="font-semibold">{userName}</span>
          </p>
        )}

        {/* Search and Category Filter */}
        <div className="flex gap-4 mb-6">
          <input
            type="text"
            placeholder="Search products..."
            onChange={handleFilterProducts}
            className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={loading}
          />
          <select
            value={selectedCategory}
            onChange={handleChangeCategory}
            className="p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={loading}
          >
            <option value="">All Categories</option>
            {categories.map((category) => (
              <option key={category._id} value={category._id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-6">
          {filteredProducts.map((product) => (
            <div
              key={product._id}
              className="border rounded-lg p-4 flex flex-col items-center justify-between bg-gray-50"
            >
              <h3 className="text-md font-semibold">{product.name}</h3>
              <p className="text-sm text-gray-600">${product.price}</p>
              <p className="text-sm text-gray-600">Stock: {product.stock}</p>
              <button
                onClick={() => handleOrderClick(product)}
                className="bg-blue-500 text-white px-4 py-2 rounded-md mt-4 hover:bg-blue-600 disabled:bg-blue-300"
                disabled={loading || product.stock === 0}
              >
                Add to Order
              </button>
            </div>
          ))}
        </div>

        {/* Order Summary */}
        <div className="mt-6">
          <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
          {orderData.products.length === 0 ? (
            <p className="text-center text-gray-500">No items in order</p>
          ) : (
            <div className="space-y-2">
              {orderData.products.map((item, index) => {
                const product = products.find((p) => p._id === item.productId);
                return (
                  <div key={index} className="flex justify-between items-center gap-2">
                    <span>{product?.name}</span>
                    <div className="flex gap-2 items-center">
                      <button
                        onClick={() => handleQuantityChange(item.productId, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                        className="bg-gray-200 text-gray-700 p-1 rounded"
                      >
                        -
                      </button>
                      <span>{item.quantity}</span>
                      <button
                        onClick={() => handleQuantityChange(item.productId, item.quantity + 1)}
                        disabled={item.quantity >= product?.stock}
                        className="bg-gray-200 text-gray-700 p-1 rounded"
                      >
                        +
                      </button>
                    </div>
                    <span>${product?.price * item.quantity}</span>
                    <button
                      onClick={() => handleRemoveProduct(item.productId)}
                      className="text-red-500 font-bold text-lg hover:text-red-700"
                      title="Remove"
                    >
                      &times;
                    </button>
                  </div>
                );
              })}
              <div className="flex justify-between items-center font-semibold mt-4">
                <span>Total</span>
                <span>${orderData.totalAmount}</span>
              </div>
            </div>
          )}
        </div>

        {/* Order Button */}
        <div className="mt-6">
          <button
            onClick={handleOrderSubmit}
            className="w-full bg-green-500 text-white py-3 rounded-md hover:bg-green-600 disabled:bg-green-300"
            disabled={orderData.products.length === 0 || loading}
          >
            Place Order
          </button>
        </div>
      </div>
    </div>
  );
};

export default POSPage;
