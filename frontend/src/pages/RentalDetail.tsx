import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../api';

export default function RentalDetail() {
  const { id } = useParams();
  const [rental, setRental] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchRental = async () => {
      setLoading(true);
      setError('');
      try {
        if (!id) return;
        const data = await api.getRental(id);
        setRental(data);
      } catch (err: any) {
        setError(err.message || 'Failed to load rental');
      } finally {
        setLoading(false);
      }
    };
    fetchRental();
  }, [id]);

  if (loading) return <div className="text-center py-10">Loading rental details...</div>;
  if (error) return <div className="text-center py-10 text-red-500">{error}</div>;
  if (!rental) return <div className="text-center py-10">Rental not found</div>;

  return (
    <div className="max-w-4xl mx-auto">
      <Link to="/rentals" className="text-blue-600 hover:underline mb-4 inline-block">← Back to Rentals</Link>
      
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="p-6 border-b">
          <h1 className="text-2xl font-bold">{rental.title || `${rental.bedroom} BHK for Rent`}</h1>
          <p className="text-gray-500 mt-1">{rental.apartment_name} · {rental.locality}</p>
        </div>

        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Pricing */}
          <div className="space-y-3">
            <h3 className="font-semibold text-lg border-b pb-2">Pricing</h3>
            <p className="text-3xl font-bold text-blue-600">₹{rental.price?.toLocaleString('en-IN')}<span className="text-sm text-gray-500">/month</span></p>
            {rental.deposit && <p className="text-gray-600">Deposit: ₹{rental.deposit?.toLocaleString('en-IN')}</p>}
            {rental.maintenance && <p className="text-gray-600">Maintenance: ₹{rental.maintenance?.toLocaleString('en-IN')}/month</p>}
          </div>

          {/* Property Details */}
          <div className="space-y-3">
            <h3 className="font-semibold text-lg border-b pb-2">Property Details</h3>
            <p><span className="text-gray-500">Type:</span> {rental.property_type}</p>
            <p><span className="text-gray-500">Bedrooms:</span> {rental.bedroom}</p>
            <p><span className="text-gray-500">Bathrooms:</span> {rental.bathroom}</p>
            <p><span className="text-gray-500">Floor:</span> {rental.floor} of {rental.total_floors}</p>
            <p><span className="text-gray-500">Furnishing:</span> {rental.furnishing}</p>
            {rental.facing_direction && <p><span className="text-gray-500">Facing:</span> {rental.facing_direction}</p>}
          </div>

          {/* Area */}
          <div className="space-y-3">
            <h3 className="font-semibold text-lg border-b pb-2">Area</h3>
            <p><span className="text-gray-500">Carpet Area:</span> {rental.carpet_area} sq.ft</p>
            {rental.super_builtup_area && <p><span className="text-gray-500">Super Built-up:</span> {rental.super_builtup_area} sq.ft</p>}
          </div>

          {/* Contact */}
          <div className="space-y-3">
            <h3 className="font-semibold text-lg border-b pb-2">Posted By</h3>
            <p><span className="text-gray-500">Name:</span> {rental.posted_by_name}</p>
            <p><span className="text-gray-500">Type:</span> {rental.posted_by}</p>
            {rental.posted_by_contact && <p><span className="text-gray-500">Contact:</span> {rental.posted_by_contact}</p>}
            <p><span className="text-gray-500">Posted:</span> {new Date(rental.posted_at).toLocaleDateString('en-IN')}</p>
          </div>
        </div>

        {rental.description && (
          <div className="p-6 border-t">
            <h3 className="font-semibold text-lg mb-2">Description</h3>
            <p className="text-gray-700">{rental.description}</p>
          </div>
        )}

        <div className="p-6 border-t bg-gray-50">
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${rental.is_live ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            {rental.is_live ? '● Active' : '● Inactive'}
          </span>
        </div>
      </div>
    </div>
  );
}
