import { geoJsonData } from './pois.js';
const {
  useState,
  useEffect,
  useCallback,
  useRef,
  memo
} = React;
const MapComponent = memo(({
  pois,
  onSelectPoi,
  selectedPois,
  routeGeoJson
}) => {
  const mapRef = useRef(null);
  useEffect(() => {
    if (!mapRef.current) {
      mapRef.current = L.map('map').setView([48.669, 19.699], 8);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(mapRef.current);
    }
    const markers = L.markerClusterGroup();
    const geoJsonLayer = L.geoJSON(pois, {
      pointToLayer: (feature, latlng) => {
        return L.circleMarker(latlng, {
          radius: 8,
          color: feature.properties.type === "castle" ? "#ff5733" : feature.properties.type === "museum" ? "#9933cc" : feature.properties.type === "cave" ? "#33ccff" : feature.properties.type === "nature" ? "#33cc33" : feature.properties.type === "church" ? "#ffcc00" : feature.properties.type === "village" ? "#cc6699" : feature.properties.type === "spa" ? "#ff99cc" : "#ff0000",
          fillOpacity: 0.8
        });
      },
      onEachFeature: (feature, layer) => {
        const {
          name,
          type,
          description,
          image
        } = feature.properties;
        const popupContent = ['<div class="p-2">', `<h3 class="text-lg font-bold">${name}</h3>`, `<p><strong>Type:</strong> ${type.charAt(0).toUpperCase() + type.slice(1)}</p>`, `<p><strong>Description:</strong> ${description}</p>`, image ? `<img src="${image}" alt="${name}" class="mt-2" />` : '', '</div>'].join('');
        layer.bindPopup(popupContent, {
          maxWidth: 300
        });
        layer.on('click', () => onSelectPoi(feature));
      }
    });
    markers.addLayer(geoJsonLayer);
    mapRef.current.addLayer(markers);

    // Draw route if available
    if (routeGeoJson) {
      const routeLayer = L.geoJSON(routeGeoJson, {
        style: {
          color: '#ff0000',
          weight: 5
        }
      }).addTo(mapRef.current);
      mapRef.current.fitBounds(routeLayer.getBounds());
    }
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [pois, onSelectPoi, routeGeoJson]);
  return /*#__PURE__*/React.createElement("div", {
    id: "map",
    className: "mb-4"
  });
});
function App() {
  const [pois, setPois] = useState(geoJsonData.features);
  const [selectedPois, setSelectedPois] = useState([]);
  const [routeInfo, setRouteInfo] = useState(null);
  const [routeGeoJson, setRouteGeoJson] = useState(null);
  const handleSelectPoi = useCallback(poi => {
    setSelectedPois(prev => {
      if (prev.length >= 2) return [prev[1], poi];
      if (prev.includes(poi)) return prev;
      return [...prev, poi];
    });
  }, []);
  const handleCalculateRoute = useCallback(async () => {
    if (selectedPois.length !== 2) return;
    const [poi1, poi2] = selectedPois;
    try {
      const response = await fetch(`http://router.project-osrm.org/route/v1/driving/${poi1.geometry.coordinates[0]},${poi1.geometry.coordinates[1]};${poi2.geometry.coordinates[0]},${poi2.geometry.coordinates[1]}?overview=full&geometries=geojson`);
      const data = await response.json();
      if (data.routes && data.routes[0]) {
        setRouteInfo({
          distance: (data.routes[0].distance / 1000).toFixed(1),
          // km
          duration: (data.routes[0].duration / 3600).toFixed(1) // hours
        });
        setRouteGeoJson(data.routes[0].geometry);
      } else {
        alert('No route found');
      }
    } catch (error) {
      console.error('Route error:', error);
      alert('Failed to calculate route');
    }
  }, [selectedPois]);
  const handleClearRoute = useCallback(() => {
    setSelectedPois([]);
    setRouteInfo(null);
    setRouteGeoJson(null);
  }, []);

  // Filter and search logic
  const [filterType, setFilterType] = useState('');
  const [searchDistance, setSearchDistance] = useState('');
  const [searchCenter, setSearchCenter] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const handleFilterChange = e => {
    const type = e.target.value;
    setFilterType(type);
    setPois(type ? geoJsonData.features.filter(poi => poi.properties.type === type) : geoJsonData.features);
  };
  const handleZoom = coords => {
    const filtered = searchDistance && coords ? geoJsonData.features.filter(poi => {
      const [lon, lat] = poi.geometry.coordinates;
      const distance = Math.sqrt(Math.pow(lon - coords[0], 2) + Math.pow(lat - coords[1], 2)) * 111; // Approx km
      return distance <= parseFloat(searchDistance);
    }) : geoJsonData.features;
    setPois(filtered);
    setSearchCenter(coords);
  };
  const handleSearch = e => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);
    setPois(query ? geoJsonData.features.filter(poi => poi.properties.name.toLowerCase().includes(query)) : geoJsonData.features);
  };
  return /*#__PURE__*/React.createElement("div", {
    className: "p-4"
  }, /*#__PURE__*/React.createElement("h1", {
    className: "text-2xl font-bold mb-4"
  }, "Slovakia Tourist Map"), /*#__PURE__*/React.createElement("div", {
    className: "mb-4 flex flex-wrap gap-4"
  }, /*#__PURE__*/React.createElement("select", {
    onChange: handleFilterChange,
    className: "border p-2 rounded"
  }, /*#__PURE__*/React.createElement("option", {
    value: ""
  }, "All Types"), /*#__PURE__*/React.createElement("option", {
    value: "castle"
  }, "Castle"), /*#__PURE__*/React.createElement("option", {
    value: "museum"
  }, "Museum"), /*#__PURE__*/React.createElement("option", {
    value: "cave"
  }, "Cave"), /*#__PURE__*/React.createElement("option", {
    value: "nature"
  }, "Nature"), /*#__PURE__*/React.createElement("option", {
    value: "church"
  }, "Church"), /*#__PURE__*/React.createElement("option", {
    value: "village"
  }, "Village"), /*#__PURE__*/React.createElement("option", {
    value: "spa"
  }, "Spa")), /*#__PURE__*/React.createElement("input", {
    type: "text",
    placeholder: "Search POIs...",
    value: searchQuery,
    onChange: handleSearch,
    className: "border p-2 rounded"
  }), /*#__PURE__*/React.createElement("input", {
    type: "number",
    placeholder: "Distance (km)",
    value: searchDistance,
    onChange: e => setSearchDistance(e.target.value),
    className: "border p-2 rounded"
  })), selectedPois.length > 0 && /*#__PURE__*/React.createElement("div", {
    className: "mb-4 p-2 bg-blue-500 rounded"
  }, /*#__PURE__*/React.createElement("p", {
    className: "text-white"
  }, /*#__PURE__*/React.createElement("strong", null, "Selected POIs:"), " ", selectedPois.map(p => p.properties.name).join(' to ')), routeInfo && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("p", {
    className: "text-white"
  }, /*#__PURE__*/React.createElement("strong", null, "Distance:"), " ", routeInfo.distance, " km"), /*#__PURE__*/React.createElement("p", {
    className: "text-white"
  }, /*#__PURE__*/React.createElement("strong", null, "Duration:"), " ", routeInfo.duration, " hours")), /*#__PURE__*/React.createElement("button", {
    onClick: handleCalculateRoute,
    className: "bg-blue-500 text-white p-2 rounded hover:bg-blue-600 mr-2",
    disabled: selectedPois.length !== 2
  }, "Calculate Route"), /*#__PURE__*/React.createElement("button", {
    onClick: handleClearRoute,
    className: "bg-red-500 text-white p-2 rounded hover:bg-red-600"
  }, "Clear Route")), /*#__PURE__*/React.createElement(MapComponent, {
    pois: pois,
    onSelectPoi: handleSelectPoi,
    selectedPois: selectedPois,
    routeGeoJson: routeGeoJson
  }), /*#__PURE__*/React.createElement("div", {
    className: "mt-4"
  }, /*#__PURE__*/React.createElement("h2", {
    className: "text-lg font-semibold mb-2"
  }, "Available POIs"), /*#__PURE__*/React.createElement("div", {
    className: "accordion-content"
  }, pois.map((poi, index) => /*#__PURE__*/React.createElement("div", {
    key: index,
    className: "border-b p-2"
  }, /*#__PURE__*/React.createElement("h3", {
    className: "text-lg font-semibold"
  }, poi.properties.name), /*#__PURE__*/React.createElement("p", null, /*#__PURE__*/React.createElement("strong", null, "Type:"), " ", poi.properties.type.charAt(0).toUpperCase() + poi.properties.type.slice(1)), /*#__PURE__*/React.createElement("p", null, /*#__PURE__*/React.createElement("strong", null, "Description:"), " ", poi.properties.description))))));
}
ReactDOM.render(/*#__PURE__*/React.createElement(App, null), document.getElementById('root'));
