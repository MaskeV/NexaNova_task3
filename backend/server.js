const express = require('express');
const connectDB = require('./src/config/database');

const app = express();
const PORT = 3000;

connectDB();

app.listen(PORT, ()=>{
    console.log(`Server running at port ${PORT}`);
})