import express from 'express';
import { __dirname } from './utils.js';
import ProductRoute from './routes/products.router.js';
import CartRoute from './routes/carts.router.js';
import { engine } from 'express-handlebars'; // Importar correctamente la función `engine` de `express-handlebars`
import { Server as SocketIOServer } from 'socket.io';
import http from 'http';
import ProductManager from './class/ProductManager.js';
import path from 'path';

const app = express();
const server = http.createServer(app);
const io = new SocketIOServer(server);
const productManager = new ProductManager('./data/products.json');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//Handlebars
app.engine('handlebars', engine());
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, 'views'));

// Rutas estáticas
app.use(express.static(path.join(__dirname, 'public')));

app.use('/api/products', ProductRoute);
app.use('/api/carts', CartRoute);

// Ruta para la vista de productos
app.get('/products', async (req, res) => {
    const products = await productManager.getAllProducts();
    res.render('index', { products });
});

// Ruta para la vista de productos en tiempo real
app.get('/realtimeproducts', async (req, res) => {
    const products = await productManager.getAllProducts();
    res.render('realTimeProducts', { products });
});

const PORT = 8080;

server.listen(PORT, () => {
    console.log(`Servidor ON en el puerto ${PORT}`);
});

//socket.io
io.on('connection', (socket) => {
    console.log('Cliente conectado');

    socket.on('addProduct', async (productData) => {
        const newProduct = await productManager.addProduct(productData);
        io.emit('productAdded', newProduct);
    });

    socket.on('deleteProduct', async (id) => {
        await productManager.deleteProduct(id);
        io.emit('productDeleted', id);
    });

    socket.on('disconnect', () => {
        console.log('Cliente desconectado');
    });
});