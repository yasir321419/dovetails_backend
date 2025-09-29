require("dotenv").config();
const express = require('express');
const cors = require("cors");
const bodyParser = require("body-parser");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 5000;
const API_PRIFEX = process.env.API_PRIFEX || '/api/v1';  // Prefix for all routes
// const rootRouter = require("./routes/index");

const morgan = require('morgan');
const globalErrorMiddleware = require("./middleware/globalMiddleware");
const dbConnect = require("./db/connectivity");
const adminSeed = require("./seeder/adminSeed");


app.use(morgan('dev'));

app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

app.use(cors());
app.use('/public', express.static('public'));


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


// app.use(API_PRIFEX, rootRouter);

app.use(globalErrorMiddleware);


dbConnect();

adminSeed();

app.get("/", (req, res) => {
  res.send("server is running.....!!!!!");
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});