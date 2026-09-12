import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../api';
import { ArrowLeft, Check, AlertTriangle } from 'lucide-react';

export default function ListingDetail() {
  const { id } = useParams<{ id: string }>();
  const [listing, setListing] = useState<any>(null);
  const [similar, setSimilar] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const fetchDetails = async () => {
      setLoading(true);
      setError('');
      try {
        if (!id) return;
        
        // Fetch listing and favorites in parallel
        const [data, favData] = await Promise.all([
          api.getListing(id),
          api.getFavourites().catch(() => ({ results: [] }))
        ]);
        
        setListing(data);
        
        // Check if currently saved
        const isSaved = (favData.results || []).some((f: any) => f.listing_id === id);
        setSaved(isSaved);
        
        // Fetch similar listings
        try {
          const simData = await api.getListings({ locality: data.locality, bhk: data.bedroom, limit: 3 });
          setSimilar(simData.results?.filter((s: any) => s.listing_id !== id).slice(0, 3) || []);
        } catch (e) {
          // Ignore similar listings error
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load listing');
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [id]);

  const handleSave = async () => {
    if (!listing) return;
    setSaving(true);
    try {
      await api.addFavourite(listing.listing_id);
      setSaved(true);
    } catch (err) {
      alert('Failed to save listing');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="text-center py-20">Loading details...</div>;
  if (error) return <div className="text-red-500 text-center py-20">{error}</div>;
  if (!listing) return null;

  const isCorrupt = listing.carpet_area > (listing.super_built_up_area || Infinity) || listing.price < 0;

  return (
    <div className="max-w-4xl mx-auto pb-12">
      <Link to="/" className="inline-flex items-center text-blue-600 hover:underline mb-6">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Listings
      </Link>

      {isCorrupt && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
          <div className="flex items-center">
            <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
            <h3 className="font-bold text-red-700">Corrupt Data Warning</h3>
          </div>
          <p className="text-red-700 mt-1">This listing contains mathematically impossible values (e.g. carpet area larger than super built-up area).</p>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="p-8 border-b">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold mb-2">
                {listing.bedroom} BHK in {listing.apartment_name || listing.locality}
              </h1>
              <p className="text-xl text-gray-600">{listing.locality}</p>
            </div>
            <button 
              onClick={handleSave}
              disabled={saving || saved}
              className={`px-6 py-2 rounded font-medium shadow flex items-center ${
                saved ? 'bg-green-100 text-green-700' : 'bg-red-500 text-white hover:bg-red-600'
              }`}
            >
              {saved ? <><Check className="w-4 h-4 mr-2"/> Saved</> : '❤️ Save Listing'}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-8">
          <div className="space-y-6">
            <div>
              <h3 className="text-sm text-gray-500 mb-1">Price</h3>
              <p className="text-3xl font-bold text-blue-600">₹{listing.price?.toLocaleString('en-IN')}</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 p-4 rounded">
                <p className="text-sm text-gray-500">Carpet Area</p>
                <p className="font-semibold">{listing.carpet_area} sq.ft</p>
              </div>
              <div className="bg-gray-50 p-4 rounded">
                <p className="text-sm text-gray-500">Super Built-up</p>
                <p className="font-semibold">{listing.super_built_up_area || 'N/A'} sq.ft</p>
              </div>
              <div className="bg-gray-50 p-4 rounded">
                <p className="text-sm text-gray-500">Floor</p>
                <p className="font-semibold">{listing.floor} out of {listing.total_floors}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded">
                <p className="text-sm text-gray-500">Furnishing</p>
                <p className="font-semibold capitalize">{listing.furnishing}</p>
              </div>
            </div>

            <div>
              <h3 className="font-bold text-lg mb-2">Description</h3>
              <p className="text-gray-700 whitespace-pre-wrap">{listing.description}</p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-blue-50 p-6 rounded-lg border border-blue-100">
              <h3 className="font-bold text-lg mb-4 text-blue-900">Contact Agent</h3>
              <p className="font-medium text-lg">{listing.posted_by_name}</p>
              <p className="text-gray-600 capitalize mb-4">{listing.posted_by}</p>
              <a 
                href={`tel:${listing.posted_by_contact}`}
                className="block w-full text-center bg-blue-600 text-white py-3 rounded font-semibold hover:bg-blue-700"
              >
                Call {listing.posted_by_contact}
              </a>
            </div>

            <div className="text-sm text-gray-500 space-y-2">
              <p>Posted at: {new Date(listing.posted_at).toLocaleString()}</p>
              <p>Verified: {listing.is_verified ? '✅ Yes' : '❌ No'}</p>
              {listing.project_id && <p>Project ID: {listing.project_id}</p>}
            </div>
          </div>
        </div>
      </div>

      {similar.length > 0 && (
        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-6">Similar Properties</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {similar.map(sim => (
              <Link to={`/listing/${sim.listing_id}`} key={sim.listing_id} className="bg-white rounded-lg shadow p-4 hover:shadow-lg transition">
                <h3 className="font-bold">{sim.bedroom} BHK</h3>
                <p className="text-gray-500 text-sm mb-2">{sim.locality}</p>
                <p className="font-semibold text-blue-600 mb-2">₹{sim.price?.toLocaleString('en-IN')}</p>
                <p className="text-sm text-gray-600">{sim.carpet_area} sq.ft</p>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
