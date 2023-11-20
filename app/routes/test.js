const express = require('express');
const router = express.Router();
const dbModel = require('../db/index');

router.get('/', async (req, res) => {
    res.json({
        data: {
            msg: "Hello World! This is the root."
        }
    });
})

router.get('/get', async (req, res) => {
    const result = await dbModel.getData(dbModel.queries.getBike)

    res.json(result)
})

module.exports = router;
