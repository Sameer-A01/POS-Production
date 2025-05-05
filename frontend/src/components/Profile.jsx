import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../utils/api';

const Profile = () => {
  const [userData, setUserData] = useState({
    name: '',
    email: '',
    password: '',
    address: ''
  });
  const [originalPassword, setOriginalPassword] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    const fetchUserData = async () => {
      setLoading(true);
      try {
        const response = await axiosInstance.get(`/users/${user.userId}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("ims_token")}`,
          },
        });
        if (response.data.success) {
          const userInfo = {
            name: response.data.user.name,
            email: response.data.user.email,
            address: response.data.user.address,
            password: ''
          };
          setUserData(userInfo);
          setOriginalPassword(response.data.user.password);
        }
      } catch (error) {
        console.log(error);
        alert(error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchUserData();
  }, [user.userId]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    const updateData = { ...userData };
    if (updateData.password === '' || updateData.password === originalPassword) {
      delete updateData.password;
    }

    try {
      const response = await axiosInstance.put(`/users/${user.userId}`, updateData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("ims_token")}`
        }
      });
      
      if (response.data.success) {
        setUserData({ 
          name: response.data.user.name,
          email: response.data.user.email,
          address: response.data.user.address,
          password: ''
        });
        setOriginalPassword(response.data.user.password);
        setIsEditing(false);
        setError(null);
      }
    } catch (err) {
      setError('Failed to update user information');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">User Profile</h1>

      {error && <p className="text-red-500 mb-4">{error}</p>}
      {loading && <p className="text-gray-500 mb-4">Loading...</p>}

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow max-w-md">
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Name
          </label>
          <input
            type="text"
            name="name"
            value={userData.name}
            onChange={handleInputChange}
            disabled={!isEditing}
            className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <input
            type="email"
            name="email"
            value={userData.email}
            onChange={handleInputChange}
            disabled={!isEditing}
            className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Address
          </label>
          <input
            type="text"
            name="address"
            value={userData.address}
            onChange={handleInputChange}
            disabled={!isEditing}
            className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
          />
        </div>

        {isEditing && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              name="password"
              value={userData.password || ''}
              onChange={handleInputChange}
              className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter new password (optional)"
            />
          </div>
        )}

        <div className="flex gap-2">
          {!isEditing ? (
            <button
            type='button'
              onClick={(e) => {
                e.preventDefault();
                setIsEditing(true);
              }}
              className="bg-yellow-500 text-white px-4 py-2 rounded-md hover:bg-yellow-600 disabled:bg-yellow-300"
              disabled={loading}
            >
              Edit Profile
            </button>
          ) : (
            <>
              <button
                type="submit"
                className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 disabled:bg-green-300"
                disabled={loading}
              >
                Save Changes
              </button>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 disabled:bg-gray-300"
                disabled={loading}
              >
                Cancel
              </button>
            </>
          )}
        </div>
      </form>
    </div>
  );
};

export default Profile;