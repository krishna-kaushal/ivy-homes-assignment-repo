import { BarChart, AlertTriangle, Building, LayoutDashboard, FileX } from 'lucide-react';

export default function Insights() {
  // Since GET /v1/analytics/summary returns 404 Not Found (Lie #8),
  // we render the insights calculated offline.
  
  return (
    <div className="space-y-6">
      <div className="bg-red-50 border-l-4 border-red-500 p-4">
        <div className="flex items-center">
          <AlertTriangle className="h-6 w-6 text-red-500 mr-3" />
          <h2 className="text-lg font-bold text-red-700">API Endpoint Missing</h2>
        </div>
        <p className="mt-2 text-red-700">
          The documentation claims <code className="bg-red-100 px-1 rounded">GET /v1/analytics/summary</code> returns city aggregates. 
          In reality, it returns a 404 Not Found error. The insights below were computed directly from the raw data.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-500 font-medium">Total Listings</h3>
            <LayoutDashboard className="text-blue-500" />
          </div>
          <p className="text-3xl font-bold">3,500</p>
          <p className="text-sm text-red-500 mt-2">API `total` parameter lied (said 3320)</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-500 font-medium">Active Listings</h3>
            <BarChart className="text-green-500" />
          </div>
          <p className="text-3xl font-bold">2,792</p>
          <p className="text-sm text-red-500 mt-2">API doesn't filter inactive as claimed</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-500 font-medium">Unique Properties</h3>
            <Building className="text-purple-500" />
          </div>
          <p className="text-3xl font-bold">3,497</p>
          <p className="text-sm text-red-500 mt-2">3 Duplicate properties found</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-500 font-medium">Corrupt / Fake</h3>
            <FileX className="text-orange-500" />
          </div>
          <p className="text-3xl font-bold">24</p>
          <p className="text-sm text-orange-600 mt-2">Math impossible or bait pricing</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-bold mb-4 border-b pb-2">Gurgaon Real Estate Facts</h3>
          <ul className="space-y-4">
            <li className="flex justify-between items-center">
              <span className="text-gray-600">Total Monthly Rent in Golf Course Road</span>
              <span className="font-semibold text-lg">₹46,62,400</span>
            </li>
            <li className="flex justify-between items-center">
              <span className="text-gray-600">Avg Price/SqFt (2 BHK)</span>
              <span className="font-semibold text-lg">₹26,861</span>
            </li>
            <li className="flex justify-between items-center">
              <span className="text-gray-600">Costliest Project (P60060)</span>
              <span className="font-semibold text-lg text-blue-600">₹5.83 Crores</span>
            </li>
            <li className="flex justify-between items-center">
              <span className="text-gray-600">Projects with Wrong Listing Counts</span>
              <span className="font-semibold text-lg text-red-500">295 projects</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
