const { meters, meterPricePlanMap } = require("../meters/meters");
const { pricePlanNames, pricePlans } = require("../price-plans/price-plans");
const { readings } = require("../readings/readings");
const {
    average,
    timeElapsedInHours,
    usage,
    usageCost,
    usageForAllPricePlans,
    filterLastWeekReadings,
    weeklyUsageCost,
} = require("./usage");

describe("usage", () => {
    it("should average all readings for a meter", () => {
        const { getReadings } = readings({
            [meters.METER0]: [
                { time: 923874692387, reading: 0.26785 },
                { time: 923874692387, reading: 0.26785 },
                { time: 923874692387, reading: 0.26785 },
            ],
        });

        const averageMeter0 = average(getReadings(meters.METER0));

        expect(averageMeter0).toBe(0.26785);
    });

    it("should get time elapsed in hours for all readings for a meter", () => {
        const { getReadings } = readings({
            [meters.METER0]: [
                { time: 1607686135, reading: 0.26785 },
                { time: 1607599724, reading: 0.26785 },
                { time: 1607512024, reading: 0.26785 },
            ],
        });

        const timeElapsedMeter0 = timeElapsedInHours(
            getReadings(meters.METER0)
        );

        expect(timeElapsedMeter0).toBe(48);
    });

    it("should get usage for all readings for a meter", () => {
        const { getReadings } = readings({
            [meters.METER0]: [
                { time: 1607686125, reading: 0.26785 },
                { time: 1607599724, reading: 0.26785 },
                { time: 1607513324, reading: 0.26785 },
            ],
        });

        const usageMeter0 = usage(getReadings(meters.METER0));

        expect(usageMeter0).toBe(0.26785 / 48);
    });

    it("should get usage cost for all readings for a meter", () => {
        const { getReadings } = readings({
            [meters.METER2]: [
                { time: 1607686125, reading: 0.26785 },
                { time: 1607599724, reading: 0.26785 },
                { time: 1607513324, reading: 0.26785 },
            ],
        });

        const rate = meterPricePlanMap[meters.METER2].rate;
        const usageCostForMeter = usageCost(getReadings(meters.METER2), rate);

        expect(usageCostForMeter).toBe(0.26785 / 48 * 1);
    });

    it("should get usage cost for all readings for all price plans", () => {
        const { getReadings } = readings({
            [meters.METER2]: [
                { time: 1607686125, reading: 0.26785 },
                { time: 1607599724, reading: 0.26785 },
                { time: 1607513324, reading: 0.26785 },
            ],
        });

        const expected = [
            {
                [pricePlanNames.PRICEPLAN0]: 0.26785 / 48 * 10,
            },
            {
                [pricePlanNames.PRICEPLAN1]: 0.26785 / 48 * 2,
            },
            {
                [pricePlanNames.PRICEPLAN2]: 0.26785 / 48 * 1,
            },
        ];

        const usageForAllPricePlansArray = usageForAllPricePlans(
            pricePlans,
            getReadings(meters.METER2)
        );

        expect(usageForAllPricePlansArray).toEqual(expected);
    });
});

