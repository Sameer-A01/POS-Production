import React, { useState, useEffect } from 'react';
import axiosInstance from '../utils/api';
import { useAuth } from '../context/AuthContext';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  // Fetch orders for the user
  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      try {
        const response = await axiosInstance.get(`/order/${user.userId}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('ims_token')}`,
          },
        });
        if (response.data.success) {
          setOrders(response.data.orders);
        }
      } catch (err) {
        alert(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [user.userId]); // Refetch if userId changes

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">
        {user.role === 'admin' ? 'Orders' : 'My Orders'}
      </h1>

      {loading && <p className="text-gray-500 mb-4">Loading...</p>}

      {/* Orders Table */}
      <div className="overflow-x-auto bg-white rounded-lg shadow">
        <table className="min-w-full">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2 text-left">S NO</th>
              {user.role === 'admin' && (
                <>
                  <th className="p-2 text-left">Name</th>
                  <th className="p-2 text-left">Address</th>
                </>
              )}
              <th className="p-2 text-left">Product Name</th>
              <th className="p-2 text-left">Category</th>
              <th className="p-2 text-left">Quantity</th>
              <th className="p-2 text-left">Total Price</th>
              <th className="p-2 text-left">Order Date</th>
            </tr>
          </thead>
          <tbody>
  {orders.length > 0 ? (
    // Create a flat counter outside map
    orders.flatMap((order, orderIndex) =>
      order.products.map((item, productIndex, productArray) => {
        const flatIndex =
          orders
            .slice(0, orderIndex)
            .reduce((acc, curr) => acc + curr.products.length, 0) + productIndex + 1;

        return (
          <tr
            key={`${order._id}-${productIndex}`}
            className={`${
              flatIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'
            } border-b hover:bg-gray-100 transition-colors`}
          >
            {/* Correct Serial Number */}
            <td className="p-3 font-medium text-gray-700">#{flatIndex}</td>

            {user.role === 'admin' && (
              <>
                <td className="p-3 text-gray-700">{order.user?.name || 'N/A'}</td>
                <td className="p-3 text-gray-700">{order.user?.address || 'N/A'}</td>
              </>
            )}

            <td className="p-3 text-gray-900 font-semibold">
              {item.product?.name || 'Product Name Not Available'}
            </td>
            <td className="p-3 text-gray-600 italic">
              {item.product?.category?.name || 'Category Not Available'}
            </td>
            <td className="p-3 text-center">{item.quantity}</td>
            <td className="p-3 text-green-700 font-medium">
              ${item.price && item.quantity ? (item.price * item.quantity).toFixed(2) : '0.00'}
            </td>
            <td className="p-3 text-sm text-gray-500">
              {order.orderDate ? new Date(order.orderDate).toLocaleDateString() : 'N/A'}
            </td>
          </tr>
        );
      })
    )
  ) : (
    <tr>
      <td colSpan={user.role === 'admin' ? 7 : 5} className="text-center p-4 text-gray-500">
        No orders found
      </td>
    </tr>
  )}
</tbody>



        </table>
      </div>
    </div>
  );
};

export default Orders;
