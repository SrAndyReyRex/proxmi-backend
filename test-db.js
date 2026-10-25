const pool = require('./config/db');

async function probarConexion() {
    try {
        const [resultado] = await pool.query('SELECT DATABASE() AS baseDatos');

        console.log('¡Conexión exitosa con MySQL!');
        console.log('Base de datos:', resultado[0].baseDatos);

        const [tablas] = await pool.query('SHOW TABLES');

        console.log('Cantidad de tablas:', tablas.length);
        console.log('Tablas encontradas:');

        tablas.forEach((tabla) => {
            console.log(Object.values(tabla)[0]);
        });

    } catch (error) {
        console.error('Error al conectar con MySQL:', error.message);
    } finally {
        await pool.end();
    }
}

probarConexion();