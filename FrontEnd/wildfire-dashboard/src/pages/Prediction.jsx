import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import Loading from '../components/Loading';
import Error from '../components/Error';
import { parseCSV } from '../utils/csvParser';

// Create a custom red marker icon
const redIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

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
    const [mapCenter, setMapCenter] = useState([45.5017, -73.5673]); // Montreal coordinates as default
    const [mapZoom, setMapZoom] = useState(13);

    const handleFileUpload = async (event) => {
        const file = event.target.files[0];
        if (file) {
            setLoading(true);
            setError(null);
            try {
                const data = await parseCSV(file);
                const validMarkers = data
                    .filter(row => row.latitude && row.longitude)
                    .map(row => ({
                        position: [parseFloat(row.latitude), parseFloat(row.longitude)],
                        severity: row.severity?.toLowerCase() || 'unknown'
                    }));
                
                // Calculate center and zoom if there are markers
                if (validMarkers.length > 0) {
                    const lats = validMarkers.map(m => m.position[0]);
                    const lngs = validMarkers.map(m => m.position[1]);
                    const centerLat = (Math.min(...lats) + Math.max(...lats)) / 2;
                    const centerLng = (Math.min(...lngs) + Math.max(...lngs)) / 2;
                    setMapCenter([centerLat, centerLng]);
                    setMapZoom(10); // Adjust zoom level as needed
                }
                
                setMarkers(validMarkers);
            } catch (err) {
                setError('Error parsing CSV file. Please ensure it contains latitude and longitude columns.');
            } finally {
                setLoading(false);
            }
        }
    };

    return (
        <div className="space-y-4">
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
                    Wildfire Prediction Map
                </h1>
                <div className="mb-4">
                    <input
                        type="file"
                        accept=".csv"
                        onChange={handleFileUpload}
                        className="block w-full text-sm text-gray-500 dark:text-gray-300
                                 file:mr-4 file:py-2 file:px-4
                                 file:rounded-full file:border-0
                                 file:text-sm file:font-semibold
                                 file:bg-blue-50 file:text-blue-700
                                 hover:file:bg-blue-100
                                 dark:file:bg-gray-700 dark:file:text-gray-200"
                    />
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
                                        <p className="text-sm">
                                            Lat: {marker.position[0].toFixed(4)}<br/>
                                            Long: {marker.position[1].toFixed(4)}
                                        </p>
                                    </div>
                                </Popup>
                            </Marker>
                        ))}
                    </MapContainer>
                </div>
                
                {/* Legend */}
                <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <h3 className="font-bold mb-2 text-gray-800 dark:text-white">Legend</h3>
                    <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
                        <div className="flex items-center">
                            <div className="w-4 h-4 bg-red-500 rounded-full mr-2"></div>
                            <span className="text-sm text-gray-600 dark:text-gray-300">High Severity</span>
                        </div>
                        <div className="flex items-center">
                            <div className="w-4 h-4 bg-orange-500 rounded-full mr-2"></div>
                            <span className="text-sm text-gray-600 dark:text-gray-300">Medium Severity</span>
                        </div>
                        <div className="flex items-center">
                            <div className="w-4 h-4 bg-yellow-500 rounded-full mr-2"></div>
                            <span className="text-sm text-gray-600 dark:text-gray-300">Low Severity</span>
                        </div>
                        <div className="flex items-center">
                            <div className="w-4 h-4 bg-gray-500 rounded-full mr-2"></div>
                            <span className="text-sm text-gray-600 dark:text-gray-300">Unknown</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Prediction;