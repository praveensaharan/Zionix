import React, { useState } from "react";
import axios from "axios";

const Todo = () => {
  const [partNumber, setPartNumber] = useState("");
  const [quantity, setQuantity] = useState("");
  const [mouserPrice, setMouserPrice] = useState(null); // State to hold Mouser Price
  const [rutronikPrice, setRutronikPrice] = useState(null); // State to hold Rutronik Price
  const [tmePrice, setTmePrice] = useState(null);
  const [error, setError] = useState(null); // State to hold error

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("http://localhost:3000/getPrices", {
        partNumber,
        quantity,
      });
      const { mouserPrice, rutronikPrice, tmePrice } = response.data;
      if (mouserPrice) {
        setMouserPrice(mouserPrice);
      } else {
        setMouserPrice(null);
      }
      if (rutronikPrice) {
        setRutronikPrice(rutronikPrice);
      } else {
        setRutronikPrice(null);
      }
      if (tmePrice) {
        setTmePrice(tmePrice);
      } else {
        setTmePrice(null);
      }
    } catch (error) {
      setError("Error fetching prices:" + error.message);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-md shadow-md">
      <h1 className="text-xl font-bold mb-4">Price Comparison</h1>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-sm font-bold mb-2" htmlFor="partNumber">
            Part Number:
          </label>
          <input
            className="border rounded-md px-3 py-2 w-full"
            type="text"
            id="partNumber"
            value={partNumber}
            onChange={(e) => setPartNumber(e.target.value)}
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-bold mb-2" htmlFor="quantity">
            Quantity:
          </label>
          <input
            className="border rounded-md px-3 py-2 w-full"
            type="number"
            id="quantity"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
          />
        </div>
        <button
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          type="submit"
        >
          Get Prices
        </button>
      </form>
      <div className="mt-4 border border-gray-300 rounded p-4">
        <h2 className="text-lg font-bold mb-2">Prices:</h2>
        {error && <p className="text-red-500">{error}</p>}
        <p className="mb-1 bg-blue-100 rounded p-2">
          Mouser Price:{" "}
          <span className="font-semibold">{mouserPrice || "N/A"}</span>
        </p>
        <p className="mb-1 bg-green-100 rounded p-2">
          Rutronik Price:{" "}
          <span className="font-semibold">{rutronikPrice || "N/A"}</span>
        </p>
        <p className="mb-1 bg-yellow-100 rounded p-2">
          TME Price: <span className="font-semibold">{tmePrice || "N/A"}</span>
        </p>
      </div>
    </div>
  );
};

export default Todo;
