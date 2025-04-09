import React, { useState, useEffect } from "react";
import axios from "axios"; // Import Axios
import Navbar from "./components/Navbar";
import ChatBox from "./components/ChatBox";
import Sidebar from "./components/Sidebar";
import Login from "./components/Login";
import SignUp from "./components/SignUp";
import styles from "./styles/App.module.css";

const App = () => {
  const [showLogin, setShowLogin] = useState(false);
  const [showSignUp, setShowSignUp] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [properties, setProperties] = useState([]); // Stores fetched property data
  const [error, setError] = useState(""); // Stores error messages

  // Function to fetch properties based on the search query
  const fetchProperties = async () => {
    if (!searchQuery.trim()) {
      setError("Please enter a city name!");
      return;
    }
  
    setError(""); // Clear previous errors
  
    try {
      const response = await axios.get(`http://127.0.0.1:5000/predict?city=${searchQuery}`);
      console.log("✅ API Response:", response.data); // ✅ Log API response
  
      if (Array.isArray(response.data) && response.data.length > 0) {
        setProperties(response.data); // ✅ Update state
      } else {
        setError("No properties found. Try another city.");
        setProperties([]); // Clear previous data
      }
    } catch (error) {
      console.error("❌ Error fetching properties:", error);
      setError("Failed to fetch properties. Try again later.");
      setProperties([]); // Clear previous data
    }
  };
  
  // ✅ Use Effect to Debug State Changes
  useEffect(() => {
    console.log("🟢 Properties state updated:", properties);
  }, [properties]); // Runs only when `properties` changes
  

  return (
    <div className={styles.app}>
      {/* Sidebar */}
      <Sidebar />

      {/* Navbar */}
      <Navbar setShowLogin={setShowLogin} setShowSignUp={setShowSignUp} />

      {/* Hero Section */}
      <div className={styles.heroContainer}>
        <h1>Tour Your Next Home Virtually</h1>
        <p>AI-Powered Real Estate Insights</p>

        {/* Search Bar */}
        <div className={styles.searchContainer}>
          <input
            type="text"
            placeholder="Search for 2BHK in OMR..."
            className={styles.searchInput}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button className={styles.searchButton} onClick={fetchProperties}>
            Search
          </button>
        </div>

        {/* Error Message */}
        {error && <p className={styles.error}>{error}</p>}

        {/* Debugging Log - Check Properties State */}
        {console.log("🔍 Rendering Properties on Page:", properties)}

        {/* Property Listings in Table Format */}
        {properties.length > 0 ? (
          <table border="1" cellPadding="10" style={{ width: "100%", borderCollapse: "collapse", marginTop: "20px" }}>
            <thead>
              <tr>
                <th>Title</th>
                <th>Price (₹)</th>
                <th>Super Area (sq.ft)</th>
                <th>Status</th>
                <th>Transaction</th>
                <th>Furnishing</th>
                <th>Parking</th>
                <th>Bathrooms</th>
                <th>Link</th>
              </tr>
            </thead>
            <tbody>
              {properties.map((property, index) => (
                <tr key={index}>
                  <td>{property.title || "N/A"}</td>
                  <td>{property.predicted_price ? `₹${property.predicted_price.toLocaleString()}` : "N/A"}</td>
                  <td>{property.super_area || "N/A"}</td>
                  <td>{property.status || "N/A"}</td>
                  <td>{property.transaction || "N/A"}</td>
                  <td>{property.furnishing || "N/A"}</td>
                  <td>{property.parking || "N/A"}</td>
                  <td>{property.bathrooms || "N/A"}</td>
                  <td>
                    {property.link && !isNaN(property.link) ? (
                      <a href={property.link} target="_blank" rel="noopener noreferrer">
                        View Property
                      </a>
                    ) : (
                      "N/A"
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          error ? <p>{error}</p> : <p>Loading properties...</p>
        )}
      </div>

      {/* Chatbox */}
      <ChatBox />

      {/* Modals for Login and SignUp */}
      {showLogin && <Login closeModal={() => setShowLogin(false)} />}
      {showSignUp && <SignUp closeModal={() => setShowSignUp(false)} />}
    </div>
  );
};

export default App;
