'use client';

import { useEffect, useState, useRef } from 'react';
import { db } from '@/lib/firebase';
import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
} from 'firebase/firestore';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export default function SavedReceiptsPage() {
  const [receipts, setReceipts] = useState([]);
  const [filteredReceipts, setFilteredReceipts] = useState([]);
  const [clientFilter, setClientFilter] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const receiptRefs = useRef({}); // Store multiple refs

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'receipts'), (snapshot) => {
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setReceipts(data);
      setFilteredReceipts(data); // default display all
    });

    return () => unsubscribe();
  }, []);

  const handleDelete = async (id) => {
    const confirmDelete = confirm('Are you sure you want to delete this receipt?');
    if (!confirmDelete) return;

    try {
      await deleteDoc(doc(db, 'receipts', id));
      alert('Receipt deleted successfully!');
    } catch (error) {
      console.error('Error deleting receipt:', error);
      alert('Error deleting receipt!');
    }
  };

  const handleFilter = () => {
    const filtered = receipts.filter((receipt) => {
      const matchesClient = receipt.clientName?.toLowerCase().includes(clientFilter.toLowerCase());
      const receiptDate = new Date(receipt.date);
      const matchesStart = startDate ? new Date(startDate) <= receiptDate : true;
      const matchesEnd = endDate ? new Date(endDate) >= receiptDate : true;
      return matchesClient && matchesStart && matchesEnd;
    });
    setFilteredReceipts(filtered);
  };

  const resetFilters = () => {
    setClientFilter('');
    setStartDate('');
    setEndDate('');
    setFilteredReceipts(receipts);
  };

  const handleDownloadPDF = async (id) => {
    const receiptDiv = receiptRefs.current[id];
    if (!receiptDiv) {
      alert("Receipt not found!");
      return;
    }

    try {
      const canvas = await html2canvas(receiptDiv);
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF();
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`receipt-${id}.pdf`);
    } catch (error) {
      console.error("PDF Generation Error:", error);
      alert("Failed to generate PDF.");
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-center">📋 Saved Receipts</h1>

      <div className="bg-white p-4 rounded shadow mb-6">
        <h2 className="text-xl font-semibold mb-4">🔍 Search Filters</h2>
        <div className="flex flex-wrap gap-4 items-center">
          <input
            type="text"
            placeholder="Client Name"
            value={clientFilter}
            onChange={(e) => setClientFilter(e.target.value)}
            className="input"
          />
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="input"
          />
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="input"
          />
          <button
            onClick={handleFilter}
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            Apply Filters
          </button>
          <button
            onClick={resetFilters}
            className="bg-gray-400 text-white px-4 py-2 rounded"
          >
            Reset Filters
          </button>
        </div>
      </div>

      {filteredReceipts.length === 0 ? (
        <p className="text-center text-gray-600">No receipts found.</p>
      ) : (
        <ul className="space-y-4">
          {filteredReceipts.map((receipt) => (
            <li key={receipt.id} className="bg-white p-4 rounded shadow relative">
              <div className="mb-1">
                <strong>Client:</strong> {receipt.clientName} |{' '}
                <strong>Date:</strong> {receipt.date}
              </div>
              <div>
                <strong>Receipt #:</strong> {receipt.receiptNo}
              </div>
              <div>
                <strong>Total:</strong> Rs. {receipt.total}
              </div>
              <ul className="ml-4 list-disc text-sm text-gray-700">
                {Array.isArray(receipt.items) &&
                  receipt.items.map((item, idx) => (
                    <li key={idx}>
                      {item.name} × {item.quantity} = Rs. {item.price * item.quantity}
                    </li>
                  ))}
              </ul>

              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => handleDownloadPDF(receipt.id)}
                  className="bg-green-600 text-white px-3 py-1 rounded"
                >
                  Download PDF
                </button>

                <button
                  onClick={() => handleDelete(receipt.id)}
                  className="bg-red-500 text-white px-3 py-1 rounded"
                >
                  Delete
                </button>
              </div>

              {/* Hidden div for rendering receipt content for PDF */}
              <div
                ref={(el) => (receiptRefs.current[receipt.id] = el)}
                style={{ position: 'absolute', top: '-10000px', left: '-10000px' }}
              >
                <div className="p-4 w-[600px]">
                  <h2 className="text-lg font-bold mb-2">🧾 Receipt</h2>
                  <p><strong>Client:</strong> {receipt.clientName}</p>
                  <p><strong>Date:</strong> {receipt.date}</p>
                  <p><strong>Receipt #:</strong> {receipt.receiptNo}</p>
                  <hr className="my-2" />
                  <ul className="text-sm">
                    {Array.isArray(receipt.items) &&
                      receipt.items.map((item, idx) => (
                        <li key={idx}>
                          {item.name} × {item.quantity} = Rs. {item.price * item.quantity}
                        </li>
                      ))}
                  </ul>
                  <hr className="my-2" />
                  <p className="text-right font-bold">Total: Rs. {receipt.total}</p>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
