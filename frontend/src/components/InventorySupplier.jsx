import React, { useEffect, useState } from "react";
import axiosInstance from "../utils/api";
import { FiEdit2, FiTrash2, FiPlus, FiSearch } from "react-icons/fi";

const InventorySupplier = () => {
  const [supplies, setSupplies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
  });
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchSupplies();
  }, []);

  const fetchSupplies = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get("/supply");
      setSupplies(res.data.supplies);
    } catch (err) {
      console.error("Failed to load supplies:", err);
      alert("Error loading supplies.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await axiosInstance.put(`/supply/${editingId}`, form);
        alert("Supplier updated successfully");
      } else {
        await axiosInstance.post("/supply/add", form);
        alert("Supplier added successfully");
      }
      resetForm();
      fetchSupplies();
    } catch (err) {
      console.error("Failed to save supplier:", err);
      alert("Error saving supplier.");
    }
  };

  const resetForm = () => {
    setForm({ name: "", email: "", phone: "", address: "" });
    setEditingId(null);
    setShowForm(false);
  };

  const handleEdit = (supply) => {
    setForm({
      name: supply.name,
      email: supply.email || "",
      phone: supply.phone || "",
      address: supply.address || "",
    });
    setEditingId(supply._id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this supplier?")) return;
    try {
      await axiosInstance.delete(`/supply/${id}`);
      fetchSupplies();
    } catch (err) {
      console.error("Failed to delete supplier:", err);
      alert("Error deleting supplier.");
    }
  };

  const filteredSupplies = supplies.filter(supply =>
    supply.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (supply.email && supply.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (supply.phone && supply.phone.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (supply.address && supply.address.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="supplier-management">
      <div className="header">
        <h2>Supplier Management</h2>
        <div className="actions">
          <div className="search-box">
            <FiSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search suppliers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button 
            className="btn-primary"
            onClick={() => {
              resetForm();
              setShowForm(true);
            }}
          >
            <FiPlus /> Add Supplier
          </button>
        </div>
      </div>

      {showForm && (
        <div className="supplier-form">
          <h3>{editingId ? "Edit Supplier" : "Add New Supplier"}</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Supplier Name*</label>
              <input
                name="name"
                placeholder="Enter supplier name"
                value={form.name}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input
                name="email"
                type="email"
                placeholder="Enter email address"
                value={form.email}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label>Phone Number</label>
              <input
                name="phone"
                placeholder="Enter phone number"
                value={form.phone}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label>Address</label>
              <textarea
                name="address"
                placeholder="Enter full address"
                value={form.address}
                onChange={handleChange}
                rows="3"
              />
            </div>
            <div className="form-actions">
              <button type="submit" className="btn-primary">
                {editingId ? "Update Supplier" : "Save Supplier"}
              </button>
              <button type="button" className="btn-secondary" onClick={resetForm}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="supplier-table">
        {loading ? (
          <div className="loading">Loading suppliers...</div>
        ) : (
          <>
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Address</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredSupplies.length > 0 ? (
                  filteredSupplies.map((supply) => (
                    <tr key={supply._id}>
                      <td>{supply.name}</td>
                      <td>{supply.email || "-"}</td>
                      <td>{supply.phone || "-"}</td>
                      <td>{supply.address || "-"}</td>
                      <td className="actions">
                        <button 
                          className="btn-icon"
                          onClick={() => handleEdit(supply)}
                          title="Edit"
                        >
                          <FiEdit2 />
                        </button>
                        <button
                          className="btn-icon danger"
                          onClick={() => handleDelete(supply._id)}
                          title="Delete"
                        >
                          <FiTrash2 />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="no-data">
                      {searchTerm ? "No matching suppliers found" : "No suppliers available"}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </>
        )}
      </div>

      <style jsx>{`
        .supplier-management {
          max-width: 1200px;
          margin: 0 auto;
          padding: 2rem;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }
        
        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
        }
        
        .actions {
          display: flex;
          gap: 1rem;
          align-items: center;
        }
        
        .search-box {
          position: relative;
          display: flex;
          align-items: center;
        }
        
        .search-box input {
          padding: 0.5rem 1rem 0.5rem 2rem;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 14px;
        }
        
        .search-icon {
          position: absolute;
          left: 10px;
          color: #666;
        }
        
        .btn-primary {
          background-color: #4f46e5;
          color: white;
          border: none;
          padding: 0.5rem 1rem;
          border-radius: 4px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-weight: 500;
          transition: background-color 0.2s;
        }
        
        .btn-primary:hover {
          background-color: #4338ca;
        }
        
        .btn-secondary {
          background-color: white;
          color: #4f46e5;
          border: 1px solid #4f46e5;
          padding: 0.5rem 1rem;
          border-radius: 4px;
          cursor: pointer;
          font-weight: 500;
          transition: all 0.2s;
        }
        
        .btn-secondary:hover {
          background-color: #f5f3ff;
        }
        
        .btn-icon {
          background: none;
          border: none;
          color: #4f46e5;
          cursor: pointer;
          padding: 0.5rem;
          border-radius: 4px;
          transition: background-color 0.2s;
        }
        
        .btn-icon:hover {
          background-color: #f5f3ff;
        }
        
        .btn-icon.danger {
          color: #ef4444;
        }
        
        .btn-icon.danger:hover {
          background-color: #fee2e2;
        }
        
        .supplier-form {
          background-color: white;
          border-radius: 8px;
          padding: 1.5rem;
          margin-bottom: 2rem;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        
        .supplier-form h3 {
          margin-top: 0;
          margin-bottom: 1.5rem;
          color: #374151;
        }
        
        .form-group {
          margin-bottom: 1rem;
        }
        
        .form-group label {
          display: block;
          margin-bottom: 0.5rem;
          font-weight: 500;
          color: #374151;
        }
        
        .form-group input, 
        .form-group textarea {
          width: 100%;
          padding: 0.5rem;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 14px;
        }
        
        .form-actions {
          display: flex;
          gap: 1rem;
          margin-top: 1.5rem;
        }
        
        .supplier-table {
          background-color: white;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        
        table {
          width: 100%;
          border-collapse: collapse;
        }
        
        th {
          background-color: #f9fafb;
          padding: 1rem;
          text-align: left;
          font-weight: 600;
          color: #374151;
          border-bottom: 1px solid #e5e7eb;
        }
        
        td {
          padding: 1rem;
          border-bottom: 1px solid #e5e7eb;
          color: #4b5563;
        }
        
        tr:hover td {
          background-color: #f9fafb;
        }
        
        .actions {
          display: flex;
          gap: 0.5rem;
        }
        
        .no-data {
          text-align: center;
          padding: 2rem;
          color: #6b7280;
        }
        
        .loading {
          padding: 2rem;
          text-align: center;
          color: #6b7280;
        }
      `}</style>
    </div>
  );
};

export default InventorySupplier;