import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

function MapClickHandler({ onPositionSelect }) {
    useMapEvents({
        click(e) {
            onPositionSelect(e.latlng.lat, e.latlng.lng);
        },
    });
    return null;
}

export default function LocationPicker({ onLocationSelected, initialPosition = null }) {
    const [position, setPosition] = useState(initialPosition || [14.7167, -17.4677]);
    const [loading, setLoading] = useState(!initialPosition);

    useEffect(() => {
        if (!initialPosition && navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    setPosition([pos.coords.latitude, pos.coords.longitude]);
                    setLoading(false);
                    if (onLocationSelected) {
                        onLocationSelected(pos.coords.latitude, pos.coords.longitude);
                    }
                },
                () => {
                    setLoading(false);
                    if (onLocationSelected) {
                        onLocationSelected(position[0], position[1]);
                    }
                }
            );
        }
    }, []);

    const handleSelect = (lat, lng) => {
        setPosition([lat, lng]);
        if (onLocationSelected) {
            onLocationSelected(lat, lng);
        }
    };

    return (
        <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
                📍 Votre position (cliquez sur la carte)
            </label>
            {loading && (
                <p className="text-xs text-gray-400">Détection de votre position...</p>
            )}
            <div className="rounded-xl overflow-hidden border border-gray-200" style={{ height: '250px' }}>
                <MapContainer
                    center={position}
                    zoom={13}
                    style={{ height: '100%', width: '100%' }}
                    scrollWheelZoom={true}
                >
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <Marker position={position} />
                    <MapClickHandler onPositionSelect={handleSelect} />
                </MapContainer>
            </div>
            <p className="text-[10px] text-gray-400">
                Position : {position[0].toFixed(6)}, {position[1].toFixed(6)}
            </p>
        </div>
    );
}
