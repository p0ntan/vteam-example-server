const express = require('express');
const router = express.Router();
const dbModel = require('../db/index');
const bikes = require('./bikes').bikes;

router.post('/rent/:bikeid', async (req, res) => {
    const bikeId = req.params.bikeid;
    const userId = req.body.id;
    const result = await dbModel.createData(dbModel.queries.rentBike, [bikeId, userId])
    const tripId = Number(result.insertId);

    let data = {
        bike_id: bikeId,
        instruction: 'unlock_bike'
    }
    data = JSON.stringify(data);
    bikes.forEach(bike => {
        bike.write(`data: ${data}\n\n`);
    });

    res.json({
        trip_id: tripId,
    })
});

router.put('/return/:tripid', async (req, res) => {
    const tripId = req.params.tripid;
    const timestamp = Date.now();
    const date = new Date(timestamp);
    const formattedDate = date.toISOString().slice(0, 19).replace('T', ' ');
    const result = await dbModel.updateData(dbModel.queries.updateTrip, [formattedDate, tripId])

    res.json({
        'msg': "ok"
    })
})

module.exports = router;
