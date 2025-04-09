import React, { useState } from "react";
import axios from "axios";
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
  const [properties, setProperties] = useState([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const fetchProperties = async () => {
    if (!searchQuery.trim()) {
      setError("Please enter a city name!");
      return;
    }

    setError("");
    setIsLoading(true);

    try {
      const response = await axios.get(`http://127.0.0.1:5000/predict?city=${searchQuery}`);
      console.log("Raw API Response:", response.data);

      // Transform the API response to match frontend expectations
      const cleanedProperties = response.data.map(property => {
        // Extract URL from the malformed response (it appears to be mixed in the JSON)
        let extractedUrl = null;
        const jsonString = JSON.stringify(property);
        const urlMatch = jsonString.match(/https?:\/\/[^\s,]+/);
        if (urlMatch) {
          extractedUrl = urlMatch[0];
        }

        return {
          title: property.title || "N/A",
          predicted_price: property["packeting/pilot"] || 0,
          super_area: property["type=area"] || 0,
          status: "Available", // Default value since not in API
          transaction: property.transaction === 0 ? "Sale" : "Rent",
          furnishing: "Semi-Furnished", // Default value
          parking: property.packing === 0 ? "No" : "Yes",
          bathrooms: property.pathroom || 0,
          link: extractedUrl || null
        };
      });

      console.log("Cleaned Properties:", cleanedProperties);
      setProperties(cleanedProperties);
    } catch (error) {
      console.error("Error fetching properties:", error);
      setError("Failed to fetch properties. Try again later.");
      setProperties([]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.app}>
      <Sidebar />
      <Navbar setShowLogin={setShowLogin} setShowSignUp={setShowSignUp} />

      <div className={styles.heroContainer}>
        <h1>Tour Your Next Home Virtually</h1>
        <p>AI-Powered Real Estate Insights</p>

        <div className={styles.searchContainer}>
          <input
            type="text"
            placeholder="Search for 2BHK ..."
            className={styles.searchInput}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && fetchProperties()}
          />
          <button className={styles.searchButton} onClick={fetchProperties}>
            Search
          </button>
        </div>

        {error && <p className={styles.error}>{error}</p>}

        {isLoading ? (
          <p>Loading properties...</p>
        ) : properties.length > 0 ? (
          <div className={styles.tableContainer}>
            <table className={styles.propertyTable}>
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Price (₹)</th>
                  <th>Area (sq.ft)</th>
                  <th>Status</th>
                  <th>Type</th>
                  <th>Furnishing</th>
                  <th>Parking</th>
                  <th>Bathrooms</th>
                  <th>Link</th>
                </tr>
              </thead>
              <tbody>
                {properties.map((property, index) => (
                  <tr key={index}>
                    <td>{property.title}</td>
                    <td>₹{property.predicted_price.toLocaleString('en-IN')}</td>
                    <td>{property.super_area.toLocaleString('en-IN')}</td>
                    <td>{property.status}</td>
                    <td>{property.transaction}</td>
                    <td>{property.furnishing}</td>
                    <td>{property.parking}</td>
                    <td>{property.bathrooms}</td>
                    <td>
                      {property.link ? (
                        <a 
                          href={property.link.startsWith('http') ? property.link : `https://${property.link}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                        >
                          View
                        </a>
                      ) : "N/A"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          !error && <p>Enter a city name to search for properties</p>
        )}
      </div>

      <ChatBox />
      {showLogin && <Login closeModal={() => setShowLogin(false)} />}
      {showSignUp && <SignUp closeModal={() => setShowSignUp(false)} />}
    </div>
  );
};

export default App;