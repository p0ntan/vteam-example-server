const express = require('express');
const app = express();
const port = 1337;
const cors = require('cors');
const router = require('./routes/index');

const corsOptions = {
    origin: true,
    credentials: true
};

app.use(cors(corsOptions));
app.use(express.json());

app.get('/', async (req, res) => {
    res.json({
        data: {
            msg: "Hello World! This is the root."
        }
    });
})
app.use("/v1/", router);

app.listen(port, console.log(`App is listening on ${port}`));
