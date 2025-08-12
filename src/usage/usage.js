const average = (readings) => {
    return (
        readings.reduce((prev, next) => prev + next.reading, 0) /
        readings.length
    );
};

const timeElapsedInHours = (readings) => {
    readings.sort((a, b) => a.time - b.time);
    const seconds = readings[readings.length - 1].time - readings[0].time;
    const hours = Math.floor(seconds / 3600);
    return hours;
};

const usage = (readings) => {
    return average(readings) / timeElapsedInHours(readings);
};

const usageCost = (readings, rate) => {
    return usage(readings) * rate;
};

const usageForAllPricePlans = (pricePlans, readings) => {
    return Object.entries(pricePlans).map(([key, value]) => {
        return {
            [key]: usageCost(readings, value.rate),
        };
    });
};

// Filter readings for the last 7 days (168 hours)
const filterLastWeekReadings = (readings) => {
    const now = Math.floor(Date.now() / 1000); // Current time in seconds
    const oneWeekAgo = now - (7 * 24 * 3600); // 7 days ago in seconds
    
    return readings.filter(reading => reading.time >= oneWeekAgo);
};

// Calculate weekly usage cost according to the specified formula
const weeklyUsageCost = (readings, rate) => {
    const weeklyReadings = filterLastWeekReadings(readings);
    
    if (weeklyReadings.length <= 1) {
        return 0; // Need at least 2 readings to calculate time duration
    }
    
    // Average reading in KW = (er1.reading + er2.reading + ..... erN.Reading)/N
    const averageReadingKW = average(weeklyReadings);
    
    // Usage time in hours = ACTUAL duration of the readings (not fixed 168 hours)
    const usageTimeHours = timeElapsedInHours(weeklyReadings);
    
    // Energy consumed in kWh = average reading * actual usage time
    const energyConsumedKWh = averageReadingKW * usageTimeHours;
    
    // Cost = tariff unit prices(rate) * energy consumed
    const cost = rate * energyConsumedKWh;
    
    return cost;
};

module.exports = {
    average,
    timeElapsedInHours,
    usage,
    usageCost,
    usageForAllPricePlans,
    filterLastWeekReadings,
    weeklyUsageCost,
};
