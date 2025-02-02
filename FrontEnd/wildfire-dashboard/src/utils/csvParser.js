import Papa from 'papaparse';

export const parseCSV = (file) => {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      complete: (results) => {
        resolve(results.data);
      },
      error: (error) => {
        reject(error);
      }
    });
  });
};

// New function for historical data
export const parseHistoricalCSV = (content) => {
  return new Promise((resolve, reject) => {
    Papa.parse(content, {
      header: true,
      complete: (results) => {
        const processedData = results.data.map(row => ({
          timestamp: row.timestamp,
          fire_start_time: row.fire_start_time,
          severity: row.severity,
          latitude: row.latitude,
          longitude: row.longitude
        }));
        resolve(processedData);
      },
      error: (error) => {
        reject(error);
      }
    });
  });
};