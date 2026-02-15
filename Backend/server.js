const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");


const app = express()

app.use(express.json());
app.use(cors());

dotenv.config();

const PORT = 9000 ; 

app.get("/", (req , res) => {
    res.send("Welcome to NatureVibes API ! ")
});

app.listen(PORT ,() => {
    console.log(`Server is listening on https://localhost:${PORT}`);
});