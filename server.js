//Imports
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const methodOverride = require('method-override');

const app = express();
const PORT = process.env.PORT || 3000;

//Set View Engine
app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');
app.use(express.static('public'))
app.use(express.static('uploads'))

//Database connection
mongoose.connect(process.env.DATABASE_URL)
const db = mongoose.connection
db.on('error', err => console.log(err))
db.once('open', () => console.log('Connected to database'));

//Middlewares
app.use(express.urlencoded({ extended: true}));
app.use(express.json());
app.use(session({
    secret: 'my secret key',
    saveUninitialized: true,
    resave: false
}))
app.use((req,res,next) => {
    res.locals.message = req.session.message;
    delete req.session.message;
    next();
});
app.use(methodOverride("_method"))

app.use('/', require('./server/routes/routes'))

app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});