const express = require('express');
const router = express.Router();
const dbModel = require('../db/index');
const GeoJson = require('geojson');

// Used for clients to get data from bikes
let clients = []

// Used for having multiple bikes connected to server and waiting for instructions
let bikes = [];

// Cached bikedata
let cachedBikeData = {};
const CACHE_LIFETIME = 30 * 1000; // seconds * 1000 (ms)

router.put('/:id', async (req, res) => {
    const data = req.body;
    const bikeId = req.params.id;
    const asString = JSON.stringify(data.coords);

    // Check if there is any cached data for bike
    const cacheEntry = cachedBikeData[bikeId];
    // Will be true if no cached bike or cache is expired
    const isCacheExpired = !cacheEntry || (Date.now() - cacheEntry.timestamp > CACHE_LIFETIME);

    if (isCacheExpired) {
        // Cache is expired, update data in database
        const result = await dbModel.updateData(dbModel.queries.updateBike, [asString, data.charge_perc, data.status_id, bikeId])
        
        // Update cached with new timestamp
        cachedBikeData[bikeId] = { data: data, timestamp: Date.now() };
    }
    
    let response = {
        data: {
            msg: "all is good!"
        }
    }
    const jsonPoint = GeoJson.parse({
        lat: data.coords[0],
        lng: data.coords[1]
    },
    {
        Point: ['lat', 'lng']
    })
    // if (result.affectedRows == 0) {
    //     response.data = {
    //         errors: "all is NOT good"
    //     }
    // } else {
        // Send data to all connected clients
        const eventData = {
            id: bikeId,
            geoJSON: jsonPoint
        }
        // JSON.stringify(eventData)
        clients.forEach(client => {
            client.write(`data: ${JSON.stringify(eventData)}\n\n`);
        });
    // }

    res.json(response)
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

    // Add this client to the clients array
    bikes.push(res);

    // Handle client disconnection
    req.on('close', () => {
        bikes = bikes.filter(bikes => bikes !== res);
    });
})

router.get('/simulate', (req, res) => {
    const data = {
        instruction_all: "run_simulation"
    }
    bikes.forEach(bike => {
        bike.write(`data: ${JSON.stringify(data)}\n\n`);
    });
    res.send("OK")
})

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
})

router.put('/return/:id', async (req, res) => {
    const tripId = req.params.tripid;
    const bikeId = req.body.bike_id;
    const timestamp = Date.now();
    const date = new Date(timestamp);
    const formattedDate = date.toISOString().slice(0, 19).replace('T', ' ');
    const result = await dbModel.updateData(dbModel.queries.updateTrip, [formattedDate, tripId])

    let data = {
        bike_id: bikeId,
        instruction: 'lock_bike'
    }
    data = JSON.stringify(data);
    bikes.forEach(bike => {
        bike.write(`data: ${data}\n\n`);
    });

    res.json({
        trip_id: tripId,
    })
});

module.exports = router;
