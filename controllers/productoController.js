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
            nombre,
            descripcion,
            categoria,
            precio,
            stock
        } = req.body;

        // Validar el nombre
        if (
            typeof nombre !== 'string' ||
            nombre.trim() === '' ||
            nombre.trim().length > 150
        ) {
            return res.status(400).json({
                mensaje: 'El nombre es obligatorio y no puede superar los 150 caracteres.'
            });
        }

        // Validar la descripción
        if (
            descripcion !== undefined &&
            descripcion !== null &&
            typeof descripcion !== 'string'
        ) {
            return res.status(400).json({
                mensaje: 'La descripción debe ser un texto o null.'
            });
        }

        // Validar la categoría
        if (
            categoria !== undefined &&
            categoria !== null &&
            typeof categoria !== 'string'
        ) {
            return res.status(400).json({
                mensaje: 'La categoría debe ser un texto o null.'
            });
        }

        // Validar el precio
        const precioNumerico =
            typeof precio === 'number'
                ? precio
                : typeof precio === 'string' && precio.trim() !== ''
                    ? Number(precio)
                    : NaN;

        if (
            !Number.isFinite(precioNumerico) ||
            precioNumerico < 0 ||
            !/^\d+(\.\d{1,2})?$/.test(String(precio).trim()) ||
            precioNumerico > 99999999.99
        ) {
            return res.status(400).json({
                mensaje: 'El precio debe ser un número no negativo con máximo dos decimales.'
            });
        }

        // Validar el stock
        if (
            !Number.isInteger(stock) ||
            stock < 0 ||
            stock > 2147483647
        ) {
            return res.status(400).json({
                mensaje: 'El stock debe ser un entero no negativo válido.'
            });
        }

        // Obtener la tienda asociada al usuario autenticado
        const [comercios] = await pool.execute(
            `SELECT idTienda
             FROM Comercio
             WHERE idUsuario = ?
               AND estado = TRUE`,
            [req.usuario.idUsuario]
        );

        if (comercios.length === 0) {
            return res.status(403).json({
                mensaje: 'No tienes una tienda activa asociada a tu cuenta.'
            });
        }

        const idTienda = comercios[0].idTienda;

        // Registrar el producto
        const [resultado] = await pool.execute(
            `INSERT INTO Producto
                (idTienda, nombre, descripcion, categoria, precio, stock)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [
                idTienda,
                nombre.trim(),
                descripcion == null ? null : descripcion.trim(),
                categoria == null ? null : categoria.trim(),
                precioNumerico,
                stock
            ]
        );

        return res.status(201).json({
            mensaje: 'Producto registrado correctamente.',
            producto: {
                idProducto: resultado.insertId,
                idTienda,
                nombre: nombre.trim(),
                descripcion: descripcion == null ? null : descripcion.trim(),
                categoria: categoria == null ? null : categoria.trim(),
                precio: precioNumerico,
                stock,
                estado: true
            }
        });

    } catch (error) {
        console.error('Error al registrar producto:', error.message);

        return res.status(500).json({
            mensaje: 'Error interno al registrar el producto.'
        });
    }
};

// Actualizar un producto
const actualizarProducto = async (req, res) => {
    try {
        const idProducto = Number(req.params.id);

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

        // Validar el nombre
        if (
            typeof nombre !== 'string' ||
            nombre.trim() === '' ||
            nombre.trim().length > 150
        ) {
            return res.status(400).json({
                mensaje: 'El nombre es obligatorio y no puede superar los 150 caracteres.'
            });
        }

        // Validar la descripción
        if (
            descripcion !== undefined &&
            descripcion !== null &&
            typeof descripcion !== 'string'
        ) {
            return res.status(400).json({
                mensaje: 'La descripción debe ser un texto o null.'
            });
        }

        // Validar la categoría
        if (
            categoria !== undefined &&
            categoria !== null &&
            typeof categoria !== 'string'
        ) {
            return res.status(400).json({
                mensaje: 'La categoría debe ser un texto o null.'
            });
        }

        // Validar el precio
        const precioNumerico =
            typeof precio === 'number'
                ? precio
                : typeof precio === 'string' && precio.trim() !== ''
                    ? Number(precio)
                    : NaN;

        if (
            !Number.isFinite(precioNumerico) ||
            precioNumerico < 0 ||
            !/^\d+(\.\d{1,2})?$/.test(String(precio).trim()) ||
            precioNumerico > 99999999.99
        ) {
            return res.status(400).json({
                mensaje: 'El precio debe ser un número no negativo con máximo dos decimales.'
            });
        }

        // Validar el stock
        if (
            !Number.isInteger(stock) ||
            stock < 0 ||
            stock > 2147483647
        ) {
            return res.status(400).json({
                mensaje: 'El stock debe ser un entero no negativo válido.'
            });
        }

        // Validar el estado
        if (typeof estado !== 'boolean') {
            return res.status(400).json({
                mensaje: 'El estado debe ser true o false.'
            });
        }

        // Actualizar solo si el producto pertenece al comercio autenticado
        const [resultado] = await pool.execute(
            `UPDATE Producto AS p
             INNER JOIN Comercio AS c
                 ON p.idTienda = c.idTienda
             SET p.nombre = ?,
                 p.descripcion = ?,
                 p.categoria = ?,
                 p.precio = ?,
                 p.stock = ?,
                 p.estado = ?
             WHERE p.idProducto = ?
               AND c.idUsuario = ?
               AND c.estado = TRUE`,
            [
                nombre.trim(),
                descripcion == null ? null : descripcion.trim(),
                categoria == null ? null : categoria.trim(),
                precioNumerico,
                stock,
                estado,
                idProducto,
                req.usuario.idUsuario
            ]
        );

        // Si no hubo cambios, comprobar si el producto pertenece a la tienda
        if (resultado.affectedRows === 0) {
            const [productos] = await pool.execute(
                `SELECT p.idProducto
                 FROM Producto p
                 INNER JOIN Comercio c ON p.idTienda = c.idTienda
                 WHERE p.idProducto = ?
                   AND c.idUsuario = ?
                   AND c.estado = TRUE`,
                [idProducto, req.usuario.idUsuario]
            );

            if (productos.length === 0) {
                return res.status(404).json({
                    mensaje: 'No se encontró el producto para tu tienda.'
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

        // Comprobar que el producto pertenece al comercio
        const [productos] = await pool.execute(
            `SELECT p.idProducto, p.estado
             FROM Producto p
             INNER JOIN Comercio c ON p.idTienda = c.idTienda
             WHERE p.idProducto = ?
               AND c.idUsuario = ?
               AND c.estado = TRUE`,
            [idProducto, req.usuario.idUsuario]
        );

        // No revelar ni permitir acceder a productos de otra tienda
        if (productos.length === 0) {
            return res.status(404).json({
                mensaje: 'No se encontró el producto para tu tienda.'
            });
        }

        // Evitar desactivar un producto que ya está desactivado
        if (
            productos[0].estado === 0 ||
            productos[0].estado === false
        ) {
            return res.status(409).json({
                mensaje: 'El producto ya se encuentra desactivado.'
            });
        }

        // Desactivar únicamente un producto de la tienda autenticada
        const [resultado] = await pool.execute(
            `UPDATE Producto AS p
             INNER JOIN Comercio AS c
                 ON p.idTienda = c.idTienda
             SET p.estado = FALSE
             WHERE p.idProducto = ?
               AND p.estado = TRUE
               AND c.idUsuario = ?
               AND c.estado = TRUE`,
            [idProducto, req.usuario.idUsuario]
        );

        // Verificar si la operación modificó el producto
        if (resultado.affectedRows === 0) {
            return res.status(409).json({
                mensaje: 'No se pudo desactivar el producto. Puede que ya esté desactivado o que su estado haya cambiado.'
            });
        }

        return res.status(200).json({
            mensaje: 'Producto desactivado correctamente.',
            idProducto,
            estado: false
        });

    } catch (error) {
        console.error(
            'Error al desactivar producto:',
            error.message
        );

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
