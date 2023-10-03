const express = require('express');
const exphbs = require('express-handlebars');
const cookieparser = require('cookie-parser');
const expsession = require('express-session');
const db = require('./db');

const PORT = 3000;

const app = express();
const hbs = exphbs.create({
    defaultLayout: 'main',
    extname: 'hbs'
});
app.engine('hbs', hbs.engine);
app.set('view engine', 'hbs');

app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

const secret = 'qwerty';
app.use(cookieparser(secret));
app.use(expsession({
    secret: secret,
    resave: false,
    saveUninitialized: true,
    cookie: {
        maxAge: 2000
    }
}));

app.get('/', function (req, res) {
    const sql = 'SELECT * FROM products';
    db.query(sql, function (error, products, fields) {
        if (error) throw error;
        res.render('index', { title: 'Home', products });
    });
});

app.get('/admin', function (req, res) {
    const sql = 'SELECT * FROM products';
    db.query(sql, function (error, products, fields) {
        if (error) throw error;
        res.render('admin', { title: 'Admin', products, add:req.session.add, edit:req.session.edit, delete:req.session.delete });
    });
});

app.get('/products/:id', function (req, res) {
    const id = req.params.id;
    const sql = 'SELECT * FROM products WHERE id=?';
    db.query(sql, [id], function (error, products, fields) {
        if (error) throw error;
        const product = products[0];
        if (product) {
            res.render('product', { title: `Product ${id}`, product });
        }
        else {
            res.render('error', { title: 'Product not found', text: 'Product not found' });
        }
    });
});

app.get('/add', function (req, res) {
    res.render('add');
});

app.post('/add', function (req, res) {
    const product = req.body;
    if (product) {
        const sql = 'INSERT INTO products SET ?';
        db.query(sql, product, function (error, result) {
            if (error) throw error;
            req.session.add = `Task <b>${product.name}</b> added success`;
            res.redirect('/admin');
        });
    }
    else {
        res.render('error', { title: 'Product not add!', text: 'Product not add!' });
    }
});

app.get('/edit/:id', function (req, res) {
    const id = req.params.id;
    const sql = 'SELECT * FROM products WHERE id=?';
    db.query(sql, [id], function (error, products, fields) {
        if (error) throw error;
        const product = products[0];
        if (product) {
            res.render('Edit', { title: `Edit product ${id}`, product });
        }
        else {
            res.render('error', { title: 'Product not found', text: 'Product not found' });
        }
    });
});

app.post('/edit/:id', function (req, res) {
    const id = req.params.id;
    const product = req.body;
    if (product) {
        const sql = 'UPDATE products SET name=?, description=?, detailed_description=?, price=? WHERE id=?';
        db.query(sql, [product.name, product.description, product.detailed_description, product.price, id], function (error, result) {
            if (error) throw error;
            req.session.edit = `Task ${product.name} edit success`;
            res.redirect('/admin');
        });
    }
    else {
        res.render('error', { title: 'Product not edit!', text: 'Product not edit!' });
    }
});

app.get('/delete/:id', function(req, res){
    const id = req.params.id;
    const sqlSelect = 'SELECT * FROM products WHERE id=?';
    db.query(sqlSelect, [id], function (error, products, fields) {
        if (error) throw error;
        const product = products[0];
        if (product) {
            let sqlDel = 'DELETE FROM products WHERE id=?';
            db.query(sqlDel, [id], function(error, result){
                if(error) throw error;
                if(result){
                    req.session.delete = `Task ${product.name} delete success`;
                    res.redirect('/admin');
                }
                else{
                    res.render('error', { title: 'Product not delete', text: 'Product not delete' });
                }
            })
        }
        else {
            res.render('error', { title: 'Prgitoduct not found', text: 'Product not found' });
        }
    });
}); 

app.use(function (req, res) {
    res.render('error', { title: 'Not found', text: 'Page not found' });
});

app.listen(PORT, function () {
    console.log('Server is running on port ' + PORT);
});