## JOI Energy API - Complete Project Overview

### **What is JOI Energy?**
JOI Energy is a startup that helps customers find the best energy supplier by:
1. Collecting smart meter data from customers
2. Analyzing their energy usage patterns
3. Recommending the cheapest energy suppliers based on their consumption

### **Project Structure & Flow**

#### **1. Application Entry Point (`src/app.js`)**
- Sets up an Express.js web server on port 8080
- Defines 4 main API endpoints:
  - `GET /readings/read/:smartMeterId` - Get stored readings
  - `POST /readings/store` - Store new readings
  - `GET /price-plans/recommend/:smartMeterId` - Get recommended plans
  - `GET /price-plans/compare-all/:smartMeterId` - Compare all plans

#### **2. Smart Meters & Users (`src/meters/meters.js`)**
- Defines 5 smart meters: `smart-meter-0` through `smart-meter-4`
- Maps each meter to a current price plan:
  - Sarah (`smart-meter-0`) → Dr Evil's Dark Energy (expensive)
  - Peter (`smart-meter-1`) → Power for Everyone (medium)
  - Charlie (`smart-meter-2`) → The Green Eco (cheap)
  - Andrea & Alex (`smart-meter-3`, `smart-meter-4`) → No current plan

#### **3. Energy Readings System**

**Data Storage (`src/readings/readings.data.js`)**:
- Generates random sample data for all 5 meters
- Each reading has a timestamp and power consumption in kW
- Creates 1-20 hourly readings per meter going back in time

**Data Management (`src/readings/readings.js`)**:
- Provides `getReadings(meterId)` - retrieves readings for a meter
- Provides `setReadings(meterId, readings)` - adds new readings to existing data

**API Controllers (`src/readings/readings-controller.js`)**:
- `read()` - handles GET requests to retrieve readings
- `store()` - handles POST requests to add new readings

#### **4. Price Plans System (`src/price-plans/price-plans.js`)**
Three energy suppliers with different rates:
- **Dr Evil's Dark Energy**: 10 units/kWh (most expensive)
- **Power for Everyone**: 2 units/kWh (medium price)
- **The Green Eco**: 1 unit/kWh (cheapest)

#### **5. Usage Calculation Engine (`src/usage/usage.js`)**
This is the core business logic:

**Key Functions**:
- `average(readings)` - calculates average power consumption
- `timeElapsedInHours(readings)` - calculates time span of readings
- `usage(readings)` - calculates kWh consumption rate
- `usageCost(readings, rate)` - calculates cost for a specific rate
- `usageForAllPricePlans()` - calculates costs across all suppliers

**The Math**:
```
Usage Rate = Average Power (kW) ÷ Time Elapsed (hours)
Cost = Usage Rate × Supplier Rate
```

#### **6. Price Plan Controllers (`src/price-plans/price-plans-controller.js`)**

**`recommend()` endpoint**:
- Calculates costs for all 3 suppliers
- Sorts from cheapest to most expensive
- Optionally limits results with `?limit=N` parameter
- Returns array of `{supplier: cost}` objects

**`compare()` endpoint**:
- Shows current meter ID and costs for all suppliers
- Returns structured object with `smartMeterId` and `pricePlanComparisons`

### **Step-by-Step API Flow Example**

Let's trace what happens when someone calls `/price-plans/recommend/smart-meter-0`:

1. **Request arrives** at Express server
2. **Route handler** calls `recommend(getReadings, req)`
3. **Get readings** for `smart-meter-0` from stored data
4. **Calculate usage** using the readings:
   - Find average power consumption
   - Calculate time span
   - Compute usage rate (kWh)
5. **Calculate costs** for each supplier:
   - Dr Evil's: usage × 10
   - Power for Everyone: usage × 2  
   - The Green Eco: usage × 1
6. **Sort by cost** (cheapest first)
7. **Apply limit** if specified in query
8. **Return results** as JSON array

### **Real-World Business Value**

This system helps customers by:
- **Collecting** their actual energy usage data
- **Analyzing** their consumption patterns
- **Comparing** costs across all available suppliers
- **Recommending** the cheapest option for their specific usage
- **Providing** transparency in energy pricing

The API enables JOI Energy to differentiate from traditional energy companies by being a neutral advisor rather than a supplier, helping customers save money on their energy bills.