const express = require('express');
const dotenv = require('dotenv').config();
const cookieParser = require('cookie-parser')
const mongoose = require('mongoose');


const app = express()

// mongodb connection

mongoose.connect(process.env.MONGODB_URL)
.then(() => 
   console.log("Database is Connected")
)
.catch((err) => 
    console.log("Database is not Connected", err)
)

//middleware

app.use(cookieParser())
app.use(express.urlencoded({extended : false}))
app.use(express.json())



const port = 8000;

app.use('/', require('./router/authRouter'))


app.listen(port, () => {
    console.log(`Server is running on port ${port}`)
})