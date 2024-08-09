import Cart from '../models/cart.js';

class CartManager {
  // Crear un nuevo carrito
  async createCart() {
    const cart = new Cart();
    return await cart.save();
  }

   // Obtener carrito por ID con populate en productos
  async getCartWithProducts(cartId) {
    return await Cart.findById(cartId).populate('products.productId');
  }

  // Agregar un producto al carrito
  async addProductToCart(cartId, productId, quantity) {
    console.log(`Adding product ${productId} to cart ${cartId}`);
    
    const cart = await Cart.findById(cartId);
    if (!cart) {
      console.error(`Cart with ID ${cartId} not found`);
      throw new Error(`Cart with ID ${cartId} not found`);
    }
  
    const existingProduct = cart.products.find(p => p.productId.toString() === productId);
    if (existingProduct) {
      existingProduct.quantity += quantity;
    } else {
      cart.products.push({ productId, quantity });
    }
  
    console.log(`Updated cart: ${JSON.stringify(cart)}`);
    return await cart.save();
  }

  // Actualizar todos los productos del carrito
  async updateCartProducts(cartId, products) {
    const cart = await Cart.findById(cartId);
    if (!cart) {
      throw new Error('Cart not found');
    }

    cart.products = products;
    return await cart.save();
  }

  // Actualizar la cantidad de un producto en el carrito
  async updateProductQuantity(cartId, productId, quantity) {
    const cart = await Cart.findById(cartId);
    if (!cart) {
      throw new Error('Cart not found');
    }

    const product = cart.products.find(p => p.productId.toString() === productId);
    if (!product) {
      throw new Error('Product not found in cart');
    }

    product.quantity = quantity;
    return await cart.save();
  }

  // Eliminar un producto del carrito
  async removeProductFromCart(cartId, productId) {
    const cart = await Cart.findById(cartId);
    if (!cart) {
      throw new Error('Cart not found');
    }

    cart.products = cart.products.filter(p => p.productId.toString() !== productId);
    return await cart.save();
  }

  // Eliminar todos los productos del carrito
  async clearCart(cartId) {
    const cart = await Cart.findById(cartId);
    if (!cart) {
      throw new Error('Cart not found');
    }

    cart.products = [];
    return await cart.save();
  }

  // Eliminar un carrito por ID
  async deleteCart(cartId) {
    return await Cart.deleteOne({ _id: cartId });
  }

  // Eliminar todos los carritos
  async deleteAllCarts() {
    return await Cart.deleteMany({});
  }
}

export default CartManager;