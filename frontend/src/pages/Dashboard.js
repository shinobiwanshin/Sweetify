import React, { useState, useEffect } from "react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

const Dashboard = () => {
  const [sweets, setSweets] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("All");

  // Admin state
  const [sweetForm, setSweetForm] = useState({
    name: "",
    category: "",
    price: "",
    quantity: "",
  });
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetchSweets();
  }, []);

  const fetchSweets = async () => {
    try {
      const response = await api.get("/sweets");
      setSweets(response.data);
    } catch (error) {
      console.error("Error fetching sweets", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async (id) => {
    try {
      await api.post(`/sweets/${id}/purchase`);
      fetchSweets();
      alert("Purchase successful!");
    } catch (error) {
      alert(
        "Purchase failed: " + (error.response?.data?.message || error.message)
      );
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditing) {
        await api.put(`/sweets/${editId}`, sweetForm);
        alert("Sweet updated successfully");
      } else {
        await api.post("/sweets", sweetForm);
        alert("Sweet added successfully");
      }
      resetForm();
      fetchSweets();
    } catch (error) {
      alert("Failed to save sweet");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this sweet?")) {
      try {
        await api.delete(`/sweets/${id}`);
        fetchSweets();
      } catch (error) {
        alert("Failed to delete sweet");
      }
    }
  };

  const handleEdit = (sweet) => {
    setSweetForm({
      name: sweet.name,
      category: sweet.category,
      price: sweet.price,
      quantity: sweet.quantity,
    });
    setEditId(sweet.id);
    setIsEditing(true);
    setShowForm(true);
  };

  const handleRestock = async (id) => {
    const quantity = prompt("Enter quantity to restock:");
    if (quantity && !isNaN(quantity)) {
      try {
        await api.post(`/sweets/${id}/restock`, parseInt(quantity));
        fetchSweets();
      } catch (error) {
        alert("Restock failed");
      }
    }
  };

  const resetForm = () => {
    setSweetForm({ name: "", category: "", price: "", quantity: "" });
    setIsEditing(false);
    setEditId(null);
    setShowForm(false);
  };

  const filteredSweets = sweets.filter((sweet) => {
    const matchesSearch = sweet.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesCategory =
      filterCategory === "All" || sweet.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = ["All", ...new Set(sweets.map((s) => s.category))];

  if (loading) return <div className="text-center mt-10">Loading...</div>;

  return (
    <div className="container mx-auto p-4">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <h1 className="text-3xl font-bold">Available Sweets</h1>

        <div className="flex gap-4 w-full md:w-auto">
          <input
            placeholder="Search sweets..."
            className="border p-2 rounded w-full md:w-64"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <select
            className="border p-2 rounded"
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {user?.role === "ADMIN" && (
          <button
            onClick={() => {
              resetForm();
              setShowForm(!showForm);
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 whitespace-nowrap"
          >
            {showForm ? "Close Form" : "Add New Sweet"}
          </button>
        )}
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded shadow-md mb-8 border-l-4 border-blue-600">
          <h2 className="text-xl font-bold mb-4">
            {isEditing ? "Edit Sweet" : "Add New Sweet"}
          </h2>
          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            <input
              placeholder="Name"
              className="border p-2 rounded"
              value={sweetForm.name}
              onChange={(e) =>
                setSweetForm({ ...sweetForm, name: e.target.value })
              }
              required
            />
            <input
              placeholder="Category"
              className="border p-2 rounded"
              value={sweetForm.category}
              onChange={(e) =>
                setSweetForm({ ...sweetForm, category: e.target.value })
              }
              required
            />
            <input
              type="number"
              placeholder="Price"
              className="border p-2 rounded"
              value={sweetForm.price}
              onChange={(e) =>
                setSweetForm({ ...sweetForm, price: e.target.value })
              }
              required
            />
            <input
              type="number"
              placeholder="Quantity"
              className="border p-2 rounded"
              value={sweetForm.quantity}
              onChange={(e) =>
                setSweetForm({ ...sweetForm, quantity: e.target.value })
              }
              required
            />
            <div className="md:col-span-2 flex gap-2">
              <button
                type="submit"
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 flex-1"
              >
                {isEditing ? "Update Sweet" : "Save Sweet"}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {filteredSweets.map((sweet) => (
          <div
            key={sweet.id}
            className="bg-white p-6 rounded shadow-md hover:shadow-lg transition relative"
          >
            <h3 className="text-xl font-bold mb-2">{sweet.name}</h3>
            <p className="text-gray-600 mb-1">Category: {sweet.category}</p>
            <p className="text-green-600 font-bold mb-1">
              Price: ${sweet.price}
            </p>
            <p
              className={`mb-4 font-semibold ${
                sweet.quantity > 0 ? "text-blue-600" : "text-red-500"
              }`}
            >
              Stock: {sweet.quantity}
            </p>

            <div className="flex flex-col gap-2">
              <button
                onClick={() => handlePurchase(sweet.id)}
                disabled={sweet.quantity <= 0}
                className={`w-full py-2 rounded text-white ${
                  sweet.quantity > 0
                    ? "bg-blue-600 hover:bg-blue-700"
                    : "bg-gray-400 cursor-not-allowed"
                }`}
              >
                {sweet.quantity > 0 ? "Buy Now" : "Out of Stock"}
              </button>

              {user?.role === "ADMIN" && (
                <div className="flex gap-2 mt-2 pt-2 border-t">
                  <button
                    onClick={() => handleRestock(sweet.id)}
                    className="flex-1 bg-yellow-500 text-white px-2 py-1 rounded hover:bg-yellow-600 text-sm"
                  >
                    Restock
                  </button>
                  <button
                    onClick={() => handleEdit(sweet)}
                    className="flex-1 bg-indigo-500 text-white px-2 py-1 rounded hover:bg-indigo-600 text-sm"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(sweet.id)}
                    className="flex-1 bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600 text-sm"
                  >
                    Delete
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
        {filteredSweets.length === 0 && (
          <div className="col-span-full text-center text-gray-500 mt-10">
            No sweets found matching your criteria.
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
