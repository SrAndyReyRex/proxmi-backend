require('dotenv').config();

const pool = require('./config/db');
const bcrypt = require('bcrypt');

async function crearComercioPrueba() {
    const conexion = await pool.getConnection();

    try {
        await conexion.beginTransaction();

        const correo = 'comercio.prueba@proxmi.com';
        const password = 'Comercio_Proxmi_2026!';
        const nombre = 'Comercio de prueba';

        // Comprobar si el usuario ya existe
        const [usuarios] = await conexion.execute(
            'SELECT idUsuario FROM Usuario WHERE correo = ?',
            [correo]
        );

        if (usuarios.length > 0) {
            await conexion.rollback();

            console.log(
                'La cuenta ya existe. No se realizaron cambios.'
            );

            return;
        }

        // Cifrar la contraseña
        const passwordHash = await bcrypt.hash(password, 12);

        // Crear el usuario de comercio
        const [resultadoUsuario] = await conexion.execute(
            `INSERT INTO Usuario
                (nombre, correo, passwordHash, rol)
             VALUES (?, ?, ?, ?)`,
            [nombre, correo, passwordHash, 'comercio']
        );

        // Crear la tienda asociada al usuario
        await conexion.execute(
            `INSERT INTO Comercio
                (idUsuario, nombre, descripcion, direccion, estado)
             VALUES (?, ?, ?, ?, TRUE)`,
            [
                resultadoUsuario.insertId,
                nombre,
                'Tienda utilizada para probar la API de Proxmi',
                'Dirección de prueba'
            ]
        );

        await conexion.commit();

        console.log('¡Cuenta de comercio creada correctamente!');
        console.log('Correo:', correo);
        console.log('Contraseña:', password);
        console.log('Rol: comercio');
        console.log('Ya puedes probar el inicio de sesión en Postman.');

    } catch (error) {
        await conexion.rollback();

        console.error(
            'Error al crear la cuenta:',
            error.message
        );
    } finally {
        conexion.release();
        await pool.end();
    }
}

crearComercioPrueba();