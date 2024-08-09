import express from 'express';
import CartManager from '../class/CartManager.js';

const router = express.Router();
const cartManager = new CartManager();

// Crear un nuevo carrito
router.post('/', async (req, res) => {
  try {
    if (req.session.cartId) {
      console.log(`Clearing old cartId ${req.session.cartId} from session.`);
      delete req.session.cartId;
    }

    const cart = await cartManager.createCart();
    req.session.cartId = cart._id;
    console.log(`Created new cart with ID ${cart._id} and updated session.`);
    res.status(201).json({ status: 'success', payload: cart });
  } catch (error) {
    console.error('Error creating cart:', error);
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// Obtener carrito por ID y populate productos
router.get('/:cid', async (req, res) => {
  try {
    const cart = await cartManager.getCartWithProducts(req.params.cid);
    if (cart) {
      res.json({ status: 'success', payload: cart });
    } else {
      res.status(404).json({ status: 'error', message: 'Cart not found' });
    }
  } catch (error) {
    console.error('Error getting cart:', error);
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// Ruta para manejar "My Cart"
router.get('/mycart', async (req, res) => {
  try {
    let cartId = req.session.cartId;

    // Si no hay cartId, crear un nuevo carrito
    if (!cartId) {
      const newCart = await cartManager.createCart();
      req.session.cartId = newCart._id;
      cartId = newCart._id;
      console.log(`New cart created with ID: ${cartId}`);
    }

    // Verificar si el carrito existe en la base de datos
    const cartExists = await cartManager.getCartWithProducts(cartId);

    // Si el carrito no existe (por ejemplo, si fue eliminado), crear uno nuevo
    if (!cartExists) {
      const newCart = await cartManager.createCart();
      req.session.cartId = newCart._id;
      cartId = newCart._id;
      console.log(`Cart not found. New cart created with ID: ${cartId}`);
    }

    // Redirigir al usuario a la vista del carrito correspondiente
    res.redirect(`/carts/${cartId}`);
  } catch (error) {
    console.error('Error handling My Cart:', error);
    res.status(500).send('Internal Server Error');
  }
});

// Agregar un producto al carrito
router.post('/:cid/products/:pid', async (req, res) => {
  try {
    const { quantity } = req.body;
    let cart;

    if (req.session.cartId) {
      cart = await cartManager.getCartWithProducts(req.session.cartId);
      if (!cart) {
        console.warn(`Session cartId ${req.session.cartId} is invalid. Clearing session.`);
        delete req.session.cartId;
      }
    }

    if (!cart) {
      cart = await cartManager.getCartWithProducts(req.params.cid);
      if (!cart) {
        cart = await cartManager.createCart();
        req.session.cartId = cart._id;
        console.log(`Created new cart with ID ${cart._id} and updated session.`);
      } else {
        req.session.cartId = cart._id;
        console.log(`Updated session cartId to ${cart._id}`);
      }
    }

    const updatedCart = await cartManager.addProductToCart(cart._id, req.params.pid, quantity);
    res.json({ status: 'success', payload: updatedCart });
  } catch (error) {
    console.error('Error adding product to cart:', error);
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// Ruta para eliminar todos los carritos
router.delete('/all', async (req, res) => {
  try {
    const result = await cartManager.deleteAllCarts();
    console.log(`Deleted all carts. Count: ${result.deletedCount}`);

    res.status(200).json({
      status: 'success',
      message: 'All carts deleted successfully',
      deletedCount: result.deletedCount
    });
  } catch (error) {
    console.error('Error deleting all carts:', error);
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// Actualizar todos los productos del carrito
router.put('/:cid', async (req, res) => {
  try {
    const { products } = req.body;
    const cart = await cartManager.updateCartProducts(req.params.cid, products);
    res.json({ status: 'success', payload: cart });
  } catch (error) {
    console.error('Error updating cart products:', error);
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// Actualizar la cantidad de un producto en el carrito
router.put('/:cid/products/:pid', async (req, res) => {
  try {
    const { quantity } = req.body;
    const cart = await cartManager.updateProductQuantity(req.params.cid, req.params.pid, quantity);
    res.json({ status: 'success', payload: cart });
  } catch (error) {
    console.error('Error updating product quantity:', error);
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// Eliminar un producto del carrito
router.delete('/:cid/products/:pid', async (req, res) => {
  try {
    const cart = await cartManager.removeProductFromCart(req.params.cid, req.params.pid);
    res.json({ status: 'success', payload: cart });
  } catch (error) {
    console.error('Error removing product from cart:', error);
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// Eliminar todos los productos del carrito
router.delete('/:cid', async (req, res) => {
  try {
    const cart = await cartManager.clearCart(req.params.cid);
    res.json({ status: 'success', payload: cart });
  } catch (error) {
    console.error('Error clearing cart:', error);
    res.status(500).json({ status: 'error', message: error.message });
  }
});

export default router;