import React, { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  FaHome,
  FaUtensils,
  FaListAlt,
  FaShoppingCart,
  FaUserTie,
  FaWarehouse,
  FaTruckLoading,
  FaUserFriends,
  FaMoneyBillWave,
  FaUsers,
  FaCog,
  FaSignOutAlt,
  FaCashRegister,
  FaBox,
  FaTable,
  FaTruck
} from 'react-icons/fa';

const Sidebar = () => {
  const [itemsToRender, setItemsToRender] = useState([]);

  const adminMenuItems = [
    { name: 'Dashboard', path: '/', icon: <FaHome />, isParent: true },
    { name: 'Menu', path: '/admin-dashboard/products', icon: <FaUtensils />, isParent: false }, // better match than FaBox
    { name: 'Categories', path: '/admin-dashboard/categories', icon: <FaListAlt />, isParent: false }, // better than FaTable
    { name: 'Orders', path: '/admin-dashboard/orders', icon: <FaShoppingCart />, isParent: false },
    { name: 'Chef', path: '/admin-dashboard/supplier', icon: <FaUserTie />, isParent: false }, // more human/role-based than FaTruck
    { name: 'Inventory', path: '/admin-dashboard/Inventory', icon: <FaWarehouse />, isParent: false }, // better than FaUsers
    { name: 'Supplier', path: '/admin-dashboard/InventorySupplier', icon: <FaTruckLoading />, isParent: false }, // specific to suppliers
    { name: 'Staff', path: '/admin-dashboard/Staff', icon: <FaUserFriends />, isParent: false }, // more appropriate for team/staff
    { name: 'Expense', path: '/admin-dashboard/Expense', icon: <FaMoneyBillWave />, isParent: false }, // finance related
    { name: 'Users', path: '/admin-dashboard/users', icon: <FaUsers />, isParent: false },
    { name: 'Profile', path: '/admin-dashboard/profile', icon: <FaCog />, isParent: true },
    { name: 'Logout', path: '/logout', icon: <FaSignOutAlt />, isParent: true },
  ];

  const userMenuItems = [
    { name: 'POS', path: '/employee-dashboard', icon: <FaCashRegister/>, isParent: true },
    { name: 'My Orders', path: '/employee-dashboard/orders', icon: <FaShoppingCart />, isParent: false },
    { name: 'Products', path: '/admin-dashboard/products', icon: <FaBox />, isParent: false },
    { name: 'Categories', path: '/admin-dashboard/categories', icon: <FaTable />, isParent: false },
    { name: 'Chef', path: '/admin-dashboard/supplier', icon: <FaUserTie />, isParent: false },
    { name: 'Logout', path: '/logout', icon: <FaSignOutAlt />, isParent: true },
  ];

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('ims_user'));
    if (user?.role === 'admin') {
      setItemsToRender(adminMenuItems);
    } else {
      setItemsToRender(userMenuItems);
    }
  }, []);

  return (
    <div className="fixed h-screen bg-gray-800 text-white w-16 md:w-64 flex flex-col">
      <div className="h-16 flex items-center justify-center md:justify-start md:pl-6">
        <span className="hidden md:block text-xl font-bold">Restaurant MS</span>
        <span className="block md:hidden text-xl font-bold">IMS</span>
      </div>

      <nav className="flex-1">
        <ul className="space-y-2 p-2">
          {itemsToRender.map((item, index) => (
            <li key={index}>
              <NavLink
                to={item.path}
                end={item.isParent}
                className={({ isActive }) =>
                  `flex items-center p-2 rounded-lg transition-colors duration-200 ${
                    isActive ? 'bg-gray-600' : 'hover:bg-gray-700'
                  }`
                }
              >
                <span className="text-xl">{item.icon}</span>
                <span className="ml-4 hidden md:block">{item.name}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar;
