const sucursales = [
  { nombre: "Capital Federal", direccion: "Cordoba 772, 1054 Capital Federal", lat: -34.59883513993477, lng: -58.377842276035864, tipo: "Propia (Receptoría)", localidad: "Capital Federal" },
  { nombre: "Flores", direccion: "Av. Nazca 733, 1406 Flores", lat: -34.62368947018489, lng: -58.47253898851062, tipo: "Agencia (Receptoría)", localidad: "Flores" },
  { nombre: "Floresta", direccion: "Av. Gaona 3750, 1416 Floresta", lat: -34.62204822816618, lng: -58.477175737758635, tipo: "Agencia (Receptoría)", localidad: "Floresta" },
  { nombre: "La Plata", direccion: "Calle 41 428, 1900 La Plata", lat: -34.90519989868199, lng: -57.95505008849763, tipo: "Agencia (Receptoría)", localidad: "La Plata" },
  { nombre: "C.A.B.A. (General Paz)", direccion: "General Paz 11.010, 1408 C.A.B.A.", lat: -34.644413901054996, lng: -58.52940396152475, tipo: "Agencia (Receptoría)", localidad: "C.A.B.A." },
  { nombre: "Lomas de Zamora", direccion: "Hipólito Yrigoyen 8476, 1832 Lomas de Zamora", lat: -34.75379313262994, lng: -58.40091095966869, tipo: "Propia (Receptoría)", localidad: "Lomas de Zamora" },
  { nombre: "Morón", direccion: "Hipólito Yrigoyen 336, 1708 Morón", lat: -34.660406275181785, lng: -58.61482161919563, tipo: "Propia (Receptoría)", localidad: "Morón" },
  { nombre: "El Talar de Pacheco", direccion: "Panamericana, colectora Este 30.605 (Bajada 197), 1617 El Talar de Pacheco", lat: -34.47391921505416, lng: -58.663699453969826, tipo: "Propia (Receptoría)", localidad: "El Talar de Pacheco" },
  { nombre: "Parque Patricios", direccion: "Monasterio 301, 1284 Parque Patricios", lat: -34.63880319269598, lng: -58.394864803853295, tipo: "Agencia (Receptoría)", localidad: "Parque Patricios" },
  { nombre: "Quilmes", direccion: "Av. Calchaqui 1516, 1878 Quilmes", lat: -34.74150536486278, lng: -58.290342532684406, tipo: "Propia (Receptoría)", localidad: "Quilmes" },
  { nombre: "C.A.B.A. (Constitución)", direccion: "Constitucion 2844, 1427 C.A.B.A.", lat: -34.62679797481416, lng: -58.404602375017966, tipo: "Propia (Receptoría)", localidad: "C.A.B.A." },
  { nombre: "San Martin", direccion: "Rep. de El Líbano 4079, 1650 San Martin", lat: -34.5917564332639, lng: -58.52567591734798, tipo: "Propia (Receptoría)", localidad: "San Martin" },
  { nombre: "San Miguel", direccion: "Ricardo Balbin 190, 1613 San Miguel", lat: -34.533572237807796, lng: -58.703336334544936, tipo: "Propia (Receptoría)", localidad: "San Miguel" },
  { nombre: "C.A.B.A. (Dorrego)", direccion: "Dorrego Av. 205, 1414 C.A.B.A.", lat: -34.59657970325319, lng: -58.45350723084022, tipo: "Propia (Receptoría)", localidad: "C.A.B.A." },
  { nombre: "CTC", direccion: "Pergamino 3751, 1437 CABA", lat: -34.668103736362234, lng: -58.43726774618026, tipo: "CTC", localidad: "CABA" },
  { nombre: "Mercado Central", direccion: "Au. Riccheri y Boulogne Sur Mer, Mercado Central de Buenos Aires - Nave D3, Tapiales, Buenos Aires, Provincia de Buenos Aires", lat: -34.71550003770752, lng: -58.48992256931323, tipo: "Mercado Central", localidad: "Mercado central" }
];


