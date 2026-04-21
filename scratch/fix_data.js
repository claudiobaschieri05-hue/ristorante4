const fs = require('fs');
let txt = fs.readFileSync('d:/ristorante3/data.js', 'utf8');

txt = txt.replace(/date: \${Math\.floor/g, 'date: `${Math.floor');
txt = txt.replace(/\+ 1\} giorni fa/g, '+ 1} giorni fa`');
txt = txt.replace(/avgPrice: €–,/g, 'avgPrice: `€${Math.floor(Math.random() * 40) + 20}–${Math.floor(Math.random() * 80) + 40}`,');
txt = txt.replace(/address: Via Principale, ,/g, 'address: `Via Principale, ${Math.floor(Math.random() * 100) + 1}`,');

fs.writeFileSync('d:/ristorante3/data.js', txt);
