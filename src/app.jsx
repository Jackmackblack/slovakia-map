const { useState, useEffect, useCallback, useRef, memo } = React;

const geoJsonData = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      properties: { name: "Orava Castle", type: "castle", description: "13th-century medieval castle in Oravský Podzámok", image: "https://example.com/orava.jpg" },
      geometry: { type: "Point", coordinates: [19.9403, 49.3185] }
    },
    {
      type: "Feature",
      properties: { name: "Spiš Castle", type: "castle", description: "UNESCO World Heritage Site near Spišské Podhradie", image: "https://example.com/spis.jpg" },
      geometry: { type: "Point", coordinates: [21.1756, 48.9445] }
    },
    {
      type: "Feature",
      properties: { name: "Bojnice Castle", type: "castle", description: "Romantic castle with a zoo in Bojnice", image: "https://example.com/bojnice.jpg" },
      geometry: { type: "Point", coordinates: [18.5778, 48.7801] }
    },
    {
      type: "Feature",
      properties: { name: "Slovak National Museum", type: "museum", description: "Main museum in Bratislava", image: null },
      geometry: { type: "Point", coordinates: [17.1123, 48.1419] }
    },
    {
      type: "Feature",
      properties: { name: "Demänovská Cave", type: "cave", description: "Largest cave system in Slovakia", image: "https://example.com/demanovska.jpg" },
      geometry: { type: "Point", coordinates: [19.5826, 48.9988] }
    },
    {
      type: "Feature",
      properties: { name: "High Tatras", type: "nature", description: "Mountain range with hiking trails", image: null },
      geometry: { type: "Point", coordinates: [20.1333, 49.1667] }
    },
    {
      type: "Feature",
      properties: { name: "St. Elisabeth Cathedral", type: "church", description: "Gothic cathedral in Košice", image: "https://example.com/elisabeth.jpg" },
      geometry: { type: "Point", coordinates: [21.2581, 48.7203] }
    },
    {
      type: "Feature",
      properties: { name: "Čičmany Village", type: "village", description: "Traditional painted wooden houses", image: null },
      geometry: { type: "Point", coordinates: [18.5167, 48.9500] }
    },
    {
      type: "Feature",
      properties: { name: "Piešťany Spa", type: "spa", description: "Famous thermal spa resort", image: "https://example.com/piestany.jpg" },
      geometry: { type: "Point", coordinates: [17.8396, 48.5898] }
    },
    {
      type: "Feature",
      properties: { name: "Banská Štiavnica", type: "village", description: "Historic mining town, UNESCO site", image: null },
      geometry: { type: "Point", coordinates: [18.8933, 48.4586] }
    }
  ]
};

