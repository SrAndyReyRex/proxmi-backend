const jwt = require('jsonwebtoken');
const pool = require('../config/db');

// Verificar token y comprobar que el usuario siga activo
const verificarToken = async (req, res, next) => {
    try {
        const encabezado = req.headers.authorization;

        // Comprobar que exista el encabezado Bearer
        if (!encabezado || !encabezado.startsWith('Bearer ')) {
            return res.status(401).json({
                mensaje: 'Debes iniciar sesión para acceder a este recurso.'
            });
        }

        // Extraer el token
        const token = encabezado.split(' ')[1];

        if (!token) {
            return res.status(401).json({
                mensaje: 'El token de autenticación no fue proporcionado.'
            });
        }

        // Verificar firma, expiración y algoritmo permitido
        const datosUsuario = jwt.verify(
            token,
            process.env.JWT_SECRET,
            { algorithms: ['HS256'] }
        );

        // Comprobar que el token contenga la identidad esperada
        if (
            !Number.isInteger(datosUsuario.idUsuario) ||
            datosUsuario.idUsuario <= 0
        ) {
            return res.status(401).json({
                mensaje: 'El token no contiene una identidad válida.'
            });
        }

        // Consultar el estado y el rol actuales del usuario
        const [usuarios] = await pool.execute(
            `SELECT idUsuario, rol, estado
             FROM Usuario
             WHERE idUsuario = ?`,
            [datosUsuario.idUsuario]
        );

        // Rechazar usuarios inexistentes o desactivados
        if (
            usuarios.length === 0 ||
            usuarios[0].estado === 0 ||
            usuarios[0].estado === false
        ) {
            return res.status(401).json({
                mensaje: 'La cuenta no existe o está desactivada.'
            });
        }

        // Usar el rol actual de la base de datos, no el del token
        req.usuario = {
            idUsuario: usuarios[0].idUsuario,
            rol: usuarios[0].rol
        };

        // Continuar con la solicitud
        next();

    } catch (error) {
        if (error.name === 'JsonWebTokenError' ||
            error.name === 'TokenExpiredError' ||
            error.name === 'NotBeforeError') {
            return res.status(401).json({
                mensaje: 'El token es inválido o ha expirado.'
            });
        }

        console.error('Error al verificar autenticación:', error.message);

        return res.status(500).json({
            mensaje: 'Error interno al verificar la autenticación.'
        });
    }
};


// Verificar si el usuario tiene uno de los roles permitidos
const permitirRoles = (...rolesPermitidos) => {
    return (req, res, next) => {
        if (!req.usuario || !rolesPermitidos.includes(req.usuario.rol)) {
            return res.status(403).json({
                mensaje: 'No tienes permisos para realizar esta operación.'
            });
        }

        next();
    };
};


module.exports = {
    verificarToken,
    permitirRoles
};
