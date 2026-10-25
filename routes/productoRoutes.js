const express = require('express');

const router = express.Router();

const {
    obtenerProductos,
    obtenerProductoPorId,
    crearProducto,
    actualizarProducto,
    desactivarProducto
} = require('../controllers/productoController');

// Consultar todos los productos
router.get('/', obtenerProductos);

// Consultar un producto por su ID
router.get('/:id', obtenerProductoPorId);

// Crear un producto
router.post('/', crearProducto);

// Actualizar un producto
router.put('/:id', actualizarProducto);

//Desactivar un producto
router.delete('/:id', desactivarProducto);

module.exports = router;
