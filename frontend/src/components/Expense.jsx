import React, { useState, useEffect } from 'react';
import axiosInstance from '../utils/api';

// Environment variables for Vite
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const FRONTEND_URL = import.meta.env.VITE_FRONTEND_URL || 'http://localhost:5176';

const categories = [
  'Rent', 'Salaries', 'Ingredients', 'Utilities', 'Maintenance',
  'Marketing', 'Equipment', 'Licensing', 'Cleaning Supplies', 'Taxes', 'Other'
];
const paymentMethods = ['Cash', 'Card', 'Bank Transfer', 'UPI', 'Cheque', 'Other'];
const statuses = ['Pending', 'Paid', 'Disputed'];

// Helper function to ensure attachment URLs are properly formatted
const formatAttachmentUrl = (url) => {
  // If the URL is already absolute and contains our frontend URL, replace with API URL
  if (url.includes(FRONTEND_URL)) {
    return url.replace(FRONTEND_URL, API_URL);
  }
  
  // If the URL is already absolute with a different base, return it as is
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  
  // If it's a relative URL, add the correct API base URL
  return `${API_URL}${url.startsWith('/') ? url : `/${url}`}`;
};

// Helper function to extract filename from path
const getFilenameFromPath = (path) => {
  if (!path) return 'Unknown file';
  return path.split('/').pop().split('\\').pop();
};

