import express from 'express';
import { __dirname } from './utils.js';
import ProductRoute from './routes/products.router.js';
import CartRoute from './routes/carts.router.js';

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/products', ProductRoute);
app.use('/api/carts', CartRoute);

const PORT = 8080;

app.listen(PORT, () => {
    console.log(`Servidor ON en el puerto ${PORT}`);
});