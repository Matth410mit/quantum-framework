
function exponentialRegression(x, y) {
    let n = x.length;
    let sumX = 0, sumLogY = 0, sumXLogY = 0, sumXX = 0;
    for (let i = 0; i < n; i++) {
        // Compute sums for the regression, taking log of y values
        sumX += x[i];
        sumLogY += Math.log(y[i]);
        sumXLogY += x[i] * Math.log(y[i]);
        sumXX += x[i] * x[i];
    }
    let b = (n * sumXLogY - sumX * sumLogY) / (n * sumXX - sumX * sumX);
    let a = (sumLogY - b * sumX) / n;

    // Convert 'a' back to the original scale
    a = Math.exp(a);

    return { a, b }; // Returns the coefficients of y = ae^(bx)
}

function exponentialInterpolation(xValues, yValues, x) {
    let i = 0;
    // Find the interval [x[i], x[i+1]] where the value x lies
    for (; i < xValues.length - 1; i++) {
        if (x <= xValues[i + 1]) break;
    }

    let x1 = xValues[i], y1 = yValues[i];
    let x2 = xValues[i + 1], y2 = yValues[i + 1];

    // Compute the logarithms of y1 and y2 for the interpolation in log-space
    let logY1 = Math.log(y1);
    let logY2 = Math.log(y2);

    // Perform linear interpolation in log-space
    let logY = logY1 + (logY2 - logY1) * (x - x1) / (x2 - x1);

    // Convert the interpolated value back to the original scale
    return Math.exp(logY);
}

function getQuantumFeasible(year, roadmap, physicalLogicalQubitsRatio = 1000) {
    year = parseFloat(year);
    let years = Object.keys(roadmap).map(Number);
    let qubits = Object.values(roadmap).map( x => Math.log10(x))

    let numberOfPhysicalQubits;
    if (roadmap.hasOwnProperty(year)) {
        numberOfPhysicalQubits = Math.log10(roadmap[year])
    } else if (year > Math.max(...years)) {
        // Simplified linear regression for years > 2024
        let regression = exponentialRegression(years.filter(y => y >= 2024), qubits.filter((_, index) => years[index] >= 2024));
        console.log(regression)
        numberOfPhysicalQubits = regression.a * Math.exp(regression.b * year);

    } else {
        numberOfPhysicalQubits = exponentialInterpolation(years, qubits, year)

    }
    console.log(numberOfPhysicalQubits)
    let problemSize = (numberOfPhysicalQubits  + Math.log10(Math.log10(2)) - Math.log10(physicalLogicalQubitsRatio))
    return 10**problemSize;
}

let roadmap = {
    2021: 127,
    2022: 433,
    2023: 1121,
    2024: 1386,
    2025: 4158,
    2033: 100000
}

let year = 2033;

console.log(getQuantumFeasible(year, roadmap))

console.log(10**(5  + Math.log10(Math.log10(2)) - Math.log10(1000)))


