const pool = require('../config/db');

// Consultar todos los productos
const obtenerProductos = async (req, res) => {
    try {
        const { estado } = req.query;

        let sql = `
            SELECT
                idProducto,
                idTienda,
                nombre,
                descripcion,
                categoria,
                precio,
                stock,
                estado
            FROM Producto
        `;

        const parametros = [];

        // Filtrar por estado si el usuario lo solicita
        if (estado !== undefined) {
            if (estado !== 'true' && estado !== 'false') {
                return res.status(400).json({
                    mensaje: 'El parámetro estado debe ser true o false.'
                });
            }

            sql += ' WHERE estado = ?';
            parametros.push(estado === 'true' ? 1 : 0);
        }

        const [productos] = await pool.execute(sql, parametros);

        return res.status(200).json({
            mensaje: 'Productos consultados correctamente.',
            total: productos.length,
            datos: productos
        });

    } catch (error) {
        console.error('Error al consultar productos:', error.message);

        return res.status(500).json({
            mensaje: 'Error interno al consultar los productos.'
        });
    }
};

// Consultar un producto por su identificador
const obtenerProductoPorId = async (req, res) => {
    try {
        // 1. Obtener el ID de la URL
        const idProducto = Number(req.params.id);

        // 2. Validar el identificador
        if (!Number.isInteger(idProducto) || idProducto <= 0) {
            return res.status(400).json({
                mensaje: 'El identificador debe ser un entero positivo.'
            });
        }

        // 3. Buscar el producto en MySQL
        const [productos] = await pool.execute(
            `SELECT
                idProducto,
                idTienda,
                nombre,
                descripcion,
                categoria,
                precio,
                stock,
                estado
             FROM Producto
             WHERE idProducto = ?`,
            [idProducto]
        );

        // 4. Comprobar si existe
        if (productos.length === 0) {
            return res.status(404).json({
                mensaje: 'No se encontró el producto solicitado.'
            });
        }

        // 5. Devolver el producto
        return res.status(200).json({
            mensaje: 'Producto consultado correctamente.',
            producto: productos[0]
        });

    } catch (error) {
        console.error('Error al consultar el producto:', error.message);

        return res.status(500).json({
            mensaje: 'Error interno al consultar el producto.'
        });
    }
};

