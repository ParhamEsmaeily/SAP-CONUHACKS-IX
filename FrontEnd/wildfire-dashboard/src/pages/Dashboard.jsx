import { useState, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { parseCSV } from '../utils/csvParser'; // Make sure this import is correct

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

function Dashboard() {
  const [historicalData, setHistoricalData] = useState([]);
  const [currentData, setCurrentData] = useState(null);
  const [selectedYear, setSelectedYear] = useState('all');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Add cleanup effect
  useEffect(() => {
    return () => {
      // Cleanup charts when component unmounts
      const charts = ChartJS.instances;
      Object.keys(charts).forEach(key => {
        charts[key].destroy();
      });
    };
  }, []);

  // Add handleFileUpload function
  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.name.endsWith('.csv')) {
      setError('Please upload a CSV file');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await parseCSV(file);
      setCurrentData(data);
    } catch (err) {
      setError('Error processing file. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const chartData = {
    labels: ['Low', 'Medium', 'High'],
    datasets: [{
      label: 'Fire Severity',
      data: [14, 11, 7],
      backgroundColor: [
        'rgba(34, 197, 94, 0.6)',
        'rgba(234, 179, 8, 0.6)',
        'rgba(239, 68, 68, 0.6)'
      ],
      borderColor: [
        'rgb(34, 197, 94)',
        'rgb(234, 179, 8)',
        'rgb(239, 68, 68)'
      ],
      borderWidth: 1
    }]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Wildfire Severity Distribution'
      }
    },
    scales: {
      y: {
        beginAtZero: true
      }
    }
  };

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-6">Historical Wildfire Data</h2>
        
        <div className="mb-4">
          <select 
            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
          >
            <option value="all">All Years</option>
            <option value="2023">2023</option>
            <option value="2022">2022</option>
          </select>
        </div>

        <div className="h-96">
          <Bar 
            data={chartData} 
            options={options} 
            id="wildfireChart"
          />
        </div>
      </div>

      {/* File Upload Section */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-6">Current Wildfire Data</h2>
        
        <div className="flex items-center justify-center w-full">
          <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <svg className="w-10 h-10 mb-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <p className="mb-2 text-sm text-gray-500">Click to upload or drag and drop</p>
              <p className="text-xs text-gray-500">CSV file only</p>
            </div>
            <input 
              type="file" 
              className="hidden" 
              accept=".csv" 
              onChange={handleFileUpload} 
            />
          </label>
        </div>

        {loading && (
          <div className="mt-4 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
          </div>
        )}

        {error && (
          <div className="mt-4 text-red-500 text-sm text-center">
            {error}
          </div>
        )}

        {currentData && (
          <div className="mt-6">
            {/* Add visualization for current data here */}
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;