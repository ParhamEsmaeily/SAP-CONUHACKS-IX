import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import Loading from '../components/Loading';
import Error from '../components/Error';
import { parseCSV } from '../utils/csvParser';

// Fix for default marker icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
    iconUrl: require('leaflet/dist/images/marker-icon.png'),
    shadowUrl: require('leaflet/dist/images/marker-shadow.png')
});

function Prediction() {
    const [markers, setMarkers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

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
                        severity: row.severity || 'unknown'
                    }));
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
                        center={[45.5017, -73.5673]} // Montreal coordinates as default
                        zoom={13}
                        className="h-full w-full"
                    >
                        <TileLayer
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        />
                        {markers.map((marker, idx) => (
                            <Marker key={idx} position={marker.position}>
                                <Popup>
                                    Severity: {marker.severity}
                                </Popup>
                            </Marker>
                        ))}
                    </MapContainer>
                </div>
            </div>
        </div>
    );
}

export default Prediction;
