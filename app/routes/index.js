const express = require('express');
const router = express.Router();
const bikesRouter = require('./bikes');
const testRoutes = require('./test');

router.use('/', testRoutes);
router.use('/bikes', bikesRouter);

module.exports = router;
