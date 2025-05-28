const { useState, useEffect, useCallback, memo } = React;

// Web Worker for route optimization
const routeWorker = new Worker(URL.createObjectURL(new Blob([`
  self.onmessage = function(e) {
    const points = e.data.points;
    const path = [points.shift()];
    let totalDistance = 0;
    while (points.length > 0) {
      let nearest = points[0];
      let minDist = Infinity;
      const lastPoint = path[path.length - 1];
      points.forEach((point, index) => {
        const dist = Math.sqrt(
          Math.pow(lastPoint[0] - point[0], 2) + Math.pow(lastPoint[1] - point[1], 2)
        );
        if (dist < minDist) {
          minDist = dist;
          nearest = point;
          nearest.index = index;
        }
      });
      totalDistance += minDist * 111; // Approx km (degrees to km)
      path.push(nearest);
      points.splice(nearest.index, 1);
    }
    self.postMessage({ path, totalDistance });
  };
`], { type: 'application/javascript' })));

// Memoized MapComponent
const MapComponent = memo(({ setMap, setLoading }) => {
  useEffect(() => {
    const mapInstance = L.map('map', {
      zoomControl: true,
      minZoom: 7,
      maxZoom: 15
    }).setView([48.669, 19.699], 8);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 15,
      tileSize: 256,
      zoomOffset: 0
    }).addTo(mapInstance);

    // GeoJSON data
    const geoJsonData = {
      type: "FeatureCollection",
      features: [
       { type: "Feature", properties: { name: "Orava Castle", type: "castle", description: "13th-century medieval castle, known for Nosferatu filming", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0e/Orava_Castle_2017.jpg/800px-Orava_Castle_2017.jpg" }, geometry: { type: "Point", coordinates: [19.358, 49.262] } },
        { type: "Feature", properties: { name: "Spiš Castle", type: "castle", description: "UNESCO World Heritage Site, one of Europe’s largest castles", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/Spis_Castle_2018.jpg/800px-Spis_Castle_2018.jpg" }, geometry: { type: "Point", coordinates: [20.768, 49.000] } },
        { type: "Feature", properties: { name: "Bojnice Castle", type: "castle", description: "Fairytale castle with adjacent zoo", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/Bojnice_Castle_2019.jpg/800px-Bojnice_Castle_2019.jpg" }, geometry: { type: "Point", coordinates: [18.577, 48.780] } },
        { type: "Feature", properties: { name: "Bratislava Castle", type: "castle", description: "Iconic hilltop castle overlooking the Danube", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3e/Bratislava_Castle_from_the_Danube_River.jpg/800px-Bratislava_Castle_from_the_Danube_River.jpg" }, geometry: { type: "Point", coordinates: [17.100, 48.142] } },
        { type: "Feature", properties: { name: "Devin Castle", type: "castle", description: "Ruins at the confluence of the Danube and Morava rivers", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8f/Devin_Castle_2016.jpg/800px-Devin_Castle_2016.jpg" }, geometry: { type: "Point", coordinates: [16.978, 48.173] } },
        { type: "Feature", properties: { name: "Trenčín Castle", type: "castle", description: "Medieval castle with panoramic views", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2b/Trencin_Castle_2015.jpg/800px-Trencin_Castle_2015.jpg" }, geometry: { type: "Point", coordinates: [18.045, 48.894] } },
        { type: "Feature", properties: { name: "Červený Kameň", type: "castle", description: "Well-preserved Renaissance castle", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9c/Cerveny_Kamen_Castle_2018.jpg/800px-Cerveny_Kamen_Castle_2018.jpg" }, geometry: { type: "Point", coordinates: [17.335, 48.392] } },
        { type: "Feature", properties: { name: "Betliar Manor", type: "museum", description: "Baroque manor with museum", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/Betliar_Manor_2017.jpg/800px-Betliar_Manor_2017.jpg" }, geometry: { type: "Point", coordinates: [20.320, 48.705] } },
        { type: "Feature", properties: { name: "Snina Castle", type: "castle", description: "Historical castle in eastern Slovakia", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/Snina_Castle_2019.jpg/800px-Snina_Castle_2019.jpg" }, geometry: { type: "Point", coordinates: [22.152, 48.987] } },
        { type: "Feature", properties: { name: "Slovenská Ľupča", type: "castle", description: "Medieval castle with Gothic elements", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/Slovenska_Lupca_Castle_2016.jpg/800px-Slovenska_Lupca_Castle_2016.jpg" }, geometry: { type: "Point", coordinates: [19.270, 48.767] } },
        { type: "Feature", properties: { name: "Budmerice Manor", type: "castle", description: "Neo-Gothic manor house" }, geometry: { type: "Point", coordinates: [17.433, 48.350] } },
        { type: "Feature", properties: { name: "Beckov Castle", type: "castle", description: "Castle ruin" }, geometry: { type: "Point", coordinates: [17.898, 48.790] } },
        { type: "Feature", properties: { name: "Čachtice Castle", type: "castle", description: "Infamous for Elizabeth Báthory" }, geometry: { type: "Point", coordinates: [17.761, 48.725] } },
        { type: "Feature", properties: { name: "Branč Castle", type: "castle", description: "Ruins with scenic views" }, geometry: { type: "Point", coordinates: [17.500, 48.733] } },
        { type: "Feature", properties: { name: "Jasenov Castle", type: "castle", description: "Castle ruins in eastern Slovakia" }, geometry: { type: "Point", coordinates: [21.900, 48.903] } },
        { type: "Feature", properties: { name: "Považský Castle", type: "castle", description: "Ruined castle above the Váh" }, geometry: { type: "Point", coordinates: [18.449, 49.136] } },
        { type: "Feature", properties: { name: "Brekov Castle", type: "castle", description: "13th-century castle ruins" }, geometry: { type: "Point", coordinates: [21.833, 48.900] } },
        { type: "Feature", properties: { name: "Divín Castle", type: "castle", description: "Gothic castle ruins" }, geometry: { type: "Point", coordinates: [19.533, 48.450] } },
        { type: "Feature", properties: { name: "Šašov Castle", type: "castle", description: "Castle ruins in central Slovakia" }, geometry: { type: "Point", coordinates: [18.900, 48.683] } },
        { type: "Feature", properties: { name: "Lietava Castle", type: "castle", description: "Largest castle ruins in Slovakia" }, geometry: { type: "Point", coordinates: [18.683, 49.167] } },
        { type: "Feature", properties: { name: "Likava Castle", type: "castle", description: "Castle near Liptovský Mikuláš" }, geometry: { type: "Point", coordinates: [19.367, 49.100] } },
        { type: "Feature", properties: { name: "Plavecký Castle", type: "castle", description: "Castle ruins in the Little Carpathians" }, geometry: { type: "Point", coordinates: [17.283, 48.500] } },
        { type: "Feature", properties: { name: "Pajštún Castle", type: "castle", description: "Castle ruins near Bratislava" }, geometry: { type: "Point", coordinates: [17.083, 48.317] } },
        { type: "Feature", properties: { name: "Čabrad Castle", type: "castle", description: "Remote medieval castle" }, geometry: { type: "Point", coordinates: [19.083, 48.250] } },
        { type: "Feature", properties: { name: "Šomoška Castle", type: "castle", description: "Castle ruins near Hungary border" }, geometry: { type: "Point", coordinates: [19.857, 48.171] } },
        { type: "Feature", properties: { name: "Ochtinská Aragonite Cave", type: "cave", description: "Rare aragonite cave system" }, geometry: { type: "Point", coordinates: [20.317, 48.667] } },
        { type: "Feature", properties: { name: "Domica Cave", type: "cave", description: "Largest cave system in Slovak Karst" }, geometry: { type: "Point", coordinates: [20.483, 48.477] } },
        { type: "Feature", properties: { name: "Gombasecká Cave", type: "cave", description: "Cave with stalactites in Slovak Karst" }, geometry: { type: "Point", coordinates: [20.467, 48.567] } },
        { type: "Feature", properties: { name: "Jasovská Cave", type: "cave", description: "Oldest accessible cave in Slovakia" }, geometry: { type: "Point", coordinates: [20.975, 48.678] } },
        { type: "Feature", properties: { name: "Dobšinská Ice Cave", type: "cave", description: "UNESCO-listed ice cave" }, geometry: { type: "Point", coordinates: [20.300, 48.867] } },
        { type: "Feature", properties: { name: "Bystrianska Cave", type: "cave", description: "Cave in Low Tatras" }, geometry: { type: "Point", coordinates: [19.600, 48.833] } },
        { type: "Feature", properties: { name: "Demänovská Cave of Freedom", type: "cave", description: "Largest cave system in Slovakia" }, geometry: { type: "Point", coordinates: [19.583, 48.998] } },
        { type: "Feature", properties: { name: "Demänovská Ice Cave", type: "cave", description: "Ice cave in Demänovská Valley" }, geometry: { type: "Point", coordinates: [19.567, 48.983] } },
        { type: "Feature", properties: { name: "Važecká Cave", type: "cave", description: "Small cave with stalactites" }, geometry: { type: "Point", coordinates: [19.983, 49.050] } },
        { type: "Feature", properties: { name: "Belianska Cave", type: "cave", description: "Cave in Tatra Mountains" }, geometry: { type: "Point", coordinates: [20.317, 49.233] } },
        { type: "Feature", properties: { name: "Popradské Pleso", type: "nature", description: "Glacial lake ideal for hiking" }, geometry: { type: "Point", coordinates: [20.080, 49.153] } },
        { type: "Feature", properties: { name: "Kriváň", type: "nature", description: "Iconic peak in High Tatras" }, geometry: { type: "Point", coordinates: [19.999, 49.162] } },
        { type: "Feature", properties: { name: "Závojový Waterfall", type: "nature", description: "Scenic waterfall in Slovak Paradise National Park" }, geometry: { type: "Point", coordinates: [20.383, 48.883] } },
        { type: "Feature", properties: { name: "Low Tatras", type: "nature", description: "National park with hiking trails" }, geometry: { type: "Point", coordinates: [19.600, 48.950] } },
        { type: "Feature", properties: { name: "Pieniny - Dunajec River Rafting", type: "nature", description: "Scenic river rafting experience" }, geometry: { type: "Point", coordinates: [20.400, 49.400] } },
        { type: "Feature", properties: { name: "Malá Fatra", type: "nature", description: "National park with gorges and peaks" }, geometry: { type: "Point", coordinates: [19.033, 49.200] } },
        { type: "Feature", properties: { name: "Muránska Planina", type: "nature", description: "Karst landscape with hiking" }, geometry: { type: "Point", coordinates: [20.033, 48.767] } },
        { type: "Feature", properties: { name: "Poloniny", type: "nature", description: "Remote national park, UNESCO site" }, geometry: { type: "Point", coordinates: [22.533, 49.000] } },
        { type: "Feature", properties: { name: "Slovak Karst", type: "nature", description: "Karst region with caves" }, geometry: { type: "Point", coordinates: [20.600, 48.600] } },
        { type: "Feature", properties: { name: "Slovak National Museum", type: "museum", description: "Cultural museum in Bratislava" }, geometry: { type: "Point", coordinates: [17.113, 48.141] } },
        { type: "Feature", properties: { name: "Banská Štiavnica Mining Museum", type: "museum", description: "Open-air mining museum" }, geometry: { type: "Point", coordinates: [18.893, 48.459] } },
        { type: "Feature", properties: { name: "Spiš Castle Museum", type: "museum", description: "Museum within Spiš Castle" }, geometry: { type: "Point", coordinates: [20.768, 49.000] } },
        { type: "Feature", properties: { name: "Danubiana Meulensteen Art Museum", type: "museum", description: "Modern art museum near Bratislava" }, geometry: { type: "Point", coordinates: [17.233, 48.033] } },
        { type: "Feature", properties: { name: "Andy Warhol Museum", type: "museum", description: "Pop art museum in Medzilaborce" }, geometry: { type: "Point", coordinates: [21.900, 49.267] } },
        { type: "Feature", properties: { name: "Orava Village Museum", type: "museum", description: "Open-air museum in Zuberec" }, geometry: { type: "Point", coordinates: [19.667, 49.267] } },
        { type: "Feature", properties: { name: "Liptov Village Museum", type: "museum", description: "Traditional village in Pribylina" }, geometry: { type: "Point", coordinates: [19.800, 49.100] } },
        { type: "Feature", properties: { name: "Čičmany Museum", type: "museum", description: "Folk architecture museum" }, geometry: { type: "Point", coordinates: [18.517, 48.950] } },
        { type: "Feature", properties: { name: "Kysuce Village Museum", type: "museum", description: "Open-air museum in Vychylovka" }, geometry: { type: "Point", coordinates: [19.083, 49.400] } },
        { type: "Feature", properties: { name: "SNM Martin", type: "museum", description: "Ethnographic museum" }, geometry: { type: "Point", coordinates: [18.933, 49.067] } },
        { type: "Feature", properties: { name: "Bojnice Castle Museum", type: "museum", description: "Museum within Bojnice Castle" }, geometry: { type: "Point", coordinates: [18.577, 48.780] } },
        { type: "Feature", properties: { name: "Betliar Manor Museum", type: "museum", description: "Museum in Betliar Manor" }, geometry: { type: "Point", coordinates: [20.320, 48.705] } },
        { type: "Feature", properties: { name: "Stará Ľubovňa Museum", type: "museum", description: "Open-air museum with castle" }, geometry: { type: "Point", coordinates: [20.700, 49.300] } },
        { type: "Feature", properties: { name: "Levoča Museum", type: "museum", description: "Historical museum in Levoča" }, geometry: { type: "Point", coordinates: [20.589, 49.025] } },
        { type: "Feature", properties: { name: "Košice Technical Museum", type: "museum", description: "Technology museum in Košice" }, geometry: { type: "Point", coordinates: [21.258, 48.720] } },
        { type: "Feature", properties: { name: "Blue Church", type: "church", description: "Art Nouveau church in Bratislava" }, geometry: { type: "Point", coordinates: [17.139, 48.144] } },
        { type: "Feature", properties: { name: "Košice Cathedral", type: "church", description: "14th-century Gothic cathedral" }, geometry: { type: "Point", coordinates: [21.258, 48.720] } },
        { type: "Feature", properties: { name: "Spišská Kapitula", type: "church", description: "Medieval ecclesiastical town" }, geometry: { type: "Point", coordinates: [20.750, 49.000] } },
        { type: "Feature", properties: { name: "St. Martin’s Cathedral", type: "church", description: "Gothic cathedral in Bratislava" }, geometry: { type: "Point", coordinates: [17.105, 48.142] } },
        { type: "Feature", properties: { name: "Banská Bystrica Cathedral", type: "church", description: "Baroque cathedral" }, geometry: { type: "Point", coordinates: [19.150, 48.735] } },
        { type: "Feature", properties: { name: "Levoča St. James Church", type: "church", description: "Gothic church with tallest altar" }, geometry: { type: "Point", coordinates: [20.589, 49.025] } },
        { type: "Feature", properties: { name: "Trnava St. John the Baptist", type: "church", description: "Baroque basilica" }, geometry: { type: "Point", coordinates: [17.587, 48.377] } },
        { type: "Feature", properties: { name: "Prešov Co-Cathedral", type: "church", description: "Baroque cathedral" }, geometry: { type: "Point", coordinates: [21.239, 48.998] } },
        { type: "Feature", properties: { name: "Nitra St. Emmeram", type: "church", description: "Oldest cathedral in Slovakia" }, geometry: { type: "Point", coordinates: [18.087, 48.317] } },
        { type: "Feature", properties: { name: "Žilina Holy Trinity", type: "church", description: "Gothic church in Žilina" }, geometry: { type: "Point", coordinates: [18.739, 49.223] } },
        { type: "Feature", properties: { name: "Vlkolínec Village", type: "village", description: "UNESCO-listed folk village" }, geometry: { type: "Point", coordinates: [19.278, 49.038] } },
        { type: "Feature", properties: { name: "Čičmany", type: "village", description: "Folk village with painted houses" }, geometry: { type: "Point", coordinates: [18.517, 48.950] } },
        { type: "Feature", properties: { name: "Špania Dolina", type: "village", description: "Historic mining village" }, geometry: { type: "Point", coordinates: [19.133, 48.817] } },
        { type: "Feature", properties: { name: "Brhlovce", type: "village", description: "Rock dwellings and winery" }, geometry: { type: "Point", coordinates: [18.733, 48.217] } },
        { type: "Feature", properties: { name: "Zuberec", type: "village", description: "Traditional Orava village" }, geometry: { type: "Point", coordinates: [19.667, 49.267] } },
        { type: "Feature", properties: { name: "Osturňa", type: "village", description: "Carpathian folk village" }, geometry: { type: "Point", coordinates: [20.233, 49.333] } },
        { type: "Feature", properties: { name: "Podbiel", type: "village", description: "Wooden houses in Orava" }, geometry: { type: "Point", coordinates: [19.483, 49.300] } },
        { type: "Feature", properties: { name: "Hronsek", type: "village", description: "Wooden church and village" }, geometry: { type: "Point", coordinates: [19.150, 48.650] } },
        { type: "Feature", properties: { name: "Stará Ľubovňa Village", type: "village", description: "Folk village near castle" }, geometry: { type: "Point", coordinates: [20.700, 49.300] } },
        { type: "Feature", properties: { name: "Sebechleby", type: "village", description: "Wine cellars and folk houses" }, geometry: { type: "Point", coordinates: [18.967, 48.283] } },
        { type: "Feature", properties: { name: "Rajecké Teplice Spa", type: "spa", description: "Thermal spa with alkaline springs" }, geometry: { type: "Point", coordinates: [18.610, 49.130] } },
        { type: "Feature", properties: { name: "Piešťany Spa", type: "spa", description: "Famous spa town on Váh river" }, geometry: { type: "Point", coordinates: [17.839, 48.591] } }
      ]
    };

    // Cache GeoJSON in localStorage
    localStorage.setItem('poiGeoJSON', JSON.stringify(geoJsonData));

    // Marker clustering
    const markers = L.markerClusterGroup({
      maxClusterRadius: 50,
      disableClusteringAtZoom: 12
    });

    setLoading(true);
    try {
      L.geoJSON(geoJsonData, {
        pointToLayer: (feature, latlng) => {
          return L.circleMarker(latlng, {
            radius: 8,
            color: feature.properties.type === "castle" ? "#ff5733" :
                   feature.properties.type === "museum" ? "#9933cc" : "#ff0000",
            fillOpacity: 0.8
          });
        },
        onEachFeature: (feature, layer) => {
          layer.bindPopup(`
            <div class="p-2">
              <h3 class="text-lg font-bold">${feature.properties.name}</h3>
              <p><strong>Type:</strong> ${feature.properties.type.charAt(0).toUpperCase() + feature.properties.type.slice(1)}</p>
              <p><strong>Description:</strong> ${feature.properties.description}</p>
              ${feature.properties.image ? `<img src="${feature.properties.image}" alt="${feature.properties.name}" class="mt-2" />` : ''}
            </div>
          `, { maxWidth: 300 });
        }
      }).addTo(markers);
      mapInstance.addLayer(markers);
    } catch (error) {
      console.error("Error loading GeoJSON:", error);
    } finally {
      setLoading(false);
    }

    setMap(mapInstance);

    return () => {
      mapInstance.remove();
    };
  }, [setMap, setLoading]);

  return <div id="map"></div>;
});

function App() {
  const [map, setMap] = useState(null);
  const [loading, setLoading] = useState(false);
  const [filterType, setFilterType] = useState("all");
  const [filterDistance, setFilterDistance] = useState(0);
  const [centerPoint, setCenterPoint] = useState(null);
  const [routePoints, setRoutePoints] = useState([]);
  const [routeLayer, setRouteLayer] = useState(null);
  const [routeDistance, setRouteDistance] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [openAccordions, setOpenAccordions] = useState({});

  // Haversine distance
  const haversine = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  // Update visible POIs
  const handleZoom = useCallback(() => {
    if (map) {
      const bounds = map.getBounds();
      const pois = [
        { label: "Orava Castle", coords: [49.262, 19.358], feature: { name: "Orava Castle", type: "castle", description: "13th-century medieval castle" } },
        { label: "Spiš Castle", coords: [49.000, 20.768], feature: { name: "Spiš Castle", type: "castle", description: "UNESCO World Heritage Site" } },
        { label: "Bojnice Castle", coords: [48.780, 18.577], feature: { name: "Bojnice Castle", type: "castle", description: "Fairytale castle with zoo" } },
        { label: "Bratislava Castle", coords: [48.142, 17.100], feature: { name: "Bratislava Castle", type: "castle", description: "Iconic hilltop castle" } },
        { label: "Devin Castle", coords: [48.173, 16.978], feature: { name: "Devin Castle", type: "castle", description: "Ruins at the confluence of the Danube and Morava rivers" } },
        { label: "Trenčín Castle", coords: [48.894, 18.045], feature: { name: "Trenčín Castle", type: "castle", description: "Medieval castle with panoramic views" } },
        { label: "Červený Kameň", coords: [48.392, 17.335], feature: { name: "Červený Kameň", type: "castle", description: "Well-preserved Renaissance castle" } },
        { label: "Betliar Manor", coords: [48.705, 20.320], feature: { name: "Betliar Manor", type: "museum", description: "Baroque manor with museum" } },
        { label: "Snina Castle", coords: [48.987, 22.152], feature: { name: "Snina Castle", type: "castle", description: "Castle in eastern Slovakia" } },
        { label: "Slovenská Ľupča", coords: [48.767, 19.270], feature: { name: "Slovenská Ľupča", type: "castle", description: "Castle with Gothic elements" } }
      ].filter((poi) => {
        if (!bounds.contains(L.latLng(poi.coords[0], poi.coords[1]))) {
          return false;
        }
        if (filterType !== "all" && poi.feature.type !== filterType) {
          return false;
        }
        if (filterDistance > 0 && centerPoint) {
          const dist = haversine(centerPoint.lat, centerPoint.lng, poi.coords[0], poi.coords[1]);
          return dist <= filterDistance;
        }
        if (searchQuery && !poi.label.toLowerCase().includes(searchQuery.toLowerCase())) {
          return false;
        }
        return true;
      });
      return pois;
    }
    return [];
  }, [map, filterType, filterDistance, centerPoint, searchQuery]);

  // Route calculation
  useEffect(() => {
    if (routePoints.length >= 2) {
      routeWorker.onmessage = (e) => {
        if (routeLayer) {
          map.removeLayer(routeLayer);
        }
        const newRouteLayer = L.polyline(e.data.path, { color: '#ff0000', weight: 4 }).addTo(map);
        setRouteLayer(newRouteLayer);
        setRouteDistance(e.data.totalDistance.toFixed(1));
        map.fitBounds(L.latLngBounds(e.data.path));
      };
      routeWorker.postMessage({ points: [...routePoints] });
    } else if (routeLayer) {
      map.removeLayer(routeLayer);
      setRouteLayer(null);
      setRouteDistance(0);
    }
  }, [routePoints, map]);

  // Update POIs on zoom/move
  const [visiblePOIs, setVisiblePOIs] = useState([]);
  useEffect(() => {
    if (map) {
      const updatePOIs = () => setVisiblePOIs(handleZoom());
      map.on('zoomend moveend', updatePOIs);
      map.on('click', (e) => setCenterPoint(e.latlng));
      updatePOIs();
      return () => {
        map.off('zoomend moveend', updatePOIs);
        map.off('click', setCenterPoint);
      };
    }
  }, [map, handleZoom]);

  // Toggle accordion
  const toggleAccordion = (type) => {
    setOpenAccordions((prev) => ({
      ...prev,
      [type]: !prev[type]
    }));
  };

  // Group POIs by type
  const groupedPOIs = visiblePOIs.reduce((acc, poi) => {
    const type = poi.feature.type;
    if (!acc[type]) {
      acc[type] = [];
    }
    acc[type].push(poi);
    return acc;
  }, {});

  // Reset filters
  const resetFilters = () => {
    setFilterType("all");
    setFilterDistance(0);
    setSearchQuery("");
    setCenterPoint(null);
  };

  // Reset route
  const resetRoute = () => {
    setRoutePoints([]);
    if (routeLayer) {
      map.removeLayer(routeLayer);
      setRouteLayer(null);
      setRouteDistance(0);
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Explore Slovakia</h1>
      <div className="mb-4 flex flex-col gap-4">
        <div className="flex flex-wrap gap-2 items-center">
          <select
            className="bg-gray-500 p-2 px-3 py-2 rounded border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            title="Filter by POI type"
          >
            <option value="all">All POIs</option>
            <option value="castle">Castles</option>
            <option value="museum">Museums</option>
          </select>
          <select
            className="bg-gray-500 p-2 px-3 py-2 rounded border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={filterDistance}
            onChange={(e) => setFilterDistance(Number(e.target.value))}
            title="Filter by distance from clicked point"
          >
            <option value={0}>Any Distance</option>
            <option value={50}>Within 50km</option>
            <option value={100}>Within 100km</option>
            <option value={200}>Within 200km</option>
          </select>
          <input
            type="text"
            className="bg-gray-100 p-2 px-3 py-2 rounded border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Search by name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button
            onClick={resetFilters}
            className="bg-red-500 text-white p-2 px-3 py-2 rounded hover:bg-red-600"
          >
            Reset Filters
          </button>
          <button
            onClick={resetRoute}
            className="bg-red-500 text-white p-2 px-3 py-2 rounded hover:bg-red-600"
          >
            Reset Route
          </button>
        </div>
        {routeDistance > 0 && (
          <div className="text-lg font-semibold">
            Route Distance: {routeDistance} km
          </div>
        )}
        {loading ? (
          <div className="loading">Loading map...</div>
        ) : (
          <MapComponent setMap={setMap} setLoading={setLoading} />
        )}
        <div className="bg-white shadow-lg rounded p-4">
          {Object.keys(groupedPOIs).map((type) => (
            <div key={type} className="border-b border-gray-300">
              <button
                onClick={() => toggleAccordion(type)}
                className="w-full flex justify-between items-center p-2 text-left hover:bg-gray-100"
              >
                <span className="text-lg font-semibold capitalize">{type} ({groupedPOIs[type].length})</span>
                <span>{openAccordions[type] ? '▼' : '▲'}</span>
              </button>
              {openAccordions[type] && (
                <div className="accordion-content p-2">
                  {groupedPOIs[type].map((poi, index) => (
                    <div
                      key={index}
                      className="flex flex-row justify-between items-center p-2 hover:bg-gray-50 cursor-pointer"
                      onClick={() => {
                        map.setView(poi.coords, 13);
                        setRoutePoints((prev) => [...prev, poi.coords]);
                      }}
                    >
                      <span className="text-sm">{poi.label}</span>
                      <button
                        className="bg-blue-500 text-white px-2 py-1 rounded-full text-sm hover:bg-blue-600"
                        onClick={(e) => {
                          e.stopPropagation();
                          setRoutePoints((prev) => [...prev, poi.coords]);
                        }}
                      >
                        Add to Route
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

ReactDOM.render(<App />, document.getElementById('root'));