import fs from 'fs/promises';
import { v4 as uuidv4 } from 'uuid'; 
import path from 'path';
import { __dirname } from '../utils.js';

class ProductManager {
    constructor(relativePath) {
        this.path = path.join(__dirname, relativePath);
    }

    async getAllProducts() {
        try {
            const data = await fs.readFile(this.path, 'utf-8');
            return JSON.parse(data);
        } catch (error) {
            console.error('Error al leer los productos:', error);
            throw new Error('No se pudo leer la base de datos de productos');
        }
    }

    async getProductById(id) {
        try {
            const products = await this.getAllProducts();
            return products.find(product => product.id === id);
        } catch (error) {
            console.error('Error al obtener el producto:', error);
            throw new Error('No se pudo obtener el producto');
        }
    }

    async addProduct({ title, description, code, price, status, stock, category, thumbnails }) {
        try {
            const products = await this.getAllProducts();
            const newProduct = {
                id: uuidv4(),
                title,
                description,
                code,
                price,
                status,
                stock,
                category,
                thumbnails
            };
            products.push(newProduct);
            await this._writeProducts(products);
            return newProduct;
        } catch (error) {
            console.error('Error al agregar el producto:', error);
            throw new Error('No se pudo agregar el producto');
        }
    }

    async updateProduct(id, updatedFields) {
        try {
            const products = await this.getAllProducts();
            const index = products.findIndex(product => product.id === id);
            if (index === -1) {
                return null;
            }
            const product = products[index];
            const updatedProduct = { ...product, ...updatedFields, id: product.id };
            products[index] = updatedProduct;
            await this._writeProducts(products);
            return updatedProduct;
        } catch (error) {
            console.error('Error al actualizar el producto:', error);
            throw new Error('No se pudo actualizar el producto');
        }
    }

    async deleteProduct(id) {
        try {
            const products = await this.getAllProducts();
            const index = products.findIndex(product => product.id === id);
            if (index === -1) {
                return null;
            }
            const deletedProduct = products.splice(index, 1)[0];
            await this._writeProducts(products);
            return deletedProduct;
        } catch (error) {
            console.error('Error al eliminar el producto:', error);
            throw new Error('No se pudo eliminar el producto');
        }
    }

    async _writeProducts(products) {
        try {
            await fs.writeFile(this.path, JSON.stringify(products, null, 2));
        } catch (error) {
            console.error('Error al escribir los productos:', error);
            throw new Error('No se pudo escribir la base de datos de productos');
        }
    }
}

export default ProductManager;