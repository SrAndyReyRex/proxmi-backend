const express = require('express');
const pool = require('./config/db');

const app = express();
const PORT = 3000;

const productoRoutes = require('./routes/productoRoutes');
const authRoutes = require('./routes/authRoutes');
// Permite recibir datos JSON en futuras peticiones.
app.use(express.json());

// Rutas de productos
app.use('/api/productos', productoRoutes);

// Rutas de autenticacion
app.use('/api/auth', authRoutes);




// Ruta principal
app.get('/', (req, res) => {
    res.send('¡Bienvenido al backend de Proxmi!');
});

// Iniciar el servidor
app.listen(PORT, () => {
    console.log(`Servidor de Proxmi ejecutándose en http://localhost:${PORT}`);
});
