"use client";

import { useEffect, useState, useRef } from "react";
import { db } from "@/lib/firebase";
import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  onSnapshot,
} from "firebase/firestore";

import Link from "next/link";

export default function ReceiptGenerator() {
  const predefinedItems = {
    "Water Bottle": 30,
    Chips: 50,
    Juice: 60,
    Cookies: 80,
  };

  const [selectedItem, setSelectedItem] = useState("Water Bottle");
  const [quantity, setQuantity] = useState(1);
  const [cart, setCart] = useState([]);
  const [clientName, setClientName] = useState("");
  const [date, setDate] = useState("");
  const [receipts, setReceipts] = useState([]);
  const [loading, setLoading] = useState(false);
  const receiptRef = useRef();

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "receipts"), (snapshot) => {
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setReceipts(data);
    });

    return () => unsubscribe();
  }, []);

  const addToCart = () => {
    const price = predefinedItems[selectedItem];
    const newItem = { name: selectedItem, quantity, price };
    setCart([...cart, newItem]);
    setQuantity(1);
  };

  const removeItem = (index) => {
    const updatedCart = [...cart];
    updatedCart.splice(index, 1);
    setCart(updatedCart);
  };

  const editItem = (index, field, value) => {
    const updatedCart = [...cart];
    updatedCart[index][field] = field === "quantity" ? parseInt(value) : value;
    setCart(updatedCart);
  };

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const receiptNo = `R-${new Date().getTime()}`;

  

  const handlePrint = async () => {
    if (!clientName || !date || cart.length === 0) return;

    setLoading(true);

    try {
      await addDoc(collection(db, "receipts"), {
        clientName,
        date,
        receiptNo,
        items: cart,
        total,
      });
      // ✅ Reset form fields
      setClientName("");
      setDate("");
      setCart([]);
      setSelectedItem("Water Bottle"); // reset to default item
      setQuantity(1); // reset quantity to 1
      alert("Data saved successfully!");
    } catch (error) {
      console.error("Failed to save receipt:", error);
    }

    setLoading(false);
  };

  const handleDelete = async (id) => {
    const confirmDelete = confirm(
      "Are you sure you want to delete this receipt?"
    );
    if (!confirmDelete) return;

    try {
      await deleteDoc(doc(db, "receipts", id));
      alert("Receipt deleted successfully!");
    } catch (error) {
      console.error("Failed to delete receipt:", error);
      alert("Error deleting receipt");
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-center">
        🧾 Receipt Generator
      </h1>

      <div className="bg-white shadow p-4 rounded mb-6">
        <div className="mb-4">
          <input
            type="text"
            placeholder="Client Name"
            className="input"
            value={clientName}
            onChange={(e) => setClientName(e.target.value)}
          />
          <input
            type="date"
            className="input ml-2"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>

        <div className="flex gap-4 items-end mb-4">
          <select
            value={selectedItem}
            onChange={(e) => setSelectedItem(e.target.value)}
            className="input"
          >
            {Object.keys(predefinedItems).map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
          <input
            type="number"
            className="input"
            value={quantity}
            onChange={(e) => setQuantity(parseInt(e.target.value))}
            min={1}
          />
          <button
            onClick={addToCart}
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            Add to Cart
          </button>
        </div>

        <div ref={receiptRef} className="bg-gray-100 p-4 rounded mb-4">
          <h2 className="text-xl font-semibold mb-2">Receipt Preview</h2>
          <p>
            <strong>Client:</strong> {clientName}
          </p>
          <p>
            <strong>Date:</strong> {date}
          </p>
          <p>
            <strong>Receipt #:</strong> {receiptNo}
          </p>

          <ul className="mt-4 space-y-2">
            {cart.map((item, index) => (
              <li key={index} className="flex justify-between items-center">
                <span>
                  {item.name} × {item.quantity} = Rs.{" "}
                  {item.price * item.quantity}
                </span>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={item.quantity}
                    onChange={(e) =>
                      editItem(index, "quantity", e.target.value)
                    }
                    className="w-16 px-2 py-1 border rounded"
                  />
                  <button
                    onClick={() => removeItem(index)}
                    className="bg-red-500 text-white px-2 py-1 rounded"
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>

          <p className="text-right font-bold mt-4">Total: Rs. {total}</p>
        </div>

        <button
          onClick={handlePrint}
          className="bg-green-600 text-white px-6 py-2 rounded"
          disabled={loading}
        >
          {loading ? "Saving..." : "Print Receipt"}
        </button>

        {/* ✅ View Saved Receipts Button */}
        <Link href="/saved-receipts">
          <button className="bg-gray-800 text-white px-4 py-2 rounded mt-4 ml-4">
            View Saved Receipts
          </button>
        </Link>
      </div>
    </div>
  );
}