const ExpenseForm = ({ expense, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    title: expense?.title || '',
    category: expense?.category || '',
    amount: expense?.amount || '',
    paymentMethod: expense?.paymentMethod || 'Cash',
    paidTo: expense?.paidTo || '',
    expenseDate: expense?.expenseDate ? new Date(expense.expenseDate).toISOString().split('T')[0] : '',
    status: expense?.status || 'Paid',
    notes: expense?.notes || ''
  });
  const [files, setFiles] = useState([]);
  const [existingAttachments, setExistingAttachments] = useState(expense?.attachments || []);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setFiles(Array.from(e.target.files));
  };

  const handleRemoveAttachment = (index) => {
    setExistingAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const data = new FormData();
    Object.keys(formData).forEach(key => data.append(key, formData[key]));
    files.forEach(file => data.append('attachments', file));
    data.append('existingAttachments', JSON.stringify(existingAttachments));

    try {
      const response = expense?._id
        ? await axiosInstance.put(`/expenses/${expense._id}`, data)
        : await axiosInstance.post('/expenses/add', data);
      onSave(response.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save expense');
    }
  };

  const handleViewAttachment = (e, attachmentUrl) => {
    e.preventDefault();
    
    try {
      // Use the server's API endpoint to get the file with the correct port
      const url = formatAttachmentUrl(attachmentUrl);
      window.open(url, '_blank');
    } catch (error) {
      console.error('Error opening attachment:', error);
      setError('Failed to open attachment. The file might not exist or you might not have permission to view it.');
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-4">{expense ? 'Edit Expense' : 'Add Expense'}</h2>
      {error && <div className="text-red-500 mb-4">{error}</div>}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium">Title</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Category</label>
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
            required
          >
            <option value="">Select Category</option>
            {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium">Amount</label>
          <input
            type="number"
            name="amount"
            value={formData.amount}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
            required
            min="0"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Payment Method</label>
          <select
            name="paymentMethod"
            value={formData.paymentMethod}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
          >
            {paymentMethods.map(method => <option key={method} value={method}>{method}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium">Paid To</label>
          <input
            type="text"
            name="paidTo"
            value={formData.paidTo}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Expense Date</label>
          <input
            type="date"
            name="expenseDate"
            value={formData.expenseDate}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Status</label>
          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
          >
            {statuses.map(status => <option key={status} value={status}>{status}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium">Notes</label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Attachments</label>
          <input
            type="file"
            multiple
            onChange={handleFileChange}
            className="mt-1 block w-full"
          />
          {existingAttachments.length > 0 && (
            <div className="mt-2">
              <p className="text-sm font-medium">Existing Attachments:</p>
              <ul className="list-disc pl-5">
                {existingAttachments.map((attachment, index) => (
                  <li key={index} className="flex items-center">
                    <button
                      onClick={(e) => handleViewAttachment(e, attachment)} 
                      className="text-blue-600 hover:underline"
                    >
                      {getFilenameFromPath(attachment)}
                    </button>
                    <button
                      onClick={() => handleRemoveAttachment(index)}
                      className="ml-2 text-red-600 hover:text-red-800"
                      type="button"
                    >
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
        <div className="flex space-x-4">
          <button
            type="button"
            onClick={handleSubmit}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Save
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

const ExpenseList = ({ expenses, onEdit, onDelete }) => {
  const [viewError, setViewError] = useState('');

  const handleViewAttachment = (e, attachmentUrl) => {
    e.preventDefault();
    
    try {
      // Use the server's API endpoint to get the file with the correct port
      const url = formatAttachmentUrl(attachmentUrl);
      window.open(url, '_blank');
    } catch (error) {
      console.error('Error opening attachment:', error);
      setViewError('Failed to open attachment. The file might not exist or you might not have permission to view it.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-4">Expenses</h2>
      {viewError && <div className="text-red-500 mb-4">{viewError}</div>}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white">
          <thead>
            <tr>
              <th className="py-2 px-4 border-b">Title</th>
              <th className="py-2 px-4 border-b">Category</th>
              <th className="py-2 px-4 border-b">Amount</th>
              <th className="py-2 px-4 border-b">Date</th>
              <th className="py-2 px-4 border-b">Status</th>
              <th className="py-2 px-4 border-b">Attachments</th>
              <th className="py-2 px-4 border-b">Actions</th>
            </tr>
          </thead>
          <tbody>
            {expenses.map(expense => (
              <tr key={expense._id}>
                <td className="py-2 px-4 border-b">{expense.title}</td>
                <td className="py-2 px-4 border-b">{expense.category}</td>
                <td className="py-2 px-4 border-b">₹{expense.amount}</td>
                <td className="py-2 px-4 border-b">
                  {new Date(expense.expenseDate).toLocaleDateString()}
                </td>
                <td className="py-2 px-4 border-b">{expense.status}</td>
                <td className="py-2 px-4 border-b">
                  {expense.attachments?.length > 0 ? (
                    <ul className="list-disc pl-5">
                      {expense.attachments.map((attachment, index) => (
                        <li key={index}>
                          <button
                            onClick={(e) => handleViewAttachment(e, attachment)}
                            className="text-blue-600 hover:underline"
                          >
                            {getFilenameFromPath(attachment)}
                          </button>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    'None'
                  )}
                </td>
                <td className="py-2 px-4 border-b">
                  <button
                    onClick={() => onEdit(expense)}
                    className="mr-2 text-blue-600 hover:text-blue-800"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => onDelete(expense._id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const MonthlySummary = () => {
  const [summary, setSummary] = useState(null);
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [error, setError] = useState('');

  const fetchSummary = async () => {
    try {
      const response = await axiosInstance.get(`/expenses/summary/month?year=${year}&month=${month}`);
      setSummary(response.data);
    } catch (err) {
      setError('Failed to fetch summary');
    }
  };

  useEffect(() => {
    fetchSummary();
  }, [year, month]);

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-4">Monthly Summary</h2>
      <div className="flex space-x-4 mb-4">
        <input
          type="number"
          value={year}
          onChange={(e) => setYear(e.target.value)}
          className="rounded-md border-gray-300 shadow-sm"
          placeholder="Year"
        />
        <select
          value={month}
          onChange={(e) => setMonth(e.target.value)}
          className="rounded-md border-gray-300 shadow-sm"
        >
          {[...Array(12)].map((_, i) => (
            <option key={i + 1} value={i + 1}>{i + 1}</option>
          ))}
        </select>
        <button
          onClick={fetchSummary}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Fetch
        </button>
      </div>
      {error && <div className="text-red-500 mb-4">{error}</div>}
      {summary && (
        <div>
          <p><strong>Month:</strong> {summary.month}/{summary.year}</p>
          <p><strong>Total:</strong> ₹{summary.total}</p>
          <p><strong>Number of Expenses:</strong> {summary.expenses.length}</p>
        </div>
      )}
    </div>
  );
};

const CompareMonths = () => {
  const [comparison, setComparison] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchComparison = async () => {
      try {
        const response = await axiosInstance.get('/expenses/summary/compare');
        setComparison(response.data);
      } catch (err) {
        setError('Failed to fetch comparison');
      }
    };
    fetchComparison();
  }, []);

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-4">Month-to-Month Comparison</h2>
      {error && <div className="text-red-500 mb-4">{error}</div>}
      {comparison && (
        <div>
          <p><strong>Current Month ({comparison.currentMonth.month}/{comparison.currentMonth.year}):</strong> ₹{comparison.currentMonth.total}</p>
          <p><strong>Last Month ({comparison.lastMonth.month}/{comparison.lastMonth.year}):</strong> ₹{comparison.lastMonth.total}</p>
          <p><strong>Difference:</strong> ₹{comparison.difference}</p>
          <p><strong>Percentage Change:</strong> {comparison.percentageChange}</p>
        </div>
      )}
    </div>
  );
};

const DateRangeFilter = ({ onFilter }) => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const handleFilter = async () => {
    try {
      const response = await axiosInstance.get(`/expenses/by-date-range?startDate=${startDate}&endDate=${endDate}`);
      onFilter(response.data.data);
    } catch (err) {
      console.error('Failed to fetch date range expenses');
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-4">Filter by Date Range</h2>
      <div className="flex space-x-4">
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="rounded-md border-gray-300 shadow-sm"
        />
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className="rounded-md border-gray-300 shadow-sm"
        />
        <button
          onClick={handleFilter}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Filter
        </button>
      </div>
    </div>
  );
};

const Expense = () => {
  const [expenses, setExpenses] = useState([]);
  const [editingExpense, setEditingExpense] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const fetchExpenses = async () => {
    try {
      const response = await axiosInstance.get('/expenses');
      setExpenses(response.data);
    } catch (err) {
      console.error('Failed to fetch expenses');
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  const handleSave = (savedExpense) => {
    setExpenses(prev => {
      if (editingExpense) {
        return prev.map(exp => exp._id === savedExpense._id ? savedExpense : exp);
      }
      return [savedExpense, ...prev];
    });
    setShowForm(false);
    setEditingExpense(null);
  };

  const handleDelete = async (id) => {
    try {
      await axiosInstance.delete(`/expenses/${id}`);
      setExpenses(prev => prev.filter(exp => exp._id !== id));
    } catch (err) {
      console.error('Failed to delete expense');
    }
  };

  const handleFilter = (filteredExpenses) => {
    setExpenses(filteredExpenses);
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6 text-center">Expense Management</h1>
      <button
        onClick={() => { setShowForm(true); setEditingExpense(null); }}
        className="mb-6 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
      >
        Add New Expense
      </button>
      {showForm && (
        <ExpenseForm
          expense={editingExpense}
          onSave={handleSave}
          onCancel={() => { setShowForm(false); setEditingExpense(null); }}
        />
      )}
      <MonthlySummary />
      <CompareMonths />
      <DateRangeFilter onFilter={handleFilter} />
      <ExpenseList
        expenses={expenses}
        onEdit={(expense) => { setEditingExpense(expense); setShowForm(true); }}
        onDelete={handleDelete}
      />
    </div>
  );
};

export default Expense;