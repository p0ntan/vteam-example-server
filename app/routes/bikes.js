const express = require('express');
const router = express.Router();
const dbModel = require('../db/index');
const GeoJson = require('geojson');

// Used for clients to get data from bikes
let clients = []

// Cached bikedata
let cachedBikeData = {};
const CACHE_LIFETIME = 30 * 1000; // seconds * 1000 (ms)

router.put('/:id', async (req, res) => {
    const data = req.body;
    const bikeId = req.params.id;
    const asString = JSON.stringify(data.coords);
    // Check if there is any cached data for bike
    const cacheEntry = cachedBikeData[bikeId];

    // TODO add logic for when writing to database and when not to.
    // Cases when there is a cached object but no data (only res-object), time has expired or time has not expired.
    // There could be a cachedEntry initialzed by the /instructions route

    // Commented code below works for when all bike-clients is in an array, but not in an object

    // const isCacheExpired = !cacheEntry || (Date.now() - cacheEntry.timestamp > CACHE_LIFETIME);
    // if (isCacheExpired) {
        // Cache is expired, update data in database.
        let result = await dbModel.updateData(dbModel.queries.updateBike, [asString, data.charge_perc, data.status_id, bikeId])

        // Update cached with new timestamp
        cachedBikeData[bikeId] = {
            ...cachedBikeData[bikeId],
            data: data,
            timestamp: Date.now()
        };

    // } else {
    //     cachedBikeData[bikeId].data = data;
    // }

    const jsonPoint = GeoJson.parse({
        lng: data.coords[0],
        lat: data.coords[1]
    },
    {
        Point: ['lat', 'lng']
    })

    const eventData = {
        id: bikeId,
        geoJSON: jsonPoint
    }

    clients.forEach(client => {
        client.write(`data: ${JSON.stringify(eventData)}\n\n`);
    });

    res.json({
        data: {
            msg: "all is good!"
        }
    })
})

router.get('/feed', (req, res) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    // Add this client to the clients array
    clients.push(res);

    // Handle client disconnection
    req.on('close', () => {
        clients = clients.filter(client => client !== res);
    });
});

router.get('/instructions', (req, res) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    // Get bikeId from the headers
    const bikeId = req.headers.bike_id;

    cachedBikeData[bikeId] = {
        ...cachedBikeData[bikeId],
        res: res
    };

    // console.log("Öppnad för:", bikeId);

    // TODO maybe add some handling or something to check that a bike hasn't lost connection.
    // Not needed for things to work but will prevent having "hanging" clients.

    // Remove connection when closed
    res.on('close', () => {        
        // Remove res from bike object
        delete cachedBikeData[bikeId].res;

        console.log("Stängd för:", bikeId);

        // End the connection
        res.end();
    });
})

router.get('/simulate', (req, res) => {
    const data = {
        instruction_all: "run_simulation"
    }

    for (const [_, bike] of Object.entries(cachedBikeData)) {
        bike.res.write(`data: ${JSON.stringify(data)}\n\n`);
    }
    res.send("OK");
})

router.post('/rent/:bikeid', async (req, res) => {
    const bikeId = req.params.bikeid;
    const userId = req.body.id;
    const result = await dbModel.createData(dbModel.queries.rentBike, [bikeId, userId])
    const tripId = Number(result.insertId);

    let bikeData = cachedBikeData[bikeId];
    let data = {
        bike_id: parseInt(bikeId),
        instruction: 'set_status',
        args: [2]
    }

    data = JSON.stringify(data);

    // TODO write to database before each rent if position is used for starting route in database
    
    // await dbModel.updateData(dbModel.queries.updateBike,
    //     [  
    //         JSON.stringify(cachedBikeData[bikeId].data.coords),
    //         cachedBikeData[bikeId].data.charge_perc,
    //         2, 
    //         bikeId
    //     ])
    cachedBikeData[bikeId].res.write(`data: ${data}\n\n`);

    res.json({
        trip_id: tripId,
    })
})

router.put('/return/:tripid', async (req, res) => {
    const tripId = req.params.tripid;
    const bikeId = req.body.bike_id;
    const timestamp = Date.now();
    const date = new Date(timestamp);
    const formattedDate = date.toISOString().slice(0, 19).replace('T', ' ');
    const result = await dbModel.updateData(dbModel.queries.updateTrip, [formattedDate, tripId])
    let data = {
        bike_id: parseInt(bikeId),
        instruction: 'set_status',
        args: [1]
    }
    data = JSON.stringify(data);

    // TODO write to database before each return if position is used for starting route in database

    // await dbModel.updateData(dbModel.queries.updateBike,
    //     [  
    //         JSON.stringify(cachedBikeData[bikeId].data.coords),
    //         cachedBikeData[bikeId].data.charge_perc,
    //         cachedBikeData[bikeId].data.status_id, 
    //         bikeId
    //     ])
    cachedBikeData[bikeId].res.write(`data: ${data}\n\n`);

    res.json({
        trip_id: tripId,
    })
});

module.exports = router;
