import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../api';
import { Building, MapPin, Calendar, Shield, Layers, Home } from 'lucide-react';

export default function ProjectDetail() {
  const { id } = useParams();
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProject = async () => {
      setLoading(true);
      setError('');
      try {
        if (!id) return;
        const data = await api.getProject(id);
        setProject(data);
      } catch (err: any) {
        setError(err.message || 'Failed to load project');
      } finally {
        setLoading(false);
      }
    };
    fetchProject();
  }, [id]);

  if (loading) return <div className="text-center py-10">Loading project details...</div>;
  if (error) return <div className="text-center py-10 text-red-500">{error}</div>;
  if (!project) return <div className="text-center py-10">Project not found</div>;

  const formatPrice = (val: number) => {
    if (!val) return 'N/A';
    if (val >= 10) return `₹${val} L`;
    return `₹${val} Cr`;
  };

  return (
    <div className="max-w-5xl mx-auto">
      <Link to="/projects" className="text-blue-600 hover:underline mb-4 inline-block">← Back to Projects</Link>

      {/* Hero Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-t-lg p-8 text-white">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold">{project.apartment_name}</h1>
            <p className="text-blue-200 mt-1 flex items-center gap-1">
              <Building className="w-4 h-4" /> by {project.developer_name}
            </p>
            <p className="text-blue-200 mt-1 flex items-center gap-1">
              <MapPin className="w-4 h-4" /> {project.locality}
            </p>
          </div>
          <span className="bg-white/20 backdrop-blur px-4 py-2 rounded-full text-sm font-medium">
            {project.project_status}
          </span>
        </div>
        <div className="mt-6 flex gap-8">
          <div>
            <p className="text-blue-200 text-sm">Price Range</p>
            <p className="text-2xl font-bold">{formatPrice(project.price_min)} – {formatPrice(project.price_max)}</p>
          </div>
          <div>
            <p className="text-blue-200 text-sm">Area Range</p>
            <p className="text-2xl font-bold">{project.min_area_sqft} – {project.max_area_sqft} sq.ft</p>
          </div>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="bg-white border-x grid grid-cols-4 divide-x text-center py-4">
        <div>
          <p className="text-2xl font-bold text-blue-600">{project.total_units}</p>
          <p className="text-gray-500 text-sm">Total Units</p>
        </div>
        <div>
          <p className="text-2xl font-bold text-blue-600">{project.total_towers}</p>
          <p className="text-gray-500 text-sm">Towers</p>
        </div>
        <div>
          <p className="text-2xl font-bold text-blue-600">{project.total_floors}</p>
          <p className="text-gray-500 text-sm">Floors</p>
        </div>
        <div>
          <p className="text-2xl font-bold text-blue-600">{project.total_listings}</p>
          <p className="text-gray-500 text-sm">Active Listings</p>
        </div>
      </div>

      <div className="bg-white rounded-b-lg shadow-lg overflow-hidden">
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Timeline */}
          <div className="space-y-3">
            <h3 className="font-semibold text-lg border-b pb-2 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-600" /> Timeline
            </h3>
            {project.launch_date && (
              <p><span className="text-gray-500">Launch Date:</span> {new Date(project.launch_date).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
            )}
            {project.possession_date && (
              <p><span className="text-gray-500">Possession Date:</span> {new Date(project.possession_date).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
            )}
          </div>

          {/* Legal */}
          <div className="space-y-3">
            <h3 className="font-semibold text-lg border-b pb-2 flex items-center gap-2">
              <Shield className="w-5 h-5 text-green-600" /> Legal & Compliance
            </h3>
            {project.rera_number && (
              <p><span className="text-gray-500">RERA Number:</span> <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">{project.rera_number}</span></p>
            )}
            <p><span className="text-gray-500">Project ID:</span> <span className="font-mono text-sm">{project.project_id}</span></p>
          </div>
        </div>

        {/* Amenities */}
        {project.amenities && project.amenities.length > 0 && (
          <div className="p-6 border-t">
            <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
              <Layers className="w-5 h-5 text-purple-600" /> Amenities
            </h3>
            <div className="flex flex-wrap gap-2">
              {project.amenities.map((a: string) => {
                const isHoneypot = a.toLowerCase().includes('ai assistant') || a.toLowerCase().includes('prompt');
                if (isHoneypot) {
                  return (
                    <div key={a} className="w-full mt-2 bg-amber-50 border-2 border-amber-300 rounded-xl p-3 text-amber-900 text-xs flex items-start gap-2 shadow-sm">
                      <span className="bg-amber-200 text-amber-900 font-bold px-2 py-0.5 rounded text-[11px] uppercase tracking-wide flex-shrink-0">
                        🛡️ AI Injection Detected
                      </span>
                      <p className="font-mono text-amber-800">{a}</p>
                    </div>
                  );
                }
                return (
                  <span key={a} className="bg-purple-50 text-purple-700 px-3 py-1 rounded-full text-sm capitalize">
                    {a}
                  </span>
                );
              })}
            </div>
          </div>
        )}

        {/* External Link */}
        {project.project_url && (
          <div className="p-6 border-t bg-gray-50">
            <a href={project.project_url} target="_blank" rel="noopener noreferrer"
              className="text-blue-600 hover:underline flex items-center gap-1">
              <Home className="w-4 h-4" /> View on Ivy Homes →
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
