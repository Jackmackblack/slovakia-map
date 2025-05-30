export const geoJsonData = {
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