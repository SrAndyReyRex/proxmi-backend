const express = require('express');
const router = express.Router();

const {
    obtenerProductos,
    obtenerProductoPorId,
    crearProducto,
    actualizarProducto,
    desactivarProducto
} = require('../controllers/productoController');

const {
    verificarToken,
    permitirRoles
} = require('../middlewares/authMiddleware');

// Consultar productos: rutas públicas
router.get('/', obtenerProductos);
router.get('/:id', obtenerProductoPorId);

// Crear productos: solo comercios autenticados
router.post(
    '/',
    verificarToken,
    permitirRoles('comercio'),
    crearProducto
);

// Actualizar productos: solo comercios autenticados
router.put(
    '/:id',
    verificarToken,
    permitirRoles('comercio'),
    actualizarProducto
);

// Desactivar productos: solo comercios autenticados
router.delete(
    '/:id',
    verificarToken,
    permitirRoles('comercio'),
    desactivarProducto
);

module.exports = router;