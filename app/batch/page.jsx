'use client';

import { useState } from 'react';

export default function BatchPage() {
  const [file, setFile] = useState(null);
  const [delimiter, setDelimiter] = useState(",");
  const [uploadStatus, setUploadStatus] = useState(null);
  const [error, setError] = useState(null);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleDelimiterChange = (e) => {
    setDelimiter(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError("Please select a file.");
      return;
    }
    setError(null);
    setUploadStatus("Uploading...");

    const formData = new FormData();
    formData.append("file", file);
    formData.append("delimiter", delimiter);

    try {

      const res = await fetch('/api/decision/batch', {
        method: "POST",
        body: formData,
      });
      const result = await res.json();
      if (res.ok) {
        setUploadStatus("Batch file uploaded successfully. Job details: " + JSON.stringify(result));
      } else {
        setError(result.error || "Something went wrong.");
      }
    } catch (err) {
      setError("Failed to upload batch file.");
    }
  };

  return (
    <div className="bg-white min-h-screen text-gray-800">
      <div className="container mx-auto p-4 max-w-screen-md">
        <h1 className="text-2xl font-bold mb-4 text-center">Batch Upload</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block font-medium mb-1">Select CSV File:</label>
            <input
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="w-full"
            />
          </div>
          <div>
            <label className="block font-medium mb-1">Delimiter:</label>
            <input
              type="text"
              value={delimiter}
              onChange={handleDelimiterChange}
              className="w-full p-2 border rounded"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-[#f15623] text-white py-2 rounded hover:bg-orange-600 transition-colors"
          >
            Upload Batch File
          </button>
        </form>
        {uploadStatus && <p className="mt-4 text-green-600">{uploadStatus}</p>}
        {error && <p className="mt-4 text-red-600">{error}</p>}
      </div>
    </div>
  );
}
