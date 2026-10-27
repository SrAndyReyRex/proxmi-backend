const pool = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Registrar un usuario y crear su perfil correspondiente
const registrarUsuario = async (req, res) => {
    let conexion;

    try {
        const { nombre, correo, password, rol } = req.body;

        // Validar los campos obligatorios
        if (
            typeof nombre !== 'string' ||
            nombre.trim() === '' ||
            typeof correo !== 'string' ||
            correo.trim() === '' ||
            typeof password !== 'string' ||
            password.length < 12 ||
            typeof rol !== 'string' ||
            !['comprador', 'comercio'].includes(rol)
        ) {
            return res.status(400).json({
                mensaje: 'Datos inválidos. Verifica nombre, correo, contraseña y rol. La contraseña debe tener al menos 12 caracteres.'
            });
        }

        const nombreNormalizado = nombre.trim();
        const correoNormalizado = correo.trim().toLowerCase();

        // Validar el formato básico del correo
        const formatoCorreo = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!formatoCorreo.test(correoNormalizado)) {
            return res.status(400).json({
                mensaje: 'El formato del correo electrónico no es válido.'
            });
        }

        // Generar el hash de la contraseña
        const passwordHash = await bcrypt.hash(password, 12);

        // Obtener una conexión para ejecutar la transacción
        conexion = await pool.getConnection();

        try {
            await conexion.beginTransaction();

            // Comprobar si el correo ya está registrado
            const [usuariosExistentes] = await conexion.execute(
                'SELECT idUsuario FROM Usuario WHERE correo = ?',
                [correoNormalizado]
            );

            if (usuariosExistentes.length > 0) {
                await conexion.rollback();

                return res.status(409).json({
                    mensaje: 'No se puede registrar una cuenta con ese correo.'
                });
            }

            // Crear el usuario principal
            const [resultadoUsuario] = await conexion.execute(
                `INSERT INTO Usuario
                    (nombre, correo, passwordHash, rol)
                 VALUES (?, ?, ?, ?)`,
                [
                    nombreNormalizado,
                    correoNormalizado,
                    passwordHash,
                    rol
                ]
            );

            const idUsuario = resultadoUsuario.insertId;

            // Crear el perfil correspondiente al rol
            if (rol === 'comprador') {
                await conexion.execute(
                    `INSERT INTO Comprador (idUsuario)
                     VALUES (?)`,
                    [idUsuario]
                );
            }

            if (rol === 'comercio') {
                await conexion.execute(
                    `INSERT INTO Comercio
                        (idUsuario, nombre, descripcion, direccion, estado)
                     VALUES (?, ?, ?, ?, TRUE)`,
                    [
                        idUsuario,
                        nombreNormalizado,
                        'Perfil pendiente de completar',
                        'Pendiente de completar'
                    ]
                );
            }

            // Confirmar todas las operaciones
            await conexion.commit();

            return res.status(201).json({
                mensaje: 'Usuario registrado correctamente.',
                usuario: {
                    idUsuario,
                    nombre: nombreNormalizado,
                    correo: correoNormalizado,
                    rol
                }
            });

        } catch (error) {
            await conexion.rollback();
            throw error;
        }

    } catch (error) {
        console.error('Error al registrar usuario:', error.message);

        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({
                mensaje: 'No se puede registrar una cuenta con ese correo.'
            });
        }

        return res.status(500).json({
            mensaje: 'Error interno al registrar el usuario.'
        });

    } finally {
        if (conexion) {
            conexion.release();
        }
    }
};


// Iniciar sesión
const iniciarSesion = async (req, res) => {
    try {
        const { correo, password } = req.body;

        // Validar los datos recibidos
        if (
            typeof correo !== 'string' ||
            correo.trim() === '' ||
            typeof password !== 'string' ||
            password.length === 0
        ) {
            return res.status(400).json({
                mensaje: 'Debes proporcionar el correo y la contraseña.'
            });
        }

        const correoNormalizado = correo.trim().toLowerCase();

        // Buscar al usuario por su correo
        const [usuarios] = await pool.execute(
            `SELECT idUsuario, nombre, correo, passwordHash, rol, estado
             FROM Usuario
             WHERE correo = ?`,
            [correoNormalizado]
        );

        // Respuesta genérica para credenciales incorrectas
        if (usuarios.length === 0) {
            return res.status(401).json({
                mensaje: 'Correo o contraseña incorrectos.'
            });
        }

        const usuario = usuarios[0];

        // Comprobar que la cuenta esté activa
        if (usuario.estado === 0 || usuario.estado === false) {
            return res.status(403).json({
                mensaje: 'La cuenta no está disponible.'
            });
        }

        // Comparar la contraseña con el hash almacenado
        const passwordValida = await bcrypt.compare(
            password,
            usuario.passwordHash
        );

        if (!passwordValida) {
            return res.status(401).json({
                mensaje: 'Correo o contraseña incorrectos.'
            });
        }

        // Generar el token JWT
        const token = jwt.sign(
            {
                idUsuario: usuario.idUsuario,
                rol: usuario.rol
            },
            process.env.JWT_SECRET,
            {
                expiresIn: '1h',
                algorithm: 'HS256'
            }
        );

        // Devolver el token y los datos públicos del usuario
        return res.status(200).json({
            mensaje: 'Inicio de sesión exitoso.',
            token,
            usuario: {
                idUsuario: usuario.idUsuario,
                nombre: usuario.nombre,
                correo: usuario.correo,
                rol: usuario.rol
            }
        });

    } catch (error) {
        console.error('Error al iniciar sesión:', error.message);

        return res.status(500).json({
            mensaje: 'Error interno al iniciar sesión.'
        });
    }
};


module.exports = {
    registrarUsuario,
    iniciarSesion
};
