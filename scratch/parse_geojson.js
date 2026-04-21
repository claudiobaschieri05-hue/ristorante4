const fs = require('fs');
const data = JSON.parse(fs.readFileSync('d:/ristorante3/export.geojson.txt', 'utf8'));
const features = data.features;
let results = [];
for (let f of features) {
  if (f.properties.amenity === 'restaurant' || f.properties.amenity === 'cafe' || f.properties.amenity === 'bar' || f.properties.amenity === 'pub' || f.properties.amenity === 'fast_food') {
    let cat = 'ristorante';
    if (f.properties.amenity === 'cafe') cat = 'pasticceria';
    if (f.properties.amenity === 'bar' || f.properties.amenity === 'pub') cat = 'bar';
    if (f.properties.amenity === 'fast_food' && f.properties.cuisine && f.properties.cuisine.includes('pizza')) cat = 'pizzeria';
    
    // Some basic heuristics
    if (f.properties.name && f.properties.name.toLowerCase().includes('osteria')) cat = 'osteria';
    if (f.properties.name && f.properties.name.toLowerCase().includes('pizzeria')) cat = 'pizzeria';
    
    results.push({
      name: f.properties.name || 'Locale Sconosciuto',
      lat: f.geometry.coordinates[1],
      lng: f.geometry.coordinates[0],
      cat: cat,
      city: f.properties['addr:city'] || 'Reggio Emilia'
    });
  }
}
console.log(results.length, 'locali trovati');
fs.writeFileSync('d:/ristorante3/scratch/parsed_data.json', JSON.stringify(results, null, 2));
