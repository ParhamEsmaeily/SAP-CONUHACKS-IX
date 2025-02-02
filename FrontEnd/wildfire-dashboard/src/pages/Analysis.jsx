import { useState, useEffect } from 'react';
import { Bar } from 'react-chartjs-2';
import { fetchJSON } from '../utils/jsonParser';
import Loading from '../components/Loading';
import Error from '../components/Error';

function Analysis() {
  const [currentSolution, setCurrentSolution] = useState(null);
  const [previousSolution, setPreviousSolution] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch from public folder using the public URL
        const supposedData = await fetchJSON('/model1_supposedTrue.json');

        // Transform the data for current solution view
        setCurrentSolution({
          "Number of fires addressed": supposedData.summary.total_fires_handled,
          "Number of fires missed": supposedData.summary.total_fires_missed,
          "Total operational costs": supposedData.costs.operational,
          "Estimated damage costs": supposedData.costs.damage,
          "Fire severity (addressed)": {
            "low": supposedData.by_severity.handled.low,
            "medium": supposedData.by_severity.handled.medium,
            "high": supposedData.by_severity.handled.high
          }
        });

        // Expected solution
        const expectedData = await fetchJSON('/model1_logical.json');
        setPreviousSolution({
          "Number of fires addressed": expectedData.summary.total_fires_handled,
          "Number of fires delayed": expectedData.summary.total_fires_missed,
          "Total operational costs": expectedData.costs.operational,
          "Estimated damage costs": expectedData.costs.damage,
          "Fire severity report": {
            "low": expectedData.by_severity.handled.low,
            "medium": expectedData.by_severity.handled.medium,
            "high": expectedData.by_severity.handled.high
          }
        });

        // // Use the same data but slightly modified for previous solution
        // // check if previous solution is null or not
        // if (!copiedData) {
        //   setPreviousSolution({
        //     "Number of fires addressed": supposedData.summary.total_fires_handled,
        //     "Number of fires delayed": supposedData.summary.total_fires_missed,
        //     "Total operational costs": supposedData.costs.operational,
        //     "Estimated damage costs": supposedData.costs.damage,
        //     "Fire severity report": {
        //       "low": supposedData.by_severity.handled.low,
        //       "medium": supposedData.by_severity.handled.medium,
        //       "high": supposedData.by_severity.handled.high
        //     }
        //   });
        // }
        // else {
        //   setPreviousSolution({
        //     "Number of fires addressed": copiedData.summary.total_fires_handled,
        //     "Number of fires delayed": copiedData.summary.total_fires_missed,
        //     "Total operational costs": copiedData.costs.operational,
        //     "Estimated damage costs": copiedData.costs.damage,
        //     "Fire severity report": {
        //       "low": copiedData.by_severity.handled.low,
        //       "medium": copiedData.by_severity.handled.medium,
        //       "high": copiedData.by_severity.handled.high
        //     }
        //   });
        // }

        setLoading(false);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load analysis data. Make sure the JSON file is in the public folder.');
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const SolutionCard = ({ title, data, isCurrentSolution }) => {
    const severityChartData = {
      labels: ['Low', 'Medium', 'High'],
      datasets: [{
        label: 'Fire Severity',
        data: isCurrentSolution 
          ? [data["Fire severity (addressed)"].low, data["Fire severity (addressed)"].medium, data["Fire severity (addressed)"].high]
          : [data["Fire severity report"].low, data["Fire severity report"].medium, data["Fire severity report"].high],
        backgroundColor: [
          'rgba(34, 197, 94, 0.6)',
          'rgba(234, 179, 8, 0.6)',
          'rgba(239, 68, 68, 0.6)'
        ],
        borderWidth: 1
      }]
    };

    return (
      <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 ${isCurrentSolution ? 'border-l-4 border-blue-500' : 'border-l-4 border-gray-400'}`}>
        <h2 className={`text-2xl font-bold mb-6 ${isCurrentSolution ? 'text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-400'}`}>
          {title}
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <StatBox 
            title="Fires Addressed"
            value={data["Number of fires addressed"]}
            icon="🔥"
          />
          <StatBox 
            title={isCurrentSolution ? "Fires Missed" : "Fires Delayed"}
            value={isCurrentSolution ? data["Number of fires missed"] : data["Number of fires delayed"]}
            icon="⚠️"
          />
          <StatBox 
            title="Operational Costs"
            value={`$${data["Total operational costs"].toLocaleString()}`}
            icon="💰"
          />
          <StatBox 
            title="Damage Costs"
            value={`$${data["Estimated damage costs"].toLocaleString()}`}
            icon="💸"
          />
        </div>

        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-4 dark:text-white">Severity Distribution</h3>
          <div className="h-64">
            <Bar data={severityChartData} options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  display: false
                }
              },
              scales: {
                y: {
                  ticks: {
                    color: document.documentElement.classList.contains('dark') ? '#fff' : '#666'
                  }
                },
                x: {
                  ticks: {
                    color: document.documentElement.classList.contains('dark') ? '#fff' : '#666'
                  }
                }
              }
            }} />
          </div>
        </div>
      </div>
    );
  };

  if (loading) return <Loading />;
  if (error) return <Error message={error} />;
  if (!currentSolution || !previousSolution) return <Error message="No data available" />;

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <SolutionCard 
          title="Our Solution" 
          data={currentSolution} 
          isCurrentSolution={true}
        />
        <SolutionCard 
          title="Expected Solution" 
          data={previousSolution} 
          isCurrentSolution={false}
        />
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">Comparison Analysis</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ComparisonMetric 
            title="Improvement in Fires Addressed"
            value={`${((currentSolution["Number of fires addressed"] - previousSolution["Number of fires addressed"]) / previousSolution["Number of fires addressed"] * 100).toFixed(1)}%`}
            trend="up"
          />
          <ComparisonMetric 
            title="Cost Efficiency"
            value={`${((previousSolution["Total operational costs"] - currentSolution["Total operational costs"]) / previousSolution["Total operational costs"] * 100).toFixed(1)}%`}
            trend="up"
          />
        </div>
      </div>
    </div>
  );
}

const StatBox = ({ title, value, icon }) => (
  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-gray-500 dark:text-gray-300 text-sm">{title}</p>
        <p className="text-2xl font-bold text-gray-800 dark:text-white">{value}</p>
      </div>
      <span className="text-2xl">{icon}</span>
    </div>
  </div>
);

const ComparisonMetric = ({ title, value, trend }) => (
  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
    <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-2">{title}</h3>
    <div className="flex items-center">
      <span className={`text-2xl font-bold ${trend === 'up' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
        {value}
      </span>
      {trend === 'up' ? (
        <svg className="w-6 h-6 text-green-600 dark:text-green-400 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
      ) : (
        <svg className="w-6 h-6 text-red-600 dark:text-red-400 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 17h8m0 0v-8m0 8l-8-8-4 4-6-6" />
        </svg>
      )}
    </div>
  </div>
);

export default Analysis;
