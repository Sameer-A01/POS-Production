import React, { useEffect, useState } from "react";
import axiosInstance from "../utils/api";// Adjust path if needed

const InventorySupplier = () => {
  const [supplies, setSupplies] = useState([]);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
  });
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchSupplies();
  }, []);

  const fetchSupplies = async () => {
    try {
      const res = await axiosInstance.get("/supply");
      setSupplies(res.data.supplies);
    } catch (err) {
      console.error("Failed to load supplies:", err);
      alert("Error loading supplies.");
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
      } else {
        await axiosInstance.post("/supply/add", form);
      }
      setForm({ name: "", email: "", phone: "", address: "" });
      setEditingId(null);
      fetchSupplies();
    } catch (err) {
      console.error("Failed to save supply:", err);
      alert("Error saving supply.");
    }
  };

  const handleEdit = (supply) => {
    setForm({
      name: supply.name,
      email: supply.email || "",
      phone: supply.phone || "",
      address: supply.address || "",
    });
    setEditingId(supply._id);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this supplier?")) return;
    try {
      await axiosInstance.delete(`/supply/${id}`);
      fetchSupplies();
    } catch (err) {
      console.error("Failed to delete supply:", err);
      alert("Error deleting supply.");
    }
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h2>{editingId ? "Edit Supplier" : "Add Supplier"}</h2>
      <form onSubmit={handleSubmit} style={{ marginBottom: "2rem" }}>
        <input
          name="name"
          placeholder="Name"
          value={form.name}
          onChange={handleChange}
          required
        />
        <input
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
        />
        <input
          name="phone"
          placeholder="Phone"
          value={form.phone}
          onChange={handleChange}
        />
        <input
          name="address"
          placeholder="Address"
          value={form.address}
          onChange={handleChange}
        />
        <button type="submit" style={{ marginLeft: "1rem" }}>
          {editingId ? "Update" : "Add"}
        </button>
      </form>

      <h3>Suppliers List</h3>
      <table border="1" cellPadding="10" style={{ width: "100%", textAlign: "left" }}>
        <thead>
          <tr>
            <th>Name</th><th>Email</th><th>Phone</th><th>Address</th><th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {supplies.map((supply) => (
            <tr key={supply._id}>
              <td>{supply.name}</td>
              <td>{supply.email}</td>
              <td>{supply.phone}</td>
              <td>{supply.address}</td>
              <td>
                <button onClick={() => handleEdit(supply)}>Edit</button>{" "}
                <button onClick={() => handleDelete(supply._id)} style={{ color: "red" }}>
                  Delete
                </button>
              </td>
            </tr>
          ))}
          {supplies.length === 0 && (
            <tr>
              <td colSpan="5" style={{ textAlign: "center" }}>
                No suppliers found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default InventorySupplier;
