import React, { useState, useEffect, useRef } from 'react';
import axiosInstance from '../utils/api';
import Chart from 'chart.js/auto';

const categories = ['Rent', 'Salaries', 'Ingredients', 'Utilities', 'Maintenance', 'Marketing', 'Equipment', 'Licensing', 'Cleaning Supplies', 'Taxes', 'Other'];
const paymentMethods = ['Cash', 'Card', 'Bank Transfer', 'UPI', 'Cheque', 'Other'];
const statuses = ['Pending', 'Paid', 'Disputed'];

const formatAttachmentUrl = (url) => {
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  const FRONTEND_URL = import.meta.env.VITE_FRONTEND_URL || 'http://localhost:5176';
  if (url.includes(FRONTEND_URL)) return url.replace(FRONTEND_URL, API_URL);
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  return `${API_URL}${url.startsWith('/') ? url : `/${url}`}`;
};

const getFilenameFromPath = (path) => path ? path.split('/').pop().split('\\').pop() : 'Unknown file';

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

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
  const handleFileChange = (e) => setFiles(Array.from(e.target.files));
  const handleRemoveAttachment = (index) => setExistingAttachments(prev => prev.filter((_, i) => i !== index));

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
      const url = formatAttachmentUrl(attachmentUrl);
      window.open(url, '_blank');
    } catch (error) {
      setError('Failed to open attachment.');
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded-xl shadow-lg">
      <h2 className="text-2xl font-semibold mb-6 text-gray-800">{expense ? 'Edit Expense' : 'Add Expense'}</h2>
      {error && <div className="text-red-500 mb-4 p-3 bg-red-50 rounded">{error}</div>}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Title</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Category</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              required
            >
              <option value="">Select Category</option>
              {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Amount (₹)</label>
            <input
              type="number"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              required
              min="0"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Payment Method</label>
            <select
              name="paymentMethod"
              value={formData.paymentMethod}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            >
              {paymentMethods.map(method => <option key={method} value={method}>{method}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Paid To</label>
            <input
              type="text"
              name="paidTo"
              value={formData.paidTo}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Expense Date</label>
            <input
              type="date"
              name="expenseDate"
              value={formData.expenseDate}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Status</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            >
              {statuses.map(status => <option key={status} value={status}>{status}</option>)}
            </select>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Notes</label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            rows="4"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Attachments</label>
          <input
            type="file"
            multiple
            onChange={handleFileChange}
            className="mt-1 block w-full text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
          />
          {existingAttachments.length > 0 && (
            <div className="mt-4">
              <p className="text-sm font-medium text-gray-700">Existing Attachments:</p>
              <ul className="mt-2 space-y-2">
                {existingAttachments.map((attachment, index) => (
                  <li key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                    <button
                      onClick={(e) => handleViewAttachment(e, attachment)}
                      className="text-indigo-600 hover:underline"
                    >
                      {getFilenameFromPath(attachment)}
                    </button>
                    <button
                      onClick={() => handleRemoveAttachment(index)}
                      className="text-red-600 hover:text-red-800"
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
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            Save
          </button>
        </div>
      </form>
    </div>
  );
};

const ExpenseList = ({ expenses, onEdit, onDelete }) => {
  const [viewError, setViewError] = useState('');

  const handleViewAttachment = (e, attachmentUrl) => {
    e.preventDefault();
    try {
      const url = formatAttachmentUrl(attachmentUrl);
      window.open(url, '_blank');
    } catch (error) {
      setViewError('Failed to open attachment.');
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white rounded-xl shadow-lg">
      <h2 className="text-2xl font-semibold mb-6 text-gray-800">Expenses</h2>
      {viewError && <div className="text-red-500 mb-4 p-3 bg-red-50 rounded">{viewError}</div>}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Attachments</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {expenses.map(expense => (
              <tr key={expense._id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{expense.title}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{expense.category}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">₹{expense.amount}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {new Date(expense.expenseDate).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  <span className={`px-2 py-1 rounded-full text-xs ${expense.status === 'Paid' ? 'bg-green-100 text-green-800' : expense.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
                    {expense.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {expense.attachments?.length > 0 ? (
                    <ul className="space-y-1">
                      {expense.attachments.map((attachment, index) => (
                        <li key={index}>
                          <button
                            onClick={(e) => handleViewAttachment(e, attachment)}
                            className="text-indigo-600 hover:underline"
                          >
                            {getFilenameFromPath(attachment)}
                          </button>
                        </li>
                      ))}
                    </ul>
                  ) : 'None'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    onClick={() => onEdit(expense)}
                    className="text-indigo-600 hover:text-indigo-900 mr-4"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => onDelete(expense._id)}
                    className="text-red-600 hover:text-red-900"
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

const ExpenseCharts = ({ expenses }) => {
  const categoryChartRef = useRef(null);
  const statusChartRef = useRef(null);
  const categoryChartInstance = useRef(null);
  const statusChartInstance = useRef(null);

  useEffect(() => {
    if (categoryChartInstance.current) categoryChartInstance.current.destroy();
    if (statusChartInstance.current) statusChartInstance.current.destroy();

    const categoryData = categories.reduce((acc, cat) => {
      acc[cat] = expenses.filter(exp => exp.category === cat).reduce((sum, exp) => sum + Number(exp.amount), 0);
      return acc;
    }, {});

    const statusData = statuses.reduce((acc, status) => {
      acc[status] = expenses.filter(exp => exp.status === status).length;
      return acc;
    }, {});

    categoryChartInstance.current = new Chart(categoryChartRef.current, {
      type: 'pie',
      data: {
        labels: Object.keys(categoryData),
        datasets: [{
          data: Object.values(categoryData),
          backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40', '#C9CBCF', '#7BC043', '#E7E9ED', '#F7464A', '#D4A5A5']
        }]
      },
      options: {
        responsive: true,
        plugins: { legend: { position: 'bottom' } }
      }
    });

    statusChartInstance.current = new Chart(statusChartRef.current, {
      type: 'doughnut',
      data: {
        labels: Object.keys(statusData),
        datasets: [{
          data: Object.values(statusData),
          backgroundColor: ['#36A2EB', '#FFCE56', '#FF6384']
        }]
      },
      options: {
        responsive: true,
        plugins: { legend: { position: 'bottom' } }
      }
    });

    return () => {
      if (categoryChartInstance.current) categoryChartInstance.current.destroy();
      if (statusChartInstance.current) statusChartInstance.current.destroy();
    };
  }, [expenses]);

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white rounded-xl shadow-lg grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <h3 className="text-lg font-semibold mb-4 text-gray-800">Expenses by Category</h3>
        <canvas ref={categoryChartRef} />
      </div>
      <div>
        <h3 className="text-lg font-semibold mb-4 text-gray-800">Expense Status Distribution</h3>
        <canvas ref={statusChartRef} />
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
    <div className="max-w-3xl mx-auto p-6 bg-white rounded-xl shadow-lg">
      <h2 className="text-2xl font-semibold mb-6 text-gray-800">Monthly Summary</h2>
      <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 mb-6">
        <input
          type="number"
          value={year}
          onChange={(e) => setYear(e.target.value)}
          className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 mb-2 sm:mb-0"
          placeholder="Year"
        />
        <select
          value={month}
          onChange={(e) => setMonth(e.target.value)}
          className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 mb-2 sm:mb-0"
        >
          {[...Array(12)].map((_, i) => (
            <option key={i + 1} value={i + 1}>{i + 1}</option>
          ))}
        </select>
        <button
          onClick={fetchSummary}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
        >
          Fetch
        </button>
      </div>
      {error && <div className="text-red-500 mb-4 p-3 bg-red-50 rounded">{error}</div>}
      {summary && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 bg-indigo-50 rounded-md">
            <p className="text-sm text-gray-600">Month</p>
            <p className="text-lg font-semibold text-gray-900">{summary.month}/{summary.year}</p>
          </div>
          <div className="p-4 bg-indigo-50 rounded-md">
            <p className="text-sm text-gray-600">Total</p>
            <p className="text-lg font-semibold text-gray-900">₹{summary.total}</p>
          </div>
          <div className="p-4 bg-indigo-50 rounded-md">
            <p className="text-sm text-gray-600">Expenses</p>
            <p className="text-lg font-semibold text-gray-900">{summary.expenses.length}</p>
          </div>
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
    <div className="max-w-3xl mx-auto p-6 bg-white rounded-xl shadow-lg">
      <h2 className="text-2xl font-semibold mb-6 text-gray-800">Month-to-Month Comparison</h2>
      {error && <div className="text-red-500 mb-4 p-3 bg-red-50 rounded">{error}</div>}
      {comparison && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 bg-indigo-50 rounded-md">
            <p className="text-sm text-gray-600">Current Month ({comparison.currentMonth.month}/{comparison.currentMonth.year})</p>
            <p className="text-lg font-semibold text-gray-900">₹{comparison.currentMonth.total}</p>
          </div>
          <div className="p-4 bg-indigo-50 rounded-md">
            <p className="text-sm text-gray-600">Last Month ({comparison.lastMonth.month}/{comparison.lastMonth.year})</p>
            <p className="text-lg font-semibold text-gray-900">₹{comparison.lastMonth.total}</p>
          </div>
          <div className="p-4 bg-indigo-50 rounded-md">
            <p className="text-sm text-gray-600">Difference</p>
            <p className="text-lg font-semibold text-gray-900">₹{comparison.difference}</p>
          </div>
          <div className="p-4 bg-indigo-50 rounded-md">
            <p className="text-sm text-gray-600">Percentage Change</p>
            <p className="text-lg font-semibold text-gray-900">{comparison.percentageChange}%</p>
          </div>
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
    <div className="max-w-3xl mx-auto p-6 bg-white rounded-xl shadow-lg">
      <h2 className="text-2xl font-semibold mb-6 text-gray-800">Filter by Date Range</h2>
      <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4">
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 mb-2 sm:mb-0"
        />
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 mb-2 sm:mb-0"
        />
        <button
          onClick={handleFilter}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
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
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-gray-800 text-center">Expense Management Dashboard</h1>
        <div className="flex justify-center mb-8">
          <button
            onClick={() => { setShowForm(true); setEditingExpense(null); }}
            className="px-6 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 flex items-center space-x-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
            <span>Add New Expense</span>
          </button>
        </div>
        {showForm && (
          <ExpenseForm
            expense={editingExpense}
            onSave={handleSave}
            onCancel={() => { setShowForm(false); setEditingExpense(null); }}
          />
        )}
        <ExpenseCharts expenses={expenses} />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <MonthlySummary />
          <CompareMonths />
        </div>
        <DateRangeFilter onFilter={handleFilter} />
        <ExpenseList
          expenses={expenses}
          onEdit={(expense) => { setEditingExpense(expense); setShowForm(true); }}
          onDelete={handleDelete}
        />
      </div>
    </div>
  );
};

export default Expense;