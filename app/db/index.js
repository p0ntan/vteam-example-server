const mariadb = require('mariadb');

const pool = mariadb.createPool({
    host: 'mariadb',
    user: 'root',
    database: 'test',
    // connectionLimit: 5
});

const rentBike = "INSERT INTO trip (bike_id, user_id) VALUES (?, ?)"
const updateBike = "UPDATE bike SET coords = ?, charge_perc = ?, status_id = ? WHERE id = ?;"
const updateTrip = "UPDATE trip SET end_time = ? WHERE id = ?;"
const getBike = "SELECT * FROM bike;"

async function getData(sqlQuery, args=[]) {
    let conn;

    try {
        conn = await pool.getConnection();
        const res = await conn.query(sqlQuery, args);

        return res;
  
    } catch (err) {
        throw err;
    } finally {
        if (conn) conn.end();
    }
}

async function updateData(sqlQuery, args=[]) {
    let conn;

    try {
        conn = await pool.getConnection();
        const res = await conn.query(sqlQuery, args);

        return res;
  
    } catch (err) {
        throw err;
    } finally {
        if (conn) conn.end();
    }
}

async function createData(sqlQuery, args=[]) {
    let conn;

    try {
        conn = await pool.getConnection();
        const res = await conn.query(sqlQuery, args);

        return res;
  
    } catch (err) {
        throw err;
    } finally {
        if (conn) conn.end();
    }
}

module.exports = {
    getData,
    updateData,
    createData,
    queries: {
        getBike,
        updateBike,
        rentBike,
        updateTrip
    }
}