// Crear un producto
const crearProducto = async (req, res) => {
    try {
        const {
            idTienda,
            nombre,
            descripcion,
            categoria,
            precio,
            stock
        } = req.body;

        // Validar los datos obligatorios
        if (
            !Number.isInteger(idTienda) ||
            idTienda <= 0 ||
            typeof nombre !== 'string' ||
            nombre.trim() === '' ||
            precio === undefined ||
            precio === null ||
            precio === '' ||
            !Number.isFinite(Number(precio)) ||
            !Number.isInteger(stock) ||
            stock < 0
        ) {
            return res.status(400).json({
                mensaje: 'Datos inválidos. Verifica idTienda, nombre, precio y stock.'
            });
        }

        // El precio no puede ser negativo
        if (Number(precio) < 0) {
            return res.status(400).json({
                mensaje: 'El precio no puede ser negativo.'
            });
        }

        // Registrar el producto en MySQL
        const [resultado] = await pool.execute(
            `INSERT INTO Producto
                (idTienda, nombre, descripcion, categoria, precio, stock)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [
                idTienda,
                nombre.trim(),
                descripcion ?? null,
                categoria ?? null,
                Number(precio),
                stock
            ]
        );

        // Responder con el producto creado
        return res.status(201).json({
            mensaje: 'Producto registrado correctamente.',
            producto: {
                idProducto: resultado.insertId,
                idTienda,
                nombre: nombre.trim(),
                descripcion: descripcion ?? null,
                categoria: categoria ?? null,
                precio: Number(precio),
                stock,
                estado: true
            }
        });

    } catch (error) {
        console.error('Error al registrar producto:', error.message);

        if (error.code === 'ER_NO_REFERENCED_ROW_2') {
            return res.status(400).json({
                mensaje: 'El comercio indicado no existe.'
            });
        }

        return res.status(500).json({
            mensaje: 'Error interno al registrar el producto.'
        });
    }
};

// Actualizar un producto
const actualizarProducto = async (req, res) => {
    try {
        // Obtener el ID desde la URL
        const idProducto = Number(req.params.id);

        // Obtener los datos enviados en el cuerpo
        const {
            nombre,
            descripcion,
            categoria,
            precio,
            stock,
            estado
        } = req.body;

        // Validar el identificador
        if (!Number.isInteger(idProducto) || idProducto <= 0) {
            return res.status(400).json({
                mensaje: 'El identificador debe ser un entero positivo.'
            });
        }

        // Validar los datos recibidos
        if (
            typeof nombre !== 'string' ||
            nombre.trim() === '' ||
            precio === undefined ||
            precio === null ||
            precio === '' ||
            !Number.isFinite(Number(precio)) ||
            Number(precio) < 0 ||
            !Number.isInteger(stock) ||
            stock < 0 ||
            typeof estado !== 'boolean'
        ) {
            return res.status(400).json({
                mensaje: 'Los datos del producto son inválidos.'
            });
        }

        // Actualizar el registro en MySQL
        const [resultado] = await pool.execute(
            `UPDATE Producto
             SET nombre = ?,
                 descripcion = ?,
                 categoria = ?,
                 precio = ?,
                 stock = ?,
                 estado = ?
             WHERE idProducto = ?`,
            [
                nombre.trim(),
                descripcion ?? null,
                categoria ?? null,
                Number(precio),
                stock,
                estado,
                idProducto
            ]
        );

        // Si no se modificó ninguna fila, comprobar si existe
        if (resultado.affectedRows === 0) {
            const [productos] = await pool.execute(
                'SELECT idProducto FROM Producto WHERE idProducto = ?',
                [idProducto]
            );

            if (productos.length === 0) {
                return res.status(404).json({
                    mensaje: 'No se encontró el producto.'
                });
            }
        }

        return res.status(200).json({
            mensaje: 'Producto actualizado correctamente.',
            idProducto
        });

    } catch (error) {
        console.error('Error al actualizar producto:', error.message);

        return res.status(500).json({
            mensaje: 'Error interno al actualizar el producto.'
        });
    }
};

// Desactivar un producto (eliminación lógica)
const desactivarProducto = async (req, res) => {
    try {
        const idProducto = Number(req.params.id);

        // Validar el identificador
        if (!Number.isInteger(idProducto) || idProducto <= 0) {
            return res.status(400).json({
                mensaje: 'El identificador debe ser un entero positivo.'
            });
        }

        // Comprobar que el producto exista
        const [productos] = await pool.execute(
            'SELECT idProducto, estado FROM Producto WHERE idProducto = ?',
            [idProducto]
        );

        if (productos.length === 0) {
            return res.status(404).json({
                mensaje: 'No se encontró el producto.'
            });
        }

        // Evitar desactivar un producto que ya está desactivado
        if (productos[0].estado === 0 || productos[0].estado === false) {
            return res.status(409).json({
                mensaje: 'El producto ya se encuentra desactivado.'
            });
        }

        // Actualizar su estado sin borrar el registro
        await pool.execute(
            'UPDATE Producto SET estado = 0 WHERE idProducto = ?',
            [idProducto]
        );

        return res.status(200).json({
            mensaje: 'Producto desactivado correctamente.',
            idProducto,
            estado: false
        });

    } catch (error) {
        console.error('Error al desactivar producto:', error.message);

        return res.status(500).json({
            mensaje: 'Error interno al desactivar el producto.'
        });
    }
};




// Exportar el controlador para que pueda utilizarse desde las rutas
module.exports = {
    obtenerProductos,
    obtenerProductoPorId,
    crearProducto,
    actualizarProducto,
    desactivarProducto
};
