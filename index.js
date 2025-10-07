const express = require('express');
const cors = require("cors");
const bodyParser = require("body-parser");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 3000;
const API_PRIFEX = process.env.API_PRIFEX || '/api/v1';  // Prefix for all routes
const rootRouter = require("./routes/index");
const globalErrorMiddleware = require("./middleware/globalMiddleware");
const dbConnect = require('./db/connectivity');
const adminSeed = require('./seeder/adminSeed');

const morgan = require('morgan');


app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

app.use(cors());
app.use('/public', express.static('public'));





app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


app.use(API_PRIFEX, rootRouter);

console.log(API_PRIFEX);
console.log(port);



app.get("/", (req, res) => {
  res.send("server is running.....!!!!!!!");
});

app.get("/health", (req, res) => {
  console.log("Health check triggered");
  res.status(200).send("OK");
});

dbConnect();

adminSeed();

// Global error handling
app.use(globalErrorMiddleware);




app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});

