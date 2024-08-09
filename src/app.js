import express from 'express';
import exphbs from 'express-handlebars';
import path from 'path';
import { fileURLToPath } from 'url';
import connectDB from './config/mongoConfig.js';
import productsRouter from './routes/products.router.js';
import cartsRouter from './routes/carts.router.js';
import ProductManager from './class/ProductManager.js';
import CartManager from './class/CartManager.js';
import session from 'express-session';
import dotenv from 'dotenv';

dotenv.config();

// Define __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Conexión a la base de datos
connectDB();

// Configuración de middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configuración de sesiones
app.use(session({
  secret: 'your-secret-key', // Cambia esto por una clave secreta más segura
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false } // Cambia a true si usas HTTPS
}));

// Instancia de ProductManager y CartManager
const productManager = new ProductManager();
const cartManager = new CartManager(); 

// Configuración del motor de plantillas Handlebars
const hbs = exphbs.create({
  defaultLayout: 'main',
  extname: '.handlebars',
  layoutsDir: path.join(__dirname, 'views/layouts'),
  partialsDir: path.join(__dirname, 'views/partials'),
  runtimeOptions: {
    allowProtoPropertiesByDefault: true,
    allowProtoMethodsByDefault: true,
  },
});

app.engine('.handlebars', hbs.engine);
app.set('view engine', '.handlebars');
app.set('views', path.join(__dirname, 'views'));

// Rutas de API
app.use('/api/products', productsRouter);
app.use('/api/carts', cartsRouter);

// Ruta para obtener o crear un carrito (utilizando sesiones)
app.get('/api/cart', async (req, res) => {
  try {
    let cartId = req.session.cartId;

    if (!cartId) {
      const cart = await cartManager.createCart();
      req.session.cartId = cart._id; 
      cartId = cart._id;
      console.log(`Created new cart with ID: ${cartId}`);
    }

    res.json({ cartId });
  } catch (error) {
    console.error('Error al obtener o crear el carrito:', error);
    res.status(500).send('Error al obtener o crear el carrito');
  }
});

// Rutas para las vistas
app.get('/products', async (req, res) => {
  try {
    let cartId = req.session.cartId;

    // Si no existe un carrito en la sesión, crea uno nuevo
    if (!cartId) {
      const cart = await cartManager.createCart();
      req.session.cartId = cart._id;
      cartId = cart._id;
    }

    const { limit = 10, page = 1, sort = 'asc', query = '', category = '', status = '' } = req.query;

    const result = await productManager.getAllProducts({
      limit: Number(limit),
      page: Number(page),
      sort,
      query,
      category,
      status,
    });

    const updatedResult = {
      ...result,
      prevLink: result.hasPrevPage ? `/products?limit=${limit}&page=${result.prevPage}&sort=${sort}&query=${query}&category=${category}&status=${status}` : null,
      nextLink: result.hasNextPage ? `/products?limit=${limit}&page=${result.nextPage}&sort=${sort}&query=${query}&category=${category}&status=${status}` : null
    };

    res.render('index', {
      title: 'Product List',
      products: updatedResult.payload,
      hasPrevPage: updatedResult.hasPrevPage,
      hasNextPage: updatedResult.hasNextPage,
      prevLink: updatedResult.prevLink,
      nextLink: updatedResult.nextLink,
      cartId // Pasar el ID del carrito a la vista
    });
  } catch (error) {
    res.status(500).send('Error al obtener productos');
  }
});

app.get('/products/:pid', async (req, res) => {
  try {
    const product = await productManager.getProductById(req.params.pid);
    if (product) {
      let cartId = req.session.cartId;

      // Si no existe un carrito en la sesión, crea uno nuevo
      if (!cartId) {
        const cart = await cartManager.createCart();
        req.session.cartId = cart._id; // Almacena el ID del carrito en la sesión
        cartId = cart._id;
      }

      res.render('product', {
        title: product.title,
        product,
        cartId // Pasar el ID del carrito a la vista
      });
    } else {
      res.status(404).send('Producto no encontrado');
    }
  } catch (error) {
    res.status(500).send('Error al obtener el producto');
  }
});

app.get('/carts/:cid', async (req, res) => {
  try {
    const cart = await cartManager.getCartWithProducts(req.params.cid);
    if (cart) {
      res.render('cart', { title: 'My Cart', cart });
    } else {
      res.status(404).send('Carrito no encontrado');
    }
  } catch (error) {
    res.status(500).send('Error al obtener el carrito');
  }
});

// Inicia el servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});