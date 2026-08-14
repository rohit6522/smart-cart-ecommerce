"use client";

import { useState, useRef } from "react";
import Modal from "@/components/ui/Modal";
import { bulkUploadProducts, BulkUploadResult } from "@/lib/productApi";
import { Upload, FileText, CheckCircle2, AlertTriangle, Download } from "lucide-react";

interface BulkUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const SAMPLE_CSV = `name,description,price,discountPercentage,stockQuantity,category,imageUrl
Basmati Rice 5kg,Premium long-grain basmati rice,450,0,100,Groceries,https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400
Wireless Mouse,Ergonomic 2.4GHz wireless mouse,799,10,40,Electronics,https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400`;

export default function BulkUploadModal({ isOpen, onClose, onSuccess }: BulkUploadModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<BulkUploadResult | null>(null);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      if (!selected.name.endsWith(".csv")) {
        setError("Please select a .csv file");
        return;
      }
      setFile(selected);
      setError("");
      setResult(null);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    setError("");
    try {
      const res = await bulkUploadProducts(file);
      setResult(res);
      if (res.successCount > 0) {
        onSuccess();
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || "Upload failed. Please check your file format.");
    } finally {
      setUploading(false);
    }
  };

  const handleDownloadSample = () => {
    const blob = new Blob([SAMPLE_CSV], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "sample-products.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleClose = () => {
    setFile(null);
    setResult(null);
    setError("");
    if (fileInputRef.current) fileInputRef.current.value = "";
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Bulk Upload Products">
      <p className="text-sm text-gray-500 mb-4">
        Upload a CSV file to add multiple products at once. Columns:{" "}
        <code className="bg-gray-100 px-1.5 py-0.5 rounded text-xs">
          name, description, price, discountPercentage, stockQuantity, category, imageUrl
        </code>
      </p>

      <button
        onClick={handleDownloadSample}
        className="flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-700 font-medium mb-4"
      >
        <Download size={14} /> Download sample CSV
      </button>

      <label
        className={`flex flex-col items-center justify-center gap-2 border-2 border-dashed rounded-xl p-8 cursor-pointer transition ${
          file ? "border-blue-400 bg-blue-50" : "border-gray-300 hover:border-gray-400"
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv"
          onChange={handleFileSelect}
          className="hidden"
        />
        {file ? (
          <>
            <FileText className="text-blue-600" size={28} />
            <span className="text-sm font-medium text-gray-900">{file.name}</span>
            <span className="text-xs text-gray-400">Click to change file</span>
          </>
        ) : (
          <>
            <Upload className="text-gray-400" size={28} />
            <span className="text-sm font-medium text-gray-600">Click to select a CSV file</span>
          </>
        )}
      </label>

      {error && <p className="text-red-600 text-sm mt-3">{error}</p>}

      {result && (
        <div className="mt-4 space-y-2">
          <div className="flex items-center gap-2 bg-green-50 text-green-700 text-sm px-3 py-2 rounded-lg">
            <CheckCircle2 size={16} /> {result.successCount} products added successfully
          </div>
          {result.failureCount > 0 && (
            <div className="bg-orange-50 text-orange-700 text-sm px-3 py-2 rounded-lg">
              <div className="flex items-center gap-2 mb-1.5 font-medium">
                <AlertTriangle size={16} /> {result.failureCount} rows failed
              </div>
              <ul className="text-xs space-y-0.5 max-h-32 overflow-y-auto">
                {result.errors.map((err, i) => (
                  <li key={i}>• {err}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      <div className="flex gap-3 mt-5">
        <button
          onClick={handleClose}
          className="flex-1 border border-gray-300 text-gray-700 py-2.5 rounded-lg font-medium hover:bg-gray-50"
        >
          Close
        </button>
        <button
          onClick={handleUpload}
          disabled={!file || uploading}
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg font-medium disabled:opacity-50"
        >
          {uploading ? "Uploading..." : "Upload"}
        </button>
      </div>
    </Modal>
  );
}