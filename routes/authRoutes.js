const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');

const {
    registrarUsuario,
    iniciarSesion
} = require('../controllers/authController');

// Limitar solicitudes de autenticación
const limiteAutenticacion = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    limit: 5,                 // Máximo 5 solicitudes
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    message: {
        mensaje: 'Demasiados intentos. Inténtalo de nuevo dentro de 15 minutos.'
    }
});

// Registrar un usuario
router.post('/registro', limiteAutenticacion, registrarUsuario);

// Iniciar sesión
router.post('/login', limiteAutenticacion, iniciarSesion);

module.exports = router;
