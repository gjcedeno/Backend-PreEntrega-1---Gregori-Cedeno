import express from 'express';
import ProductManager from '../class/ProductManager.js';

const router = express.Router();
const productManager = new ProductManager();


router.get('/', async (req, res) => {
  try {
      const { limit, page, sort, query, category, status } = req.query;

      const options = {
          limit: Number(limit) || 10,
          page: Number(page) || 1,
          sort: sort === 'asc' || sort === 'desc' ? sort : 'asc',
          query: query || '',
          category: category || '',
          status: status || ''
      };

      const result = await productManager.getAllProducts(options);

      res.json({
          status: 'success',
          payload: result.payload,
          totalPages: result.totalPages,
          prevPage: result.prevPage,
          nextPage: result.nextPage,
          page: result.page,
          hasPrevPage: result.hasPrevPage,
          hasNextPage: result.hasNextPage,
          prevLink: result.prevLink,
          nextLink: result.nextLink
      });
  } catch (error) {
      res.status(500).json({ status: 'error', message: error.message });
  }
  });

/**
 * obtener un producto por ID.
 * @param {String} pid - ID del producto.
 */
router.get('/:pid', async (req, res) => {
  try {
    const product = await productManager.getProductById(req.params.pid);
    if (product) {
      res.json({ status: 'success', payload: product });
    } else {
      res.status(404).json({ status: 'error', message: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

/**
 * Agregar un nuevo producto.
 * @body {Object} product - Datos del producto a agregar.
 */
router.post('/', async (req, res) => {
  try {
    const newProduct = req.body;
    const addedProduct = await productManager.addProduct(newProduct);
    res.status(201).json({ status: 'success', payload: addedProduct });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

/**
 * Actualizar un producto por ID.
 * @param {String} pid - ID del producto.
 * @body {Object} product - Datos actualizados del producto.
 */
router.put('/:pid', async (req, res) => {
  try {
    const productId = req.params.pid;
    const updatedProduct = req.body;
    const result = await productManager.updateProduct(productId, updatedProduct);
    if (result) {
      res.json({ status: 'success', payload: result });
    } else {
      res.status(404).json({ status: 'error', message: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

/**
 * Eliminar un producto por ID.
 * @param {String} pid - ID del producto.
 */
router.delete('/:pid', async (req, res) => {
  try {
    const result = await productManager.deleteProduct(req.params.pid);
    if (result) {
      res.json({ status: 'success', message: 'Product deleted successfully' });
    } else {
      res.status(404).json({ status: 'error', message: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

export default router;