describe("Weekly Usage Cost Calculations", () => {
    describe("filterLastWeekReadings", () => {
        it("should filter readings from the last 7 days", () => {
            const now = Math.floor(Date.now() / 1000);
            const readings = [
                { time: now - (2 * 24 * 3600), reading: 1.0 }, // 2 days ago - should include
                { time: now - (5 * 24 * 3600), reading: 1.5 }, // 5 days ago - should include
                { time: now - (8 * 24 * 3600), reading: 2.0 }, // 8 days ago - should exclude
                { time: now - (10 * 24 * 3600), reading: 2.5 }, // 10 days ago - should exclude
            ];

            const filtered = filterLastWeekReadings(readings);
            
            expect(filtered).toHaveLength(2);
            expect(filtered[0].reading).toBe(1.0);
            expect(filtered[1].reading).toBe(1.5);
        });

        it("should return empty array if no readings within last week", () => {
            const now = Math.floor(Date.now() / 1000);
            const readings = [
                { time: now - (10 * 24 * 3600), reading: 1.0 }, // 10 days ago
                { time: now - (15 * 24 * 3600), reading: 1.5 }, // 15 days ago
            ];

            const filtered = filterLastWeekReadings(readings);
            
            expect(filtered).toHaveLength(0);
        });

        it("should handle empty readings array", () => {
            const filtered = filterLastWeekReadings([]);
            expect(filtered).toHaveLength(0);
        });
    });

    describe("weeklyUsageCost - Correct Implementation", () => {
        it("should calculate cost based on actual time duration", () => {
            const now = Math.floor(Date.now() / 1000);
            
            // Scenario: 3 readings over 2 hours
            const readings = [
                { time: now - 7200, reading: 1.0 }, // 2 hours ago
                { time: now - 3600, reading: 1.2 }, // 1 hour ago  
                { time: now, reading: 0.8 }         // now
            ];
            
            const rate = 0.1; // $0.1 per kWh
            
            // Correct calculation:
            // Average = (1.0 + 1.2 + 0.8) / 3 = 1.0 kW
            // Actual time duration = 2 hours (from first to last reading)
            // Energy = 1.0 kW * 2 hours = 2 kWh
            // Cost = 2 kWh * $0.1 = $0.2
            
            const cost = weeklyUsageCost(readings, rate);
            expect(cost).toBeCloseTo(0.2, 2);
        });

        it("should calculate cost for realistic 24-hour scenario", () => {
            const now = Math.floor(Date.now() / 1000);
            
            // Scenario: readings over 24 hours with 1kW average
            const readings = [
                { time: now - (24 * 3600), reading: 1.0 }, // 24 hours ago
                { time: now - (12 * 3600), reading: 1.0 }, // 12 hours ago
                { time: now, reading: 1.0 }                // now
            ];
            
            const rate = 1; // $1 per kWh
            
            // Expected: 1kW average * 24 hours * $1/kWh = $24
            const cost = weeklyUsageCost(readings, rate);
            expect(cost).toBeCloseTo(24, 1);
        });

        it("should handle varying power consumption", () => {
            const now = Math.floor(Date.now() / 1000);
            
            // Scenario: varying consumption over 4 hours
            const readings = [
                { time: now - (4 * 3600), reading: 0.5 }, // 4 hours ago
                { time: now - (3 * 3600), reading: 1.0 }, // 3 hours ago
                { time: now - (2 * 3600), reading: 1.5 }, // 2 hours ago
                { time: now - (1 * 3600), reading: 2.0 }, // 1 hour ago
                { time: now, reading: 1.0 }               // now
            ];
            
            const rate = 0.5; // $0.5 per kWh
            
            // Average = (0.5 + 1.0 + 1.5 + 2.0 + 1.0) / 5 = 1.2 kW
            // Time = 4 hours
            // Energy = 1.2 * 4 = 4.8 kWh
            // Cost = 4.8 * 0.5 = $2.4
            
            const cost = weeklyUsageCost(readings, rate);
            expect(cost).toBeCloseTo(2.4, 1);
        });
    });

    describe("Edge Cases", () => {
        it("should return 0 cost for empty readings", () => {
            const cost = weeklyUsageCost([], 0.1);
            expect(cost).toBe(0);
        });

        it("should return 0 cost for single reading", () => {
            const now = Math.floor(Date.now() / 1000);
            const readings = [{ time: now, reading: 1.0 }];
            
            const cost = weeklyUsageCost(readings, 0.1);
            // Single reading means no time elapsed, so cost should be 0
            expect(cost).toBe(0);
        });

        it("should handle readings with zero values", () => {
            const now = Math.floor(Date.now() / 1000);
            const readings = [
                { time: now - 3600, reading: 0 },
                { time: now, reading: 0 }
            ];
            
            const cost = weeklyUsageCost(readings, 0.1);
            expect(cost).toBe(0);
        });
    });
});
