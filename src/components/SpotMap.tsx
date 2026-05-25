import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, AttributionControl } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Spot } from '../data/spots';
import L from 'leaflet';
import { Navigation } from 'lucide-react';
import { renderToString } from 'react-dom/server';
import { useLanguage } from '../i18n/LanguageContext';

// Fix for default marker icon in react-leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface SpotMapProps {
  spots: Spot[];
  selectedSpot: Spot;
  onSelectSpot: (spot: Spot) => void;
  windSpeed: number;
  windDirection: number;
}

const customIcon = (direction: number) => {
  const iconHtml = renderToString(
    <div style={{ transform: `rotate(${direction + 180}deg)`, display: 'inline-block' }}>
      <Navigation className="text-blue-500 fill-blue-100 drop-shadow-md" size={32} />
    </div>
  );
  
  return L.divIcon({
    html: iconHtml,
    className: 'custom-wind-marker',
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });
};

function MapUpdater({ center }: { center: [number, number] }) {
  const map = useMap();
  map.setView(center, map.getZoom());
  return null;
}

export function SpotMap({ spots, selectedSpot, onSelectSpot, windSpeed, windDirection }: SpotMapProps) {
  const { lang, t } = useLanguage();

  return (
    <div className="h-64 w-full rounded-xl overflow-hidden shadow-lg border border-slate-700 relative z-0" style={{ direction: 'ltr' }}>
      <MapContainer 
        center={[selectedSpot.lat, selectedSpot.lng]} 
        zoom={11} 
        scrollWheelZoom={false}
        className="h-full w-full relative z-0"
        attributionControl={false}
      >
        <AttributionControl prefix={false} />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />
        <MapUpdater center={[selectedSpot.lat, selectedSpot.lng]} />
        
        {spots.map((spot) => (
          <Marker 
            key={spot.id} 
            position={[spot.lat, spot.lng]}
            icon={spot.id === selectedSpot.id ? customIcon(windDirection) : new L.Icon.Default()}
            eventHandlers={{
              click: () => onSelectSpot(spot),
            }}
          >
            <Popup className="bg-slate-800 text-slate-100 border-none rounded shadow-xl">
              <div className="font-semibold">{spot.name[lang]}</div>
              {spot.id === selectedSpot.id && (
                 <div className="text-xs text-blue-300 mt-1">{t('wind')}: {windSpeed} m/s</div>
              )}
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
