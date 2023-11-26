const express = require('express');
const router = express.Router();
const dbModel = require('../db/index');
const GeoJson = require('geojson');

// Used for clients to get data from bikes
let clients = []

// Used for having multiple bikes connected to server and waiting for instructions
let bikes = [];

router.post('/', async (req, res) => {
    const data = req.body;

    const jsonPoint = GeoJson.parse({
        lat: data.position[0],
        lng: data.position[1]
    },
    {
        Point: ['lat', 'lng']
    })
    const asString = JSON.stringify(data.position);
    const result = await dbModel.updateData(dbModel.queries.updateBike, [asString, data.id])
    let response = {
        data: {
            msg: "all is good!"
        }
    }

    if (result.affectedRows == 0) {
        response.data = {
            errors: "all is NOT good"
        }
    } else {
        // Send data to all connected clients
        const eventData = {
            id: data.id,
            geoJSON: jsonPoint
        }
        // JSON.stringify(eventData)
        clients.forEach(client => {
            client.write(`data: ${JSON.stringify(eventData)}\n\n`);
        });
    }

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
        msg: "start_simulation"
    }
    bikes.forEach(bike => {
        bike.write(`data: ${JSON.stringify(data)}\n\n`);
    });
    res.send("OK")
})

router.get('/rent/:id', (req, res) => {
    const id = req.params.id;

    // Send data to all connected clients
    const eventData = {
        id: id,
        geoJSON: "test bara"
    }
    // JSON.stringify(eventData)
    bikes.forEach(bike => {
        bike.write(`data: ${JSON.stringify(eventData)}\n\n`);
    });

    res.json(req.body)
})


module.exports = router;