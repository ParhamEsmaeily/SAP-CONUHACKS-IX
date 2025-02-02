import { useState, useEffect } from 'react';
import { Bar } from 'react-chartjs-2';

function Analysis() {
  const [currentSolution, setCurrentSolution] = useState({
    "Number of fires addressed": 32,
    "Number of fires missed": 0,
    "Total operational costs": 11728000,
    "Estimated damage costs": 0,
    "Fire severity (addressed)": {
      "low": 14,
      "medium": 11,
      "high": 7
    }
  });

  const [previousSolution, setPreviousSolution] = useState({
    "Number of fires addressed": 28,
    "Number of fires delayed": 4,
    "Total operational costs": 123000,
    "Estimated damage costs": 550000,
    "Fire severity report": {
      "low": 13,
      "medium": 10,
      "high": 5
    }
  });

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
      <div className={`bg-white rounded-xl shadow-lg p-6 ${isCurrentSolution ? 'border-l-4 border-blue-500' : 'border-l-4 border-gray-400'}`}>
        <h2 className={`text-2xl font-bold mb-6 ${isCurrentSolution ? 'text-blue-600' : 'text-gray-600'}`}>
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
          <h3 className="text-lg font-semibold mb-4">Severity Distribution</h3>
          <div className="h-64">
            <Bar data={severityChartData} options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  display: false
                }
              }
            }} />
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <SolutionCard 
          title="Current Solution" 
          data={currentSolution} 
          isCurrentSolution={true}
        />
        <SolutionCard 
          title="Previous Solution" 
          data={previousSolution} 
          isCurrentSolution={false}
        />
      </div>

      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">Comparison Analysis</h2>
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

// Reusable components
const StatBox = ({ title, value, icon }) => (
  <div className="bg-gray-50 rounded-lg p-4 hover:shadow-md transition-shadow">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-gray-500 text-sm">{title}</p>
        <p className="text-2xl font-bold text-gray-800">{value}</p>
      </div>
      <span className="text-2xl">{icon}</span>
    </div>
  </div>
);

const ComparisonMetric = ({ title, value, trend }) => (
  <div className="bg-gray-50 rounded-lg p-6">
    <h3 className="text-lg font-semibold text-gray-700 mb-2">{title}</h3>
    <div className="flex items-center">
      <span className={`text-2xl font-bold ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
        {value}
      </span>
      {trend === 'up' ? (
        <svg className="w-6 h-6 text-green-600 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
      ) : (
        <svg className="w-6 h-6 text-red-600 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 17h8m0 0v-8m0 8l-8-8-4 4-6-6" />
        </svg>
      )}
    </div>
  </div>
);

export default Analysis;