import { useState, useEffect } from 'react';
import { api } from '../api';

export default function Rentals() {
  const [rentals, setRentals] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const LIMIT = 50;

  // Filters
  const [filters, setFilters] = useState({
    locality: '',
    bhk: '',
    furnishing: ''
  });

  const fetchRentals = async (currentOffset: number) => {
    setLoading(true);
    try {
      const data = await api.getRentals({
        offset: currentOffset,
        limit: LIMIT,
        ...filters
      });
      let results = data.results || [];
      
      // Local fallback filtering because API ignores query params
      if (filters.bhk) results = results.filter((r: any) => String(r.bedroom) === String(filters.bhk));
      if (filters.locality) results = results.filter((r: any) => r.locality?.toLowerCase().includes(filters.locality.toLowerCase()));
      // Note: price filters aren't in the state for rentals, so we ignore them if they don't exist
      if ((filters as any).min_price) results = results.filter((r: any) => r.price >= Number((filters as any).min_price));
      if ((filters as any).max_price) results = results.filter((r: any) => r.price <= Number((filters as any).max_price));
      if (filters.furnishing) results = results.filter((r: any) => r.furnishing === filters.furnishing);

      setRentals(results);
      setHasMore(data.has_more);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRentals(offset);
  }, [offset, filters]);

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setOffset(0);
  };

  return (
    <div>
      <div className="bg-white p-4 rounded-lg shadow mb-6 space-y-4">
        <h2 className="font-semibold text-lg">Rental Filters</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input
            type="text"
            placeholder="Locality"
            className="border p-2 rounded"
            value={filters.locality}
            onChange={(e) => handleFilterChange('locality', e.target.value)}
          />
          <input
            type="number"
            placeholder="Bedrooms (BHK)"
            className="border p-2 rounded"
            value={filters.bhk}
            onChange={(e) => handleFilterChange('bhk', e.target.value)}
          />
          <select 
            className="border p-2 rounded"
            value={filters.furnishing}
            onChange={(e) => handleFilterChange('furnishing', e.target.value)}
          >
            <option value="">Any Furnishing</option>
            <option value="unfurnished">Unfurnished</option>
            <option value="semi-furnished">Semi-Furnished</option>
            <option value="fully-furnished">Fully Furnished</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-10">Loading rentals...</div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {rentals.map((item) => (
              <div key={item.listing_id} className="bg-white rounded-lg shadow overflow-hidden">
                <div className="p-4 border-b">
                  <h3 className="font-bold text-lg">
                    {item.title || `${item.bedroom} BHK for rent in ${item.locality}`}
                  </h3>
                  <p className="text-gray-500 text-sm">{item.apartment_name}</p>
                </div>
                <div className="p-4 space-y-2">
                  <p className="text-xl font-semibold text-blue-600">
                    ₹{item.price?.toLocaleString('en-IN')} / month
                  </p>
                  <p className="text-gray-600 text-sm">Deposit: ₹{item.deposit?.toLocaleString('en-IN')}</p>
                  <p className="text-gray-600 text-sm">Area: {item.carpet_area} sq.ft</p>
                  <p className="text-gray-600 text-sm">Furnishing: {item.furnishing}</p>
                </div>
                <div className="p-4 bg-gray-50 flex justify-between items-center">
                  <button className="text-gray-400 cursor-not-allowed">Details Unavailable</button>
                  <button 
                    disabled
                    className="text-gray-400 cursor-not-allowed font-medium"
                    title="The API only supports saving properties for sale, not rentals."
                  >
                    Save Unavailable
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 flex justify-center space-x-4">
            <button
              disabled={offset === 0}
              onClick={() => setOffset(Math.max(0, offset - LIMIT))}
              className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
            >
              Previous Page
            </button>
            <button
              disabled={!hasMore}
              onClick={() => setOffset(offset + LIMIT)}
              className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
            >
              Next Page
            </button>
          </div>
        </>
      )}
    </div>
  );
}
