const { meters } = require("../meters/meters");

const generateSingle = () => {
    const now = Math.floor(Date.now() / 1000); // Current time in seconds
    const startTime = now - (2 * 24 * 3600); // Start from 2 days ago
    const hour = 3600;
    const readingsLength = Math.ceil(Math.random() * 20) + 10; // Ensure we have at least 10 readings

    return [...new Array(readingsLength)].map((reading, index) => ({
        time: startTime - index * hour,
        reading: Math.random() * 2,
    }));
};

const generateAllMeters = () => {
    const readings = {};

    for (const key in meters) {
        if (meters.hasOwnProperty(key)) {
            readings[meters[key]] = generateSingle();
        }
    }

    return readings;
};

const readingsData = generateAllMeters();

module.exports = { readingsData };
