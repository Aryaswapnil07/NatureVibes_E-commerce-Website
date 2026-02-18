const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db.js")   // IMPORTING DB.JS
const userRoutes = require("./routes/userRoutes.js") // importing userRoutes.js 

const app = express()

app.use(express.json());
app.use(cors());

dotenv.config();

//  CONNECTNG TO MONGODB DATABASE 

// CALLING CONNECTDB() FUNCTION 

connectDB()

const PORT = process.env.PORT || 3000 ; 

app.get("/", (req , res) => {
    res.send("Welcome to NatureVibes API ! ")
});

//  API ROUTES IS HERE 

app.use("/api/users", userRoutes) ;


app.listen(PORT ,() => {
    console.log(`Server is listening on https://localhost:${PORT}`);
});