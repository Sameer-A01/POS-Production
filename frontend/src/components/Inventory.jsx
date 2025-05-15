import React, { useState, useEffect } from 'react';
import axiosInstance from "../utils/api";
import { toast } from 'react-toastify';

const Inventory = () => {
  const [inventoryItems, setInventoryItems] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    category: 'Ingredient',
    quantity: 0,
    unit: 'kg',
    minStockLevel: 0,
    supplier: '',
    costPerUnit: 0,
    expiryDate: '',
    notes: '',
    reorderFrequency: 'As Needed',
    storageConditions: 'Dry',
    stockResetDate: ''
  });
  const [editMode, setEditMode] = useState(false);
  const [currentItemId, setCurrentItemId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all');

  const categories = [
    "Ingredient", "Beverage", "Equipment", "Cleaning", 
    "Packaging", "Storage", "Other"
  ];
  
  const units = [
    "kg", "g", "l", "ml", "unit", "pack", 
    "box", "bottle", "can", "bag", "other"
  ];

  useEffect(() => {
    fetchInventoryItems();
    fetchSuppliers();
  }, []);

  const fetchInventoryItems = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/inventory');
      
      // Check and reset stock if reset date has passed
      const now = new Date();
      const itemsToUpdate = response.data.filter(item => 
        item.stockResetDate && new Date(item.stockResetDate) <= now
      );

      if (itemsToUpdate.length > 0) {
        await Promise.all(itemsToUpdate.map(async (item) => {
          await axiosInstance.put(`/inventory/${item._id}`, {
            quantity: 0,
            stockResetDate: null
          });
        }));
        // Refetch after updates
        const updatedResponse = await axiosInstance.get('/inventory');
        setInventoryItems(updatedResponse.data);
      } else {
        setInventoryItems(response.data);
      }

      setLoading(false);
    } catch (error) {
      setError(error.message);
      setLoading(false);
      toast.error('Failed to fetch inventory items');
    }
  };

  const fetchSuppliers = async () => {
    try {
      const response = await axiosInstance.get('/supply');
      setSuppliers(response.data.supplies || response.data);
    } catch (error) {
      toast.error('Failed to fetch suppliers');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const dataToSend = {
        ...formData,
        stockResetDate: formData.stockResetDate || null
      };

      if (editMode) {
        await axiosInstance.put(`/inventory/${currentItemId}`, dataToSend);
        toast.success('Item updated successfully');
      } else {
        await axiosInstance.post('/inventory/add', dataToSend);
        toast.success('Item added successfully');
      }
      resetForm();
      fetchInventoryItems();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save item');
    }
  };

  const handleEdit = (item) => {
    setFormData({
      name: item.name,
      category: item.category,
      quantity: item.quantity,
      unit: item.unit,
      minStockLevel: item.minStockLevel,
      supplier: item.supplier?._id || item.supplier || '',
      costPerUnit: item.costPerUnit,
      expiryDate: item.expiryDate ? item.expiryDate.split('T')[0] : '',
      notes: item.notes || '',
      reorderFrequency: item.reorderFrequency || 'As Needed',
      storageConditions: item.storageConditions || 'Dry',
      stockResetDate: item.stockResetDate ? item.stockResetDate.split('T')[0] : ''
    });
    setCurrentItemId(item._id);
    setEditMode(true);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        await axiosInstance.delete(`/inventory/${id}`);
        toast.success('Item deleted successfully');
        fetchInventoryItems();
      } catch (error) {
        toast.error('Failed to delete item');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      category: 'Ingredient',
      quantity: 0,
      unit: 'kg',
      minStockLevel: 0,
      supplier: '',
      costPerUnit: 0,
      expiryDate: '',
      notes: '',
      reorderFrequency: 'As Needed',
      storageConditions: 'Dry',
      stockResetDate: ''
    });
    setEditMode(false);
    setCurrentItemId(null);
    setShowForm(false);
  };

  const applyFilters = () => {
    let filtered = inventoryItems;

    if (activeFilter === 'low-stock') {
      filtered = filtered.filter(item => item.quantity < item.minStockLevel);
    } else if (activeFilter !== 'all') {
      filtered = filtered.filter(item => item.category === activeFilter);
    }

    return filtered;
  };

  const handleFilterChange = (filter) => {
    setActiveFilter(filter);
  };

  if (loading) return <div className="text-center py-8">Loading...</div>;
  if (error) return <div className="text-center py-8 text-red-500">Error: {error}</div>;

  const filteredItems = applyFilters();

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-blue-700 mb-8">Inventory Management</h1>
      
      <div className="flex justify-between items-center mb-6">
        <div className="flex space-x-2">
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
          >
            {showForm ? 'Cancel' : 'Add New Item'}
          </button>
          
          <button
            onClick={() => handleFilterChange('low-stock')}
            className={`px-4 py-2 rounded ${activeFilter === 'low-stock' ? 'bg-red-600 text-white' : 'bg-gray-200'}`}
          >
            Low Stock Items
          </button>
        </div>
        
        <div className="flex space-x-2">
          <button
            onClick={() => handleFilterChange('all')}
            className={`px-3 py-1 rounded ${activeFilter === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
          >
            All Items
          </button>
          {categories.map(category => (
            <button
              key={category}
              onClick={() => handleFilterChange(category)}
              className={`px-3 py-1 rounded ${activeFilter === category ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <h2 className="text-xl font-semibold mb-4">
            {editMode ? 'Edit Item' : 'Add New Item'}
          </h2>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Category</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded"
                  required
                >
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Quantity</label>
                <input
                  type="number"
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded"
                  min="0"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Unit</label>
                <select
                  name="unit"
                  value={formData.unit}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded"
                  required
                >
                  {units.map(unit => (
                    <option key={unit} value={unit}>{unit}</option>
                  ))}
                </select>
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Min Stock Level</label>
                <input
                  type="number"
                  name="minStockLevel"
                  value={formData.minStockLevel}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded"
                  min="0"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Supplier</label>
                <select
                  name="supplier"
                  value={formData.supplier}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded"
                  required
                >
                  <option value="">Select Supplier</option>
                  {suppliers.map(supplier => (
                    <option key={supplier._id} value={supplier._id}>
                      {supplier.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Cost Per Unit</label>
                <input
                  type="number"
                  name="costPerUnit"
                  value={formData.costPerUnit}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded"
                  min="0"
                  step="0.01"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Expiry Date</label>
                <input
                  type="date"
                  name="expiryDate"
                  value={formData.expiryDate}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded"
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Storage Conditions</label>
                <select
                  name="storageConditions"
                  value={formData.storageConditions}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded"
                >
                  <option value="Refrigerated">Refrigerated</option>
                  <option value="Frozen">Frozen</option>
                  <option value="Dry">Dry</option>
                  <option value="Ambient">Ambient</option>
                </select>
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Reorder Frequency</label>
                <select
                  name="reorderFrequency"
                  value={formData.reorderFrequency}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded"
                >
                  <option value="Daily">Daily</option>
                  <option value="Weekly">Weekly</option>
                  <option value="Monthly">Monthly</option>
                  <option value="As Needed">As Needed</option>
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Stock Reset Date</label>
                <input
                  type="date"
                  name="stockResetDate"
                  value={formData.stockResetDate}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded"
                  min={new Date().toISOString().split('T')[0]}
                />
                <p className="text-sm text-gray-500 mt-1">
                  Set a date when stock should be reset to 0 (optional)
                </p>
              </div>
              
              <div className="mb-4 md:col-span-2">
                <label className="block text-gray-700 mb-2">Notes</label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded"
                  rows="3"
                ></textarea>
              </div>
            </div>
          
            <div className="flex justify-end space-x-4 mt-4">
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                {editMode ? 'Update Item' : 'Add Item'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Min Stock</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reset Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredItems.length > 0 ? (
                filteredItems.map(item => (
                  <tr 
                    key={item._id} 
                    className={item.quantity < item.minStockLevel ? 'bg-red-50' : ''}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium">{item.name}</div>
                      {item.expiryDate && (
                        <div className="text-sm text-gray-500">
                          Expires: {new Date(item.expiryDate).toLocaleDateString()}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                        {item.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {item.quantity} {item.unit}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {item.minStockLevel} {item.unit}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {item.stockResetDate ? new Date(item.stockResetDate).toLocaleDateString() : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleEdit(item)}
                        className="text-blue-600 hover:text-blue-900 mr-4"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(item._id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                    No inventory items found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Inventory;