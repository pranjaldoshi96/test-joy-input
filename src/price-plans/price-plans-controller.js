const { pricePlans } = require("./price-plans");
const { usageForAllPricePlans, weeklyUsageCost } = require("../usage/usage");
const { meterPricePlanMap } = require("../meters/meters");

const recommend = (getReadings, req) => {
    const meter = req.params.smartMeterId;
    const pricePlanComparisons = usageForAllPricePlans(pricePlans, getReadings(meter)).sort((a, b) => extractCost(a) - extractCost(b))
    if("limit" in req.query) {
        return pricePlanComparisons.slice(0, req.query.limit);
    }
    return pricePlanComparisons;
};

const extractCost = (cost) => {
    const [, value] = Object.entries(cost).find( ([key]) => key in pricePlans)
    return value
}

const compare = (getData, req) => {
    const meter = req.params.smartMeterId;
    const pricePlanComparisons = usageForAllPricePlans(pricePlans, getData(meter));
    return {
        smartMeterId: req.params.smartMeterId,
        pricePlanComparisons,
    };
};

const weeklyUsage = (getReadings, req) => {
    const smartMeterId = req.params.smartMeterId;
    
    // Check if meter has a price plan
    const pricePlan = meterPricePlanMap[smartMeterId];
    if (!pricePlan) {
        return {
            error: `Smart meter ${smartMeterId} does not have a price plan attached. Please contact customer service to set up a price plan.`,
            smartMeterId: smartMeterId
        };
    }
    
    // Get readings for the meter
    const readings = getReadings(smartMeterId);
    if (!readings || readings.length === 0) {
        return {
            error: `No usage data found for smart meter ${smartMeterId}.`,
            smartMeterId: smartMeterId
        };
    }
    
    // Calculate weekly usage cost
    const weeklyCost = weeklyUsageCost(readings, pricePlan.rate);
    
    return {
        smartMeterId: smartMeterId,
        supplier: pricePlan.supplier,
        rate: pricePlan.rate,
        weeklyUsageCost: weeklyCost,
        period: "Last 7 days"
    };
};

module.exports = { recommend, compare, weeklyUsage };
