import React, { useEffect, useState } from "react";
import axiosInstance from "../utils/api";
import { useNavigate } from "react-router-dom";
import { 
  FiAlertTriangle, 
  FiTrendingUp, 
  FiPackage, 
  FiShoppingCart, 
  FiCreditCard,
  FiBox,
  FiDatabase,
  FiAward,
  FiRefreshCw
} from "react-icons/fi";

const Summary = () => {
  const [dashboardData, setDashboardData] = useState({
    totalProducts: 0,
    totalStock: 0,
    ordersToday: 0,
    revenue: 0,
    outOfStock: [],
    highestSaleProduct: null,
    lowStock: [],
  });
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);
  const navigate = useNavigate();

  // Format currency in Indian Rupees with proper symbol
  const formatRupee = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount).replace('₹', '₹ ');
  };

  // Function to refresh dashboard data
  const refreshDashboard = () => {
    setRefreshKey(prev => prev + 1);
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        const response = await axiosInstance.get("/dashboard", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("ims_token")}`,
          },
        });
        setDashboardData(response.data);
      } catch (err) {
        if(!err.response?.data?.success) {
          navigate('/login');
        }
        console.error("Dashboard error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, [refreshKey, navigate]);

  if(loading) return (
    <div className="flex items-center justify-center h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Inventory Dashboard</h1>
          <p className="text-gray-600 mt-1">Business overview and analytics</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-sm text-gray-600 bg-white px-4 py-2 rounded-lg shadow-xs border border-gray-200">
            {new Date().toLocaleDateString('en-IN', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'short', 
              day: 'numeric' 
            })}
          </div>
          <button 
            onClick={refreshDashboard}
            className="p-2 bg-white rounded-lg shadow-xs border border-gray-200 hover:bg-gray-50 transition-colors"
            title="Refresh dashboard"
          >
            <FiRefreshCw className="text-gray-600" />
          </button>
        </div>
      </div>

      {/* Top Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {/* Total Products */}
        <div className="bg-white p-5 rounded-xl shadow-xs border border-gray-100 group hover:border-indigo-100 transition-colors">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">Total Products</p>
              <h3 className="text-2xl font-bold text-gray-800">{dashboardData.totalProducts}</h3>
            </div>
            <div className="p-3 rounded-lg bg-indigo-50 text-indigo-600">
              <FiPackage size={20} />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-gray-100">
            <span className="text-xs font-medium text-gray-500">Across all categories</span>
          </div>
        </div>
        
        {/* Total Stock */}
        <div className="bg-white p-5 rounded-xl shadow-xs border border-gray-100 group hover:border-emerald-100 transition-colors">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">Total Stock</p>
              <h3 className="text-2xl font-bold text-gray-800">{dashboardData.totalStock}</h3>
            </div>
            <div className="p-3 rounded-lg bg-emerald-50 text-emerald-600">
              <FiDatabase size={20} />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-gray-100">
            <span className="text-xs font-medium text-gray-500">Units available</span>
          </div>
        </div>
        
        {/* Orders Today */}
        <div className="bg-white p-5 rounded-xl shadow-xs border border-gray-100 group hover:border-amber-100 transition-colors">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">Orders Today</p>
              <h3 className="text-2xl font-bold text-gray-800">{dashboardData.ordersToday}</h3>
            </div>
            <div className="p-3 rounded-lg bg-amber-50 text-amber-600">
              <FiShoppingCart size={20} />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-gray-100">
            <span className="text-xs font-medium text-gray-500">Transactions processed</span>
          </div>
        </div>
        
        {/* Revenue */}
        <div className="bg-white p-5 rounded-xl shadow-xs border border-gray-100 group hover:border-purple-100 transition-colors">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">Today's Revenue</p>
              <h3 className="text-2xl font-bold text-gray-800">{formatRupee(dashboardData.revenue)}</h3>
            </div>
            <div className="p-3 rounded-lg bg-purple-50 text-purple-600">
              <FiCreditCard size={20} />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-gray-100">
            <span className="text-xs font-medium text-gray-500">Gross sales value</span>
          </div>
        </div>
      </div>

      {/* Bottom Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Out of Stock Products */}
        <div className="bg-white p-5 rounded-xl shadow-xs border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-800">Out of Stock</h3>
              <p className="text-xs text-gray-500">Require immediate attention</p>
            </div>
            <div className="p-2 rounded-lg bg-red-50 text-red-600">
              <FiAlertTriangle size={18} />
            </div>
          </div>
          
          {dashboardData.outOfStock.length > 0 ? (
            <div className="space-y-3">
              {dashboardData.outOfStock.slice(0, 5).map((product, index) => (
                <div key={index} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-gray-100 rounded-lg mr-3 flex items-center justify-center">
                      <FiBox className="text-gray-500" size={14} />
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">{product.name}</p>
                      <p className="text-xs text-gray-500">{product.category?.name || 'General'}</p>
                    </div>
                  </div>
                  <span className="px-2 py-1 text-xs font-medium bg-red-50 text-red-700 rounded-full">0 left</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6">
              <div className="mx-auto w-14 h-14 flex items-center justify-center bg-emerald-50 text-emerald-600 rounded-full mb-3">
                <FiAward size={24} />
              </div>
              <p className="text-gray-500 text-sm">All products are in stock</p>
              <p className="text-gray-400 text-xs mt-1">Excellent inventory levels</p>
            </div>
          )}
        </div>

        {/* Top Performing Product */}
        <div className="bg-white p-5 rounded-xl shadow-xs border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-800">Top Performer</h3>
              <p className="text-xs text-gray-500">Today's sales leader</p>
            </div>
            <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
              <FiTrendingUp size={18} />
            </div>
          </div>
          
          {dashboardData.highestSaleProduct?.name ? (
            <div>
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg mr-4 flex items-center justify-center border border-blue-100">
                  <FiPackage className="text-blue-600" size={20} />
                </div>
                <div>
                  <h4 className="font-bold text-gray-800">{dashboardData.highestSaleProduct.name}</h4>
                  <p className="text-xs text-gray-500">{dashboardData.highestSaleProduct.category?.name || 'General'}</p>
                </div>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                <div className="mb-3">
                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                    <div 
                      className="h-1.5 rounded-full bg-gradient-to-r from-blue-400 to-indigo-500" 
                      style={{ 
                        width: `${Math.min(
                          100, 
                          (dashboardData.highestSaleProduct.totalQuantity / 
                          Math.max(1, dashboardData.ordersToday)) * 100
                        )}%` 
                      }}
                    ></div>
                  </div>
                </div>
                
                <div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                    <div 
                      className="h-1.5 rounded-full bg-gradient-to-r from-purple-400 to-fuchsia-500" 
                      style={{ 
                        width: `${Math.min(
                          100, 
                          ((dashboardData.highestSaleProduct.totalRevenue || 0) / 
                          Math.max(1, dashboardData.revenue)) * 100
                        )}%` 
                      }}
                    ></div>
                  </div>
                </div>
              </div>
              
              {dashboardData.ordersToday > 0 && (
                <div className="mt-3 text-center">
                  <p className="text-xs text-gray-500">
                    Contributes <span className="font-medium text-blue-600">
                      {Math.round(
                        (dashboardData.highestSaleProduct.totalQuantity / 
                        dashboardData.ordersToday) * 100
                      )}%
                    </span> of today's orders
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-6">
              <div className="mx-auto w-14 h-14 flex items-center justify-center bg-gray-50 text-gray-400 rounded-full mb-3">
                <FiTrendingUp size={24} />
              </div>
              <p className="text-gray-500 text-sm">No sales data available</p>
              <p className="text-gray-400 text-xs mt-1">Check back later for updates</p>
            </div>
          )}
        </div>

        {/* Low Stock Products */}
        <div className="bg-white p-5 rounded-xl shadow-xs border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-800">Low Stock</h3>
              <p className="text-xs text-gray-500">Items needing restock</p>
            </div>
            <div className="p-2 rounded-lg bg-amber-50 text-amber-600">
              <FiAlertTriangle size={18} />
            </div>
          </div>
          
          {dashboardData.lowStock.length > 0 ? (
            <div className="space-y-3">
              {dashboardData.lowStock.slice(0, 5).map((product, index) => (
                <div key={index} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-gray-100 rounded-lg mr-3 flex items-center justify-center">
                      <FiBox className="text-gray-500" size={14} />
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">{product.name}</p>
                      <p className="text-xs text-gray-500">{product.category?.name || 'General'}</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full mb-1 ${
                      product.stock < 3 ? 'bg-red-50 text-red-700' : 'bg-amber-50 text-amber-700'
                    }`}>
                      {product.stock} left
                    </span>
                    <div className="w-20 bg-gray-200 rounded-full h-1.5">
                      <div 
                        className={`h-1.5 rounded-full ${
                          product.stock < 3 ? 'bg-red-500' : 'bg-amber-500'
                        }`} 
                        style={{ width: `${Math.min(100, (product.stock / 10) * 100)}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6">
              <div className="mx-auto w-14 h-14 flex items-center justify-center bg-emerald-50 text-emerald-600 rounded-full mb-3">
                <FiAward size={24} />
              </div>
              <p className="text-gray-500 text-sm">No low stock products</p>
              <p className="text-gray-400 text-xs mt-1">Inventory levels are healthy</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Summary;