let map, routeLayer;
const apiKey = '5b3ce3597851110001cf62482cba5187b82546e59dc17d9537752b5e';

const originSelect = document.getElementById('origin-select');
const destinationSelect = document.getElementById('destination-select');
const routeInfo = document.getElementById('route-info');
const sucursalesContainer = document.querySelector('#sucursales-list .sucursales-container');
const sucursalesListHeader = document.querySelector('#sucursales-list h3');

function initMap() {
  map = L.map('map').setView([-34.6037, -58.3816], 10);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
  }).addTo(map);

  sucursales.forEach(sucursal => {
    L.marker([sucursal.lat, sucursal.lng])
      .addTo(map)
      .bindPopup(`
        <strong>${sucursal.nombre}</strong><br>
        Dirección: ${sucursal.direccion}<br>
        Tipo: ${sucursal.tipo}<br>
        Localidad: ${sucursal.localidad}
      `);
  });

  populateSelectOptions();
  document.getElementById('calculate-route').addEventListener('click', calculateRoute);
  displaySucursalesList();
}

function populateSelectOptions() {
  sucursales.forEach(sucursal => {
    const option = new Option(sucursal.nombre, `${sucursal.lng},${sucursal.lat}`);
    originSelect.add(option.cloneNode(true));
    destinationSelect.add(option);
  });
}

function calculateRoute() {
  showLoading();
  const origin = originSelect.value;
  const destination = destinationSelect.value;

  if (!origin || !destination) {
    alert('Por favor, selecciona un origen y un destino.');
    hideLoading();
    return;
  }

  if (routeLayer) {
    map.removeLayer(routeLayer);
  }

  const url = `https://api.openrouteservice.org/v2/directions/driving-hgv?api_key=${apiKey}&start=${origin}&end=${destination}`;

  fetch(url)
    .then(response => {
      if (!response.ok) {
        throw new Error('Error en la respuesta de la API');
      }
      return response.json();
    })
    .then(data => {
      const route = data.features[0];
      const coords = route.geometry.coordinates.map(coord => [coord[1], coord[0]]);
      
      routeLayer = L.polyline(coords, {color: 'blue'}).addTo(map);
      map.fitBounds(routeLayer.getBounds());

      const distance = route.properties.segments[0].distance / 1000; // km
      const duration = route.properties.segments[0].duration / 60; // minutos

      routeInfo.innerHTML = `
        <p>Distancia: ${distance.toFixed(2)} km</p>
        <p>Tiempo estimado: ${Math.floor(duration / 60)} horas ${Math.round(duration % 60)} minutos</p>
        <p>Nota: Esta ruta está optimizada para vehículos pesados.</p>
      `;
    })
    .catch(error => {
      console.error('Error:', error);
      routeInfo.innerHTML = `<p>Error al calcular la ruta. Por favor, intenta de nuevo.</p>`;
    })
    .finally(() => {
      hideLoading();
    });
}

function displaySucursalesList() {
  sucursalesContainer.innerHTML = '';
  sucursales.forEach(sucursal => {
    const item = document.createElement('div');
    item.className = 'sucursal-item';
    item.textContent = sucursal.nombre;
    item.onclick = () => {
      map.setView([sucursal.lat, sucursal.lng], 15);
    };
    sucursalesContainer.appendChild(item);
  });
}

function showLoading() {
  const loading = document.createElement('div');
  loading.className = 'loading';
  routeInfo.innerHTML = '';
  routeInfo.appendChild(loading);
}

function hideLoading() {
  const loading = document.querySelector('.loading');
  if (loading) {
    loading.remove();
  }
}

// Efecto acordeón para la lista de sucursales
sucursalesListHeader.addEventListener('click', () => {
  sucursalesListHeader.classList.toggle('active');
  sucursalesContainer.style.maxHeight = sucursalesListHeader.classList.contains('active') ? sucursalesContainer.scrollHeight + 'px' : '0';
});

document.addEventListener('DOMContentLoaded', initMap);
