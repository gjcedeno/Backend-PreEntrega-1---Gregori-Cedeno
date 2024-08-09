import Product from '../models/Product.js';

class ProductManager {
  async getAllProducts({ limit = 10, page = 1, sort = 'asc', query = '', category = '', status = '' } = {}) {
    try {
      const queryObj = {};

      // Aplicar filtro de búsqueda general (por título o descripción)
      if (query) {
        queryObj.$or = [
          { title: { $regex: query, $options: 'i' } },
          { description: { $regex: query, $options: 'i' } }
        ];
      }

      // Aplicar filtro de categoría si se especifica
      if (category) {
        queryObj.category = category;
      }

      // Aplicar filtro de estado si se especifica
      if (status) {
        queryObj.status = status === 'true';
      }

      // Ejecutar la consulta con los filtros aplicados
      const products = await Product.find(queryObj)
        .limit(Number(limit))
        .skip((page - 1) * limit)
        .sort({ price: sort === 'asc' ? 1 : -1 });

      const totalProducts = await Product.countDocuments(queryObj);
      const totalPages = Math.ceil(totalProducts / limit);

      return {
        status: 'success',
        payload: products,
        totalPages,
        prevPage: page > 1 ? page - 1 : null,
        nextPage: page < totalPages ? page + 1 : null,
        page,
        hasPrevPage: page > 1,
        hasNextPage: page < totalPages,
        prevLink: page > 1 ? `/products?limit=${limit}&page=${page - 1}&sort=${sort}&query=${query}&category=${category}&status=${status}` : null,
        nextLink: page < totalPages ? `/products?limit=${limit}&page=${page + 1}&sort=${sort}&query=${query}&category=${category}&status=${status}` : null,
      };
    } catch (error) {
      console.error('Error al obtener los productos:', error);
      throw new Error('No se pudo obtener los productos');
    }
  }

  async getProductById(id) {
    try {
      return await Product.findById(id);
    } catch (error) {
      console.error('Error al obtener el producto:', error);
      throw new Error('No se pudo obtener el producto');
    }
  }

  async addProduct(data) {
    try {
      const newProduct = new Product(data);
      return await newProduct.save();
    } catch (error) {
      console.error('Error al agregar el producto:', error);
      throw new Error('No se pudo agregar el producto');
    }
  }

  async updateProduct(id, updatedFields) {
    try {
      return await Product.findByIdAndUpdate(id, updatedFields, { new: true });
    } catch (error) {
      console.error('Error al actualizar el producto:', error);
      throw new Error('No se pudo actualizar el producto');
    }
  }

  async deleteProduct(id) {
    try {
      return await Product.findByIdAndDelete(id);
    } catch (error) {
      console.error('Error al eliminar el producto:', error);
      throw new Error('No se pudo eliminar el producto');
    }
  }
}

export default ProductManager;