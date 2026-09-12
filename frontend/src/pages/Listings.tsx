import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';

export default function Listings() {
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const LIMIT = 50;

  // Filters
  const [filters, setFilters] = useState({
    locality: '',
    bhk: '',
    min_price: '',
    max_price: '',
    furnishing: ''
  });

  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());

  const fetchListings = async (currentOffset: number) => {
    setLoading(true);
    try {
      const [data, favData] = await Promise.all([
        api.getListings({
          offset: currentOffset,
          limit: LIMIT,
          ...filters
        }),
        api.getFavourites().catch(() => ({ results: [] }))
      ]);
      setListings(data.results || []);
      setHasMore(data.has_more);
      
      const favSet = new Set<string>((favData.results || []).map((f: any) => f.listing_id));
      setSavedIds(favSet);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchListings(offset);
  }, [offset, filters]); // Re-fetch on filter change or offset change

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setOffset(0); // Reset to first page
  };

  return (
    <div>
      <div className="bg-white p-4 rounded-lg shadow mb-6 space-y-4">
        <h2 className="font-semibold text-lg">Filters</h2>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
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
          <input
            type="number"
            placeholder="Min Price"
            className="border p-2 rounded"
            value={filters.min_price}
            onChange={(e) => handleFilterChange('min_price', e.target.value)}
          />
          <input
            type="number"
            placeholder="Max Price"
            className="border p-2 rounded"
            value={filters.max_price}
            onChange={(e) => handleFilterChange('max_price', e.target.value)}
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
        <div className="text-center py-10">Loading listings...</div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {listings.map((item) => (
              <div key={item.listing_id} className="bg-white rounded-lg shadow overflow-hidden">
                <div className="p-4 border-b">
                  <h3 className="font-bold text-lg">
                    {item.bedroom} BHK in {item.apartment_name || item.locality}
                  </h3>
                  <p className="text-gray-500 text-sm">{item.locality}</p>
                </div>
                <div className="p-4 space-y-2">
                  <p className="text-xl font-semibold text-blue-600">
                    ₹{item.price?.toLocaleString('en-IN')}
                  </p>
                  <p className="text-gray-600">Area: {item.carpet_area} sq.ft</p>
                  <p className="text-gray-600">Furnishing: {item.furnishing}</p>
                  {!item.is_live && (
                    <span className="inline-block bg-red-100 text-red-800 text-xs px-2 rounded-full">
                      Inactive (API Bug)
                    </span>
                  )}
                </div>
                <div className="p-4 bg-gray-50 flex justify-between items-center">
                  <Link to={`/listing/${item.listing_id}`} className="text-blue-600 hover:underline">View Details</Link>
                  <button 
                    disabled={savedIds.has(item.listing_id)}
                    onClick={async () => {
                      try { 
                        await api.addFavourite(item.listing_id); 
                        setSavedIds(prev => new Set(prev).add(item.listing_id));
                      } catch(err) { alert('Failed to save'); }
                    }}
                    className={`font-medium hover:underline ${
                      savedIds.has(item.listing_id) ? 'text-green-600' : 'text-red-500'
                    }`}
                  >
                    {savedIds.has(item.listing_id) ? '✓ Saved' : '❤️ Save'}
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
