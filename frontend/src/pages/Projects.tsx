import { useState, useEffect } from 'react';
import { api } from '../api';

export default function Projects() {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const LIMIT = 50;

  const [filters, setFilters] = useState({
    locality: '',
    project_status: ''
  });

  const fetchProjects = async (currentOffset: number) => {
    setLoading(true);
    try {
      const data = await api.getProjects({
        offset: currentOffset,
        limit: LIMIT,
        ...filters
      });
      setProjects(data.results || []);
      setHasMore(data.has_more);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects(offset);
  }, [offset, filters]);

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setOffset(0);
  };

  return (
    <div>
      <div className="bg-white p-4 rounded-lg shadow mb-6 space-y-4">
        <h2 className="font-semibold text-lg">Project Filters</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl">
          <input
            type="text"
            placeholder="Locality"
            className="border p-2 rounded"
            value={filters.locality}
            onChange={(e) => handleFilterChange('locality', e.target.value)}
          />
          <select 
            className="border p-2 rounded"
            value={filters.project_status}
            onChange={(e) => handleFilterChange('project_status', e.target.value)}
          >
            <option value="">Any Status</option>
            <option value="under construction">Under Construction</option>
            <option value="ready to move">Ready to Move</option>
            <option value="new launch">New Launch</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-10">Loading projects...</div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {projects.map((item) => (
              <div key={item.project_id} className="bg-white rounded-lg shadow overflow-hidden">
                <div className="p-4 border-b">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-lg">{item.apartment_name}</h3>
                      <p className="text-gray-500 text-sm">by {item.developer_name}</p>
                    </div>
                    <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                      {item.project_status}
                    </span>
                  </div>
                </div>
                <div className="p-4 grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Locality</p>
                    <p className="font-medium">{item.locality}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Available Listings</p>
                    <p className="font-medium">{item.total_listings}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Price Range</p>
                    <p className="font-medium text-blue-600">
                      {/* Price in Crores -> format properly if < 1000 */}
                      ₹{item.price_min < 1000 ? `${item.price_min} Cr` : item.price_min?.toLocaleString('en-IN')} - 
                      {item.price_max < 1000 ? ` ${item.price_max} Cr` : ` ₹${item.price_max?.toLocaleString('en-IN')}`}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Total Units</p>
                    <p className="font-medium">{item.total_units}</p>
                  </div>
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
