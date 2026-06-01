fetch('https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/significant_month.geojson')
  .then(res => res.json())
  .then(data => console.log('OK', data.features.length))
  .catch(err => console.error('ERR', err));
