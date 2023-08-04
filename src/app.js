
import express from 'express';
import __dirname from './utils/utils.js';
import handlebars from 'express-handlebars';
import path from'path';
import session from 'express-session';
import MongoStore from 'connect-mongo';
import { Server } from 'socket.io';
import viewsRouter from './routes/views.router.js';
import productsRouter from './routes/products.router.js';
import cartsRouter from './routes/carts.router.js';
import messagesRouter from './routes/messages.router.js';
import sessionsRouter from './routes/sessions.router.js';
import mongoose from 'mongoose';
import passport from 'passport';
import initializePassport from './config/passport.config.js';
import cookieParser from 'cookie-parser';
import config from './config/config.js';

//Express middlewares
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

//Handlebars
app.engine('handlebars', handlebars.engine());
app.set('views', __dirname + '/views');
app.set('view engine', 'handlebars');

//mongoDB
//const MONGO = `mongodb+srv://danizaccarello:danizaccarello@cluster0.446hjvi.mongodb.net/ecommerce`;
mongoose.connect(config.dbUrl, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then((conn) =>{
    console.log('Connected');
}).catch((err) => {
    console.log('Error');
});

//Session
/*app.use(session({
    store: new MongoStore({
        mongoUrl: config.dbUrl,
        ttl: 3600
    }),
    secret: "SecretSession",
    resave: false,
    saveUninitialized: false
}))*/

//Public
app.use('/files', express.static(path.join(__dirname + './public')));

//Passport
initializePassport();
app.use(passport.initialize());
//app.use(passport.session());

//Routes
app.use('/api/sessions', sessionsRouter);
app.use('/api/products', productsRouter);
app.use('/api/carts', cartsRouter);
app.use('api/messages', messagesRouter);
app.use('/', viewsRouter);


//Server
const httpServer = app.listen(config.port, () => console.log('Listening on ' + config.port));

//Socket.io
const io = new Server(httpServer);

app.set('io', io);

io.on('connection', socket => {
    console.log("Nuevo cliente conectado", socket.id);
    updatedProducts(io);
    chat(socket, io);
})

/*
app.get('/products',(req,res)=>{
    const limit = parseInt(req.query.limit);
    const products = productManager.getProducts()
    if(limit > 0 && limit <= 4){
        res.send(products.slice(0, limit));
    }else{
        res.send(products)
    }
});

app.get('/products/:id',(req,res)=>{
    const productId = parseInt(req.params.id);
    const product = productManager.getProductById(productId);
    if(product){
        res.send(product);
    }else{
        return res.status(404).send({ status:'error', error: 'El producto no existe'});
    }
});
*/