const MapComponent = memo(({ pois, onSelectPoi, selectedPois, routeGeoJson }) => {
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
          color: feature.properties.type === "castle" ? "#ff5733" :
                 feature.properties.type === "museum" ? "#9933cc" :
                 feature.properties.type === "cave" ? "#33ccff" :
                 feature.properties.type === "nature" ? "#33cc33" :
                 feature.properties.type === "church" ? "#ffcc00" :
                 feature.properties.type === "village" ? "#cc6699" :
                 feature.properties.type === "spa" ? "#ff99cc" : "#ff0000",
          fillOpacity: 0.8
        });
      },
      onEachFeature: (feature, layer) => {
        const { name, type, description, image } = feature.properties;
        const popupContent = [
          '<div class="p-2">',
          `<h3 class="text-lg font-bold">${name}</h3>`,
          `<p><strong>Type:</strong> ${type.charAt(0).toUpperCase() + type.slice(1)}</p>`,
          `<p><strong>Description:</strong> ${description}</p>`,
          image ? `<img src="${image}" alt="${name}" class="mt-2" />` : '',
          '</div>'
        ].join('');
        layer.bindPopup(popupContent, { maxWidth: 300 });
        layer.on('click', () => onSelectPoi(feature));
      }
    });
    markers.addLayer(geoJsonLayer);
    mapRef.current.addLayer(markers);

    if (routeGeoJson) {
      const routeLayer = L.geoJSON(routeGeoJson, {
        style: { color: '#ff0000', weight: 5 }
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

  return <div id="map" className="mb-4"></div>;
});

function App() {
  const [pois, setPois] = useState(geoJsonData.features);
  const [selectedPois, setSelectedPois] = useState([]);
  const [routeInfo, setRouteInfo] = useState(null);
  const [routeGeoJson, setRouteGeoJson] = useState(null);

  const handleSelectPoi = useCallback((poi) => {
    setSelectedPois((prev) => {
      if (prev.length >= 2) return [prev[1], poi];
      if (prev.includes(poi)) return prev;
      return [...prev, poi];
    });
  }, []);

  const handleCalculateRoute = useCallback(async () => {
    if (selectedPois.length !== 2) return;
    const [poi1, poi2] = selectedPois;
    try {
      const response = await fetch(
        `https://cors-anywhere.herokuapp.com/http://router.project-osrm.org/route/v1/driving/${poi1.geometry.coordinates[0]},${poi1.geometry.coordinates[1]};${poi2.geometry.coordinates[0]},${poi2.geometry.coordinates[1]}?overview=full&geometries=geojson`
      );
      const data = await response.json();
      if (data.routes && data.routes[0]) {
        setRouteInfo({
          distance: (data.routes[0].distance / 1000).toFixed(1), // km
          duration: (data.routes[0].duration / 3600).toFixed(1), // hours
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

  const [filterType, setFilterType] = useState('');
  const [searchDistance, setSearchDistance] = useState('');
  const [searchCenter, setSearchCenter] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const handleFilterChange = (e) => {
    const type = e.target.value;
    setFilterType(type);
    setPois(type ? geoJsonData.features.filter((poi) => poi.properties.type === type) : geoJsonData.features);
  };

  const handleZoom = (coords) => {
    const filtered = searchDistance && coords
      ? geoJsonData.features.filter((poi) => {
          const [lon, lat] = poi.geometry.coordinates;
          const distance = Math.sqrt(
            Math.pow(lon - coords[0], 2) + Math.pow(lat - coords[1], 2)
          ) * 111; // Approx km
          return distance <= parseFloat(searchDistance);
        })
      : geoJsonData.features;
    setPois(filtered);
    setSearchCenter(coords);
  };

  const handleSearch = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);
    setPois(
      query
        ? geoJsonData.features.filter((poi) =>
            poi.properties.name.toLowerCase().includes(query)
          )
        : geoJsonData.features
    );
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Slovakia Tourist Map</h1>
      <div className="mb-4 flex flex-wrap gap-4">
        <select onChange={handleFilterChange} className="border p-2 rounded">
          <option value="">All Types</option>
          <option value="castle">Castle</option>
          <option value="museum">Museum</option>
          <option value="cave">Cave</option>
          <option value="nature">Nature</option>
          <option value="church">Church</option>
          <option value="village">Village</option>
          <option value="spa">Spa</option>
        </select>
        <input
          type="text"
          placeholder="Search POIs..."
          value={searchQuery}
          onChange={handleSearch}
          className="border p-2 rounded"
        />
        <input
          type="number"
          placeholder="Distance (km)"
          value={searchDistance}
          onChange={(e) => setSearchDistance(e.target.value)}
          className="border p-2 rounded"
        />
      </div>
      {selectedPois.length > 0 && (
        <div className="mb-4 p-2 bg-blue-500 rounded">
          <p className="text-white"><strong>Selected POIs:</strong> {selectedPois.map(p => p.properties.name).join(' to ')}</p>
          {routeInfo && (
            <>
              <p className="text-white"><strong>Distance:</strong> {routeInfo.distance} km</p>
              <p className="text-white"><strong>Duration:</strong> {routeInfo.duration} hours</p>
            </>
          )}
          <button
            onClick={handleCalculateRoute}
            className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600 mr-2"
            disabled={selectedPois.length !== 2}
          >
            Calculate Route
          </button>
          <button
            onClick={handleClearRoute}
            className="bg-red-500 text-white p-2 rounded hover:bg-red-600"
          >
            Clear Route
          </button>
        </div>
      )}
      <MapComponent
        pois={pois}
        onSelectPoi={handleSelectPoi}
        selectedPois={selectedPois}
        routeGeoJson={routeGeoJson}
      />
      <div className="mt-4">
        <h2 className="text-lg font-semibold mb-2">Available POIs</h2>
        <div className="accordion-content">
          {pois.map((poi, index) => (
            <div key={index} className="border-b p-2">
              <h3 className="text-lg font-semibold">{poi.properties.name}</h3>
              <p><strong>Type:</strong> {poi.properties.type.charAt(0).toUpperCase() + poi.properties.type.slice(1)}</p>
              <p><strong>Description:</strong> {poi.properties.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

ReactDOM.render(<App />, document.getElementById('root'));