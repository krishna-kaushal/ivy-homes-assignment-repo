import { useState, useEffect } from 'react';
import { api } from '../api';

export default function Favourites() {
  const [favourites, setFavourites] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchFavourites = async () => {
    setLoading(true);
    try {
      const data = await api.getFavourites();
      setFavourites(data.results || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFavourites();
  }, []);

  const handleRemove = async (id: string) => {
    try {
      await api.removeFavourite(id);
      setFavourites(prev => prev.filter(f => f.listing_id !== id));
    } catch (err) {
      alert('Failed to remove favourite');
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Saved Listings</h2>
      {loading ? (
        <div className="text-center py-10">Loading favourites...</div>
      ) : favourites.length === 0 ? (
        <div className="text-center py-10 text-gray-500 bg-white rounded-lg shadow">
          You haven't saved any listings yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {favourites.map((item) => (
            <div key={item.listing_id} className="bg-white rounded-lg shadow overflow-hidden relative">
              <button 
                onClick={() => handleRemove(item.listing_id)}
                className="absolute top-4 right-4 text-red-500 bg-white rounded-full p-1 shadow hover:bg-red-50"
                title="Remove from favourites"
              >
                ✕
              </button>
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
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
