// Users.jsx
import React, { useState, useEffect } from "react";
import axiosInstance from "../utils/api";

const Users = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    email: "",
    password: "",
    role: "",
  });
  const [loading, setLoading] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get("/users", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("ims_token")}`,
        },
      });
      if (response.data.success) {
        setUsers(response.data.users);
        setFilteredUsers(response.data.users);
      }
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Add new category
    try {
      const token = localStorage.getItem("ims_token");
      const response = await axiosInstance.post("/users/add", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.data.success) {
        fetchUsers();
      }
    } catch (error) {
      alert(error.message);
    }
  };

  const handleSearchInput = (e) => {
    setFilteredUsers(
      users.filter((user) =>
        user.name.toLowerCase().includes(e.target.value.toLowerCase())
      )
    );
  };

  const handleDelete = async (id) => {
    try {
      const response = await axiosInstance.delete(`/users/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("ims_token")}`,
        },
      });
      if (response.data.success) {
        setUsers((prev) => prev.filter((user) => user._id !== id));
        setFilteredUsers((prev) =>
          prev.filter((user) => user._id !== id)
        );
      }
    } catch (error) {
      alert(error.message);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Users Management</h1>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left Column - Add/Edit Form */}
        <div className="lg:w-1/3">
          <div className="bg-white p-4 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-4">
              Add New User
            </h2>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  User Name
                </label>
                <input
                  type="text"
                  name="name"
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="Enter Name"
                  className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  User Email
                </label>
                <input
                  type="email"
                  name="email"
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  placeholder="Enter Email"
                  className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  name="password"
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  placeholder="*******"
                  className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  User Address
                </label>
                <input
                  type="text"
                  name="address"
                  onChange={(e) =>
                    setFormData({ ...formData, address: e.target.value })
                  }
                  placeholder="Enter Address"
                  className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <select
                name="role"
                id=""
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Role</option>
                <option value="admin">Admin</option>
                <option value="user">User</option>
              </select>
              <div className="flex gap-2">
                <button
                  type="submit"
                  className={`flex-1 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md`}
                >
                  Add User
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Right Column - Table and Search */}
        <div className="lg:w-2/3">
          <div className="mb-4">
            <input
              type="text"
              onChange={handleSearchInput}
              placeholder="Search users..."
              className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="overflow-x-auto bg-white rounded-lg shadow">
            <table className="min-w-full">
              <thead>
                <tr className="bg-gray-100">
                  <th className="p-2 text-left">ID</th>
                  <th className="p-2 text-left">Name</th>
                  <th className="p-2 text-left">Email</th>
                  <th className="p-2 text-left">Role</th>
                  <th className="p-2 text-left">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user, index) => (
                  <tr key={index} className="border-t">
                    <td className="p-2">{index + 1}</td>
                    <td className="p-2">{user.name}</td>
                    <td className="p-2">{user.email}</td>
                    <td className="p-2">{user.role}</td>
                    <td className="p-2 flex gap-2">
                      <button
                      onClick={() => {
                        if (window.confirm(`Are you sure you want to delete ${user.name}?`)) {
                          handleDelete(user._id);
                        }
                      }}
                        className="text-red-500 font-bold"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredUsers.length === 0 && (
              <p className="text-center p-4 text-gray-500">No User found</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Users;
