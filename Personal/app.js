const http = require("http");
const express = require("express")

const app = express();

app.use('/',(req, res, next) => {
    console.log('This always run!');
    next();
});

app.use('/add-product',(req, res, next) => {
    console.log('In another middlware!');
    res.send('<h1>The "Add Product" Page</h1>');
});

app.post('/product',(req,res, next) => {
    console.log(req.body);
    res.send("product")
})

app.use('/',(req, res, next) => {
    console.log('In another middlware!');
    res.send('<h1>Hello from Express</h1>');
});

app.listen(3001,() => {
    console.log("Server running at port 3001...");
});