const express = require("express");
const bodyParser = require('body-parser');

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');

const app = express();

// it will call next in the end so that the request reaches our middleware
app.use(bodyParser.urlencoded({extended: false}))

app.use(adminRoutes);
app.use(shopRoutes);

// Adding a 404 error page
app.use((req,res,next) => {
    res.status(404).send('<h1>Page not found</h1>');
});

app.listen(3001,() => {
    console.log("Server running at port 3001...");
});