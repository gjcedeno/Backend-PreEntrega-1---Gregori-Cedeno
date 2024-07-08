import fs from 'fs/promises';
import path from 'path';
import { __dirname } from '../utils.js';

class CartManager {
    constructor(relativePath) {
        this.path = path.join(__dirname, relativePath);
    }

    async createCart() {
        try {
            const carts = await this._readCarts();
            const newCart = { id: carts.length ? Math.max(...carts.map(c => c.id)) + 1 : 1, products: [] };
            carts.push(newCart);
            await this._writeCarts(carts);
            return newCart;
        } catch (error) {
            console.error('Error al crear el carrito:', error);
            throw new Error('No se pudo crear el carrito');
        }
    }

    async getCartById(id) {
        try {
            const carts = await this._readCarts();
            return carts.find(cart => cart.id === Number(id));
        } catch (error) {
            console.error('Error al obtener el carrito:', error);
            throw new Error('No se pudo obtener el carrito');
        }
    }

    async addProductToCart(cartId, productId) {
        try {
            const carts = await this._readCarts();
            const cart = carts.find(cart => cart.id === Number(cartId));
            if (!cart) {
                return null;
            }

            const existingProduct = cart.products.find(p => p.product === productId);
            if (existingProduct) {
                existingProduct.quantity += 1;
            } else {
                cart.products.push({ product: productId, quantity: 1 });
            }

            await this._writeCarts(carts);
            return cart;
        } catch (error) {
            console.error('Error al agregar el producto al carrito:', error);
            throw new Error('No se pudo agregar el producto al carrito');
        }
    }

    async deleteCart(id) {
        try {
            const carts = await this._readCarts();
            const index = carts.findIndex(cart => cart.id === Number(id));
            if (index === -1) {
                return null;
            }
            const deletedCart = carts.splice(index, 1)[0];
            await this._writeCarts(carts);
            return deletedCart;
        } catch (error) {
            console.error('Error al eliminar el carrito:', error);
            throw new Error('No se pudo eliminar el carrito');
        }
    }

    async _readCarts() {
        try {
            const data = await fs.readFile(this.path, 'utf-8');
            return JSON.parse(data);
        } catch (error) {
            console.error('Error al leer los carritos:', error);
            return [];
        }
    }

    async _writeCarts(carts) {
        try {
            await fs.writeFile(this.path, JSON.stringify(carts, null, 2));
        } catch (error) {
            console.error('Error al escribir los carritos:', error);
            throw new Error('No se pudo escribir la base de datos de carritos');
        }
    }
}

export default CartManager;