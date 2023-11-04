const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser')
const app = express();
const port = process.env.PORT || 5000;
require('dotenv').config();


//parsers
app.use(express.json())
app.use(cookieParser())
app.use(cors({
    origin:'http://localhost:5173',
    credentials: true
}))


app.get('/', (req, res) => {
    res.send('Job Shop Server is Running');
});

app.listen(port, () => {
    console.log(`job Shop Server is Running on Port ${port}`);
});


// psazzadul1205
// 1jOikDWMHRkiebal