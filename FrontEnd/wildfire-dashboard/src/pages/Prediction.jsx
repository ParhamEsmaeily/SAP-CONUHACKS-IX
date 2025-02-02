import { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import Loading from '../components/Loading';
import Error from '../components/Error';
import { parseCSV } from '../utils/csvParser';
import { parseJSONFile } from '../utils/jsonParser';

// // Create a custom red marker icon
// const redIcon = new L.Icon({
//     iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
//     shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
//     iconSize: [25, 41],
//     iconAnchor: [12, 41],
//     popupAnchor: [1, -34],
//     shadowSize: [41, 41]
// });

// Create different icons for different severity levels
const severityIcons = {
    high: new L.Icon({
        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
    }),
    medium: new L.Icon({
        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-orange.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
    }),
    low: new L.Icon({
        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-yellow.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
    }),
    unknown: new L.Icon({
        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-grey.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
    })
};

function Prediction() {
    const [markers, setMarkers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [mapCenter, setMapCenter] = useState([45.5017, -73.5673]);
    const [mapZoom, setMapZoom] = useState(13);
    const [markerCount, setMarkerCount] = useState(0);
    const MARKER_LIMIT = 1000;

    // Severity mapping function
    const mapSeverity = (severity) => {
        // Convert to string for consistent handling
        const sevStr = String(severity).toLowerCase();
        
        // Handle numeric values
        switch (sevStr) {
            case '0':
                return 'unknown';
            case '1':
                return 'low';
            case '2':
                return 'medium';
            case '3':
                return 'high';
            default:
        }

        // Handle text values
        switch (sevStr) {
            case 'low':
            case 'medium':
            case 'high':
                return sevStr;
            default:
                return 'unknown';
        }
    };

    const normalizeData = (data) => {
        // Ensure data is an array
        if (!Array.isArray(data)) {
            if (data.Assignment_Log) {
                data = data.Assignment_Log;
            } else if (data.predictions) {
                data = data.predictions;
            } else {
                throw new Error('Invalid data format');
            }
        }

        return data.map(row => {
            // Ensure latitude and longitude are numbers
            const lat = parseFloat(row.latitude);
            const lng = parseFloat(row.longitude);
            
            // Normalize severity value using the mapping function
            const severity = mapSeverity(row.severity);

            return {
                latitude: lat,
                longitude: lng,
                severity: severity,
                // Store original severity for display
                originalSeverity: row.severity
            };
        });
    };

    const processData = (data) => {
        try {
            const normalizedData = normalizeData(data);
            
            // Filter out invalid coordinates
            const validMarkers = normalizedData
                .filter(row => !isNaN(row.latitude) && !isNaN(row.longitude))
                .map(row => ({
                    position: [row.latitude, row.longitude],
                    severity: row.severity,
                    originalSeverity: row.originalSeverity
                }));

            if (validMarkers.length === 0) {
                throw new Error('No valid coordinates found in the data');
            }

            if (validMarkers.length > MARKER_LIMIT) {
                setError(`Warning: Dataset contains ${validMarkers.length} markers. Only the first ${MARKER_LIMIT} will be displayed.`);
                validMarkers.length = MARKER_LIMIT;
            }

            // Calculate center and zoom if there are markers
            const lats = validMarkers.map(m => m.position[0]);
            const lngs = validMarkers.map(m => m.position[1]);
            const centerLat = (Math.min(...lats) + Math.max(...lats)) / 2;
            const centerLng = (Math.min(...lngs) + Math.max(...lngs)) / 2;
            setMapCenter([centerLat, centerLng]);
            setMapZoom(10);

            setMarkers(validMarkers);
            setMarkerCount(validMarkers.length);
        } catch (err) {
            console.error('Data processing error:', err);
            setError(`Error processing data: ${err.message}`);
            setMarkers([]);
            setMarkerCount(0);
        }
    };

    const handleFileUpload = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        setLoading(true);
        setError(null);

        try {
            let data;
            if (file.type === 'application/json' || file.name.endsWith('.json')) {
                data = await parseJSONFile(file);
            } else if (file.type === 'text/csv' || file.name.endsWith('.csv')) {
                data = await parseCSV(file);
            } else {
                throw new Error('Unsupported file type. Please upload a CSV or JSON file.');
            }

            processData(data);
        } catch (err) {
            setError(`Error processing file: ${err.message}`);
            setMarkers([]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-4">
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
                <div className="flex justify-between items-center mb-4">
                    <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
                        Wildfire Prediction Map
                    </h1>
                    <div className="text-sm text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full">
                        Markers: {markerCount} / {MARKER_LIMIT}
                    </div>
                </div>
                <div className="mb-4">
                    <input
                        type="file"
                        accept=".csv,.json"
                        onChange={handleFileUpload}
                        className="block w-full text-sm text-gray-500 dark:text-gray-300
                                 file:mr-4 file:py-2 file:px-4
                                 file:rounded-full file:border-0
                                 file:text-sm file:font-semibold
                                 file:bg-blue-50 file:text-blue-700
                                 hover:file:bg-blue-100
                                 dark:file:bg-gray-700 dark:file:text-gray-200"
                    />
                    <div className="flex justify-between mt-2">
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Supported formats: CSV and JSON
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Maximum markers: {MARKER_LIMIT}
                        </p>
                    </div>
                </div>

                {loading && <Loading />}
                {error && <Error message={error} />}
                <div className="h-[600px] rounded-lg overflow-hidden">
                    <MapContainer
                        center={mapCenter}
                        zoom={mapZoom}
                        className="h-full w-full"
                    >
                        <TileLayer
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        />
                        {markers.map((marker, idx) => (
                            <Marker 
                                key={idx} 
                                position={marker.position}
                                icon={severityIcons[marker.severity] || severityIcons.unknown}
                            >
                                <Popup>
                                    <div className="text-center">
                                        <h3 className="font-bold capitalize">
                                            {marker.severity} Severity
                                        </h3>
                                        <p className="text-xs text-gray-600">
                                            Original value: {marker.originalSeverity}
                                        </p>
                                        <p className="text-sm mt-1">
                                            Lat: {marker.position[0].toFixed(4)}<br/>
                                            Long: {marker.position[1].toFixed(4)}
                                        </p>
                                    </div>
                                </Popup>
                            </Marker>
                        ))}
                    </MapContainer>
                </div>
                
                {/* Updated Legend */}
                <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <h3 className="font-bold mb-2 text-gray-800 dark:text-white">Legend</h3>
                    <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
                        <div className="flex items-center">
                            <div className="w-4 h-4 bg-red-500 rounded-full mr-2"></div>
                            <span className="text-sm text-gray-600 dark:text-gray-300">
                                High Severity (3)
                            </span>
                        </div>
                        <div className="flex items-center">
                            <div className="w-4 h-4 bg-orange-500 rounded-full mr-2"></div>
                            <span className="text-sm text-gray-600 dark:text-gray-300">
                                Medium Severity (2)
                            </span>
                        </div>
                        <div className="flex items-center">
                            <div className="w-4 h-4 bg-yellow-500 rounded-full mr-2"></div>
                            <span className="text-sm text-gray-600 dark:text-gray-300">
                                Low Severity (1)
                            </span>
                        </div>
                        <div className="flex items-center">
                            <div className="w-4 h-4 bg-gray-500 rounded-full mr-2"></div>
                            <span className="text-sm text-gray-600 dark:text-gray-300">
                                Unknown (0)
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Prediction;