import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../api';
import { ArrowLeft, Key, Wallet, Phone, Calendar, Compass, Shield, User, CheckCircle } from 'lucide-react';

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

  if (loading) return <div className="text-center py-20 text-gray-500">Loading rental details...</div>;
  if (error) return <div className="text-center py-20 text-red-500">{error}</div>;
  if (!rental) return <div className="text-center py-20 text-gray-500">Rental property not found.</div>;

  const monthlyTotal = (rental.price || 0) + (rental.maintenance || 0);

  return (
    <div className="max-w-5xl mx-auto pb-12">
      {/* Back button */}
      <Link to="/rentals" className="inline-flex items-center text-amber-700 hover:text-amber-800 font-medium mb-6">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Rentals
      </Link>

      {/* Header Banner - Warm Amber / Orange Theme */}
      <div className="bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 rounded-t-2xl p-8 text-white shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 bg-amber-800/40 text-amber-100 text-xs px-3 py-1 rounded-full uppercase tracking-wider font-semibold mb-3">
              <Key className="w-3.5 h-3.5" /> For Rent
            </div>
            <h1 className="text-3xl font-extrabold">{rental.title || `${rental.bedroom} BHK in ${rental.apartment_name || rental.locality}`}</h1>
            <p className="text-amber-100 text-lg mt-1">{rental.apartment_name ? `${rental.apartment_name}, ` : ''}{rental.locality}</p>
          </div>
          <div className="bg-white/15 backdrop-blur-md border border-white/20 rounded-xl p-5 text-right self-start md:self-auto min-w-[220px]">
            <p className="text-amber-200 text-xs font-semibold uppercase tracking-wider">Monthly Rent</p>
            <p className="text-3xl font-black mt-1">₹{rental.price?.toLocaleString('en-IN')}<span className="text-sm font-normal text-amber-100">/mo</span></p>
            <span className={`inline-block mt-2 text-xs px-2.5 py-0.5 rounded-full font-medium ${
              rental.is_live ? 'bg-emerald-400/20 text-emerald-100 border border-emerald-300/30' : 'bg-rose-400/20 text-rose-100 border border-rose-300/30'
            }`}>
              {rental.is_live ? '● Available for Rent' : '● Leased / Inactive'}
            </span>
          </div>
        </div>
      </div>

      {/* Quick Summary Strip */}
      <div className="bg-amber-50 border-x border-amber-200 grid grid-cols-2 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-amber-200 text-center py-4">
        <div className="py-2">
          <p className="text-xs text-amber-800 uppercase font-semibold">Bedrooms</p>
          <p className="text-xl font-bold text-amber-950 mt-0.5">{rental.bedroom} BHK</p>
        </div>
        <div className="py-2">
          <p className="text-xs text-amber-800 uppercase font-semibold">Bathrooms</p>
          <p className="text-xl font-bold text-amber-950 mt-0.5">{rental.bathroom} Baths</p>
        </div>
        <div className="py-2">
          <p className="text-xs text-amber-800 uppercase font-semibold">Carpet Area</p>
          <p className="text-xl font-bold text-amber-950 mt-0.5">{rental.carpet_area} <span className="text-sm font-normal text-amber-800">sq.ft</span></p>
        </div>
        <div className="py-2">
          <p className="text-xs text-amber-800 uppercase font-semibold">Furnishing</p>
          <p className="text-xl font-bold text-amber-950 mt-0.5 capitalize">{rental.furnishing || 'Unspecified'}</p>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="bg-white rounded-b-2xl shadow-lg border border-t-0 border-gray-200 p-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left 2 Cols: Details & Description */}
          <div className="lg:col-span-2 space-y-8">
            {/* Rental Financial Breakdown Card */}
            <div>
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Wallet className="w-5 h-5 text-amber-600" />
                Deposit & Expense Breakdown
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                  <p className="text-xs text-gray-500 font-medium">Monthly Rent</p>
                  <p className="text-xl font-bold text-gray-900 mt-1">₹{rental.price?.toLocaleString('en-IN')}</p>
                  <p className="text-xs text-gray-400 mt-0.5">Due 1st of month</p>
                </div>
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                  <p className="text-xs text-gray-500 font-medium">Security Deposit</p>
                  <p className="text-xl font-bold text-amber-700 mt-1">₹{rental.deposit?.toLocaleString('en-IN') || 'None'}</p>
                  <p className="text-xs text-gray-400 mt-0.5">Refundable</p>
                </div>
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                  <p className="text-xs text-gray-500 font-medium">Maintenance</p>
                  <p className="text-xl font-bold text-gray-900 mt-1">₹{rental.maintenance?.toLocaleString('en-IN') || '0'}</p>
                  <p className="text-xs text-gray-400 mt-0.5">Per month</p>
                </div>
              </div>
            </div>

            {/* Property Specs */}
            <div>
              <h2 className="text-lg font-bold text-gray-900 mb-4">Property Specifications</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-4 gap-x-6 text-sm">
                <div>
                  <p className="text-gray-500">Property Type</p>
                  <p className="font-semibold text-gray-900 capitalize mt-0.5">{rental.property_type}</p>
                </div>
                <div>
                  <p className="text-gray-500">Floor Level</p>
                  <p className="font-semibold text-gray-900 mt-0.5">Floor {rental.floor} of {rental.total_floors}</p>
                </div>
                <div>
                  <p className="text-gray-500">Facing Direction</p>
                  <p className="font-semibold text-gray-900 capitalize mt-0.5 flex items-center gap-1">
                    <Compass className="w-3.5 h-3.5 text-gray-400" />
                    {rental.facing_direction || 'Not specified'}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">Super Built-up Area</p>
                  <p className="font-semibold text-gray-900 mt-0.5">{rental.super_builtup_area || rental.carpet_area} sq.ft</p>
                </div>
                <div>
                  <p className="text-gray-500">Listing Source</p>
                  <p className="font-semibold text-gray-900 capitalize mt-0.5">{rental.website || 'Direct'}</p>
                </div>
                <div>
                  <p className="text-gray-500">Listing ID</p>
                  <p className="font-mono font-semibold text-gray-900 mt-0.5">{rental.listing_id}</p>
                </div>
              </div>
            </div>

            {/* Description */}
            {rental.description && (
              <div>
                <h2 className="text-lg font-bold text-gray-900 mb-3">About This Rental</h2>
                <div className="bg-amber-50/50 border border-amber-100 rounded-xl p-5">
                  <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{rental.description}</p>
                </div>
              </div>
            )}
          </div>

          {/* Right Col: Contact & Move-in Card */}
          <div className="space-y-6">
            {/* Contact Card */}
            <div className="bg-gradient-to-b from-gray-50 to-white border-2 border-amber-200/80 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
                <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-lg">
                  {rental.posted_by_name ? rental.posted_by_name.charAt(0) : <User className="w-6 h-6" />}
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">{rental.posted_by_name || 'Property Contact'}</h3>
                  <p className="text-xs text-amber-700 font-medium capitalize flex items-center gap-1">
                    <Shield className="w-3 h-3" /> Posted by {rental.posted_by || 'Agent'}
                  </p>
                </div>
              </div>

              <div className="mt-4 space-y-3">
                {rental.posted_by_contact && (
                  <div className="flex items-center gap-2.5 text-sm text-gray-700">
                    <Phone className="w-4 h-4 text-amber-600 flex-shrink-0" />
                    <span className="font-mono font-medium">{rental.posted_by_contact}</span>
                  </div>
                )}
                {rental.posted_at && (
                  <div className="flex items-center gap-2.5 text-xs text-gray-500">
                    <Calendar className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    <span>Listed on {new Date(rental.posted_at).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                  </div>
                )}
              </div>

              <div className="mt-6 pt-4 border-t border-gray-100">
                <div className="flex justify-between text-xs text-gray-500 mb-2">
                  <span>Estimated Total Monthly Outflow:</span>
                  <span className="font-bold text-gray-900">₹{monthlyTotal.toLocaleString('en-IN')}</span>
                </div>
                <button
                  onClick={() => alert(`Contacting ${rental.posted_by_name || 'Agent'} at ${rental.posted_by_contact || 'registered number'}`)}
                  className="w-full bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-semibold py-3 rounded-xl shadow-md transition flex items-center justify-center gap-2 text-sm"
                >
                  <Phone className="w-4 h-4" />
                  Contact for Visit
                </button>
              </div>
            </div>

            {/* Rental Policy Notice */}
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-xs text-blue-800 space-y-1.5">
              <p className="font-semibold flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-blue-600" />
                Verified Listing Policy
              </p>
              <p className="text-blue-700 leading-normal">
                Rent and security deposit amounts are regulated per standard Ivy Homes Gurgaon tenant protection guidelines.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
