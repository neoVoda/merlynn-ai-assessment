'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function HomePage() {
  const [models, setModels] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchModels() {
      try {
        const res = await fetch('/api/models');
        if (!res.ok) {
          throw new Error(`Failed to fetch models, status: ${res.status}`);
        }
        const data = await res.json();
        setModels(data.data || []);
      } catch (err) {
        setError(err.message);
      }
    }
    fetchModels();
  }, []);

  return (
    <div className="bg-white min-h-screen text-gray-800">
      <div className="container mx-auto p-4 max-w-screen-md">
        <h1 className="text-2xl font-bold mb-4 text-center">
          Welcome to Merlynn Model Selector
        </h1>

        {error && (
          <p className="text-red-500 text-center mb-4">{error}</p>
        )}

        {models.length > 0 ? (
          <ul className="space-y-4">
            {models.map((model) => (
              <li
                key={model.id}
                className="p-4 border rounded hover:bg-gray-50 transition-colors"
              >
                <Link
                  href={`/model/${model.id}`}
                  className="text-[#f15623] hover:underline font-semibold"
                >
                  {model.attributes.name}
                </Link>
                <p className="text-sm text-gray-600 mt-1">
                  {model.attributes.description}
                </p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-center mt-8">No models available.</p>
        )}
      </div>
    </div>
  );
}
