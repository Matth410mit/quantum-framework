import * as utils from "/Users/fred/Desktop/FutureTech/quantum-framework/src/store/utils.js"
import * as math from 'mathjs';

const currentYear = new Date().getFullYear();

let problems = [
    {
        problemName: "Integer Factorization",
        classicalRuntimeInput: "e^((64/9 * n)^(1/3) * log(n, e)^(2/3)) / p",
        classicalWork: "e^((64/9 * n)^(1/3) * log(n, e)^(2/3))",
        quantumRuntimeInput: "n^(2) * log(n, e)",
        quantumWork: "n^(2) * log(n, e) * q",
        qubitToProblemSize: "{q}",
    },
    {
        problemName: "Database Search",
        classicalRuntimeInput: "n / p",
        classicalWork: "n",
        quantumRuntimeInput: "sqrt(n)",
        quantumWork: "sqrt(n) * q",
        qubitToProblemSize: "2^{q}",
    },
    {
        problemName: "Traveling Salesman",
        classicalRuntimeInput: "n^3 * 2^n / p",
        classicalWork: "n^3 * 2^n",
        quantumRuntimeInput: "n * 1.78^n",
        quantumWork: "n * 1.78^n * q",
        qubitToProblemSize: "{q}",
    },
];

let hardware = [
    {
        category: "Established builders",
        hardwareName: "IBM (Superconducting)",
        penaltyInput: "sqrt(q)",
        processors: 5,
        hardwareSlowdown: 3.78,
        costFactor: 8,
        quantumImprovementRate: -10,
        costImprovementRate: -10,
        physicalLogicalQubitsRatio: 264,
        ratioImprovementRate: -23,
        roadmap: {
            2020: 27,
            2022: 127,
            2024: 133,
            2025: 156,
            // 2029: 200,
            // 2033: 2000,
            2029: 22974,
            2033: 100000,
        },
        roadmapUnit: "physical",
        extrapolationType: "exponential",
        advancedSlowdown: {
            gateTime: 12,
            cpuGHz: 5,
            speed: 60,
            gateOverhead: 100,
            algorithmConstant: 1,
        },
    },
    {
        hardwareName: "IonQ (Trapped Ion)",
        penaltyInput: "1",
        processors: 5,
        hardwareSlowdown: 8.48,
        costFactor: 8,
        quantumImprovementRate: -10,
        costImprovementRate: -10,
        physicalLogicalQubitsRatio: 32,
        // ratioImprovementRate: -10,
        ratioImprovementRate: -23,
        roadmap: {
            2021: 22,
            2022: 25,
            2023: 29,
            2024: 35,

            2025: 1024,
            2026: 4096,
            2027: 12288,
            2028: 32768,
        },
        roadmapUnit: "physical",
        extrapolationType: "exponential",
        advancedSlowdown: {
            gateTime: 600000,
            cpuGHz: 5,
            speed: 3000000,
            gateOverhead: 100,
            algorithmConstant: 1,
        },
    },
    {
        hardwareName: "QuEra (Neutral Atom)",
        penaltyInput: "1",
        processors: 5,
        hardwareSlowdown: 5.1,
        costFactor: 8,
        quantumImprovementRate: -10,
        costImprovementRate: -10,
        physicalLogicalQubitsRatio: 100,
        ratioImprovementRate: -23,
        roadmap: {
            2023: 256,
            2025: 3000,
            2026: 10000,
        },
        roadmapUnit: "physical",
        extrapolationType: "exponential",
        advancedSlowdown: {
            gateTime: 250,
            cpuGHz: 5,
            speed: 1250,
            gateOverhead: 100,
            algorithmConstant: 1,
        },
        reference: "https://www.quera.com/qec",
    },
]

// returns log_10 of the problem size where qa is reached
// processors only apply if the variable p is used in the classical function
function getQuantumAdvantage(logClassicalFunction, logQuantumFunction, logPenaltyFunction, hardwareSlowdown, quantumImprovementRate, processors, costImprovementRate, year) {
    let adjustmentFactor = Number(hardwareSlowdown) + (year - currentYear) * Math.log10(quantumImprovementRate);

    if (adjustmentFactor == null || isNaN(adjustmentFactor)) {
        console.log("Adjustment factor is null or NaN");
        console.log(`adjustment factor: ${adjustmentFactor}, hardwareSlowdown: ${hardwareSlowdown}, quantumImprovementRate: ${quantumImprovementRate}, year: ${year}`);
        return 0;
    }

    adjustmentFactor = math.max(adjustmentFactor, 0);

    // console.log("processors: ", processors);
    let effectiveProcessors = processors + (year - currentYear) * Math.log10(costImprovementRate);
    effectiveProcessors = math.max(effectiveProcessors, 0);

    function evaluate(n) {
        let scope = {n: n, p: Math.pow(10, effectiveProcessors)};
        let value = logClassicalFunction(n, scope) - logQuantumFunction(n) - logPenaltyFunction(n) - adjustmentFactor;
        return value;
    }

    let upperBound = 10**100;
    let lowerBound = 2;
    let lastValue = evaluate(lowerBound);
    // console.log("lastValue: " + lastValue);
    while (lowerBound < 100 && lastValue >= 0) {
        lowerBound += 0.25;
        let nextValue = evaluate(lowerBound);

        lastValue = nextValue;
    }
    // console.log("lowerBound: " + lowerBound);
    let result = utils.bisectionMethod(evaluate, lowerBound, upperBound, "QA bisection");

    if (result === null) {
        console.log(`null returned!!!! year was ${year} and adjustmentFactor was ${adjustmentFactor}`);
        console.log("lowerBound:", lowerBound, "upperBound:", upperBound);
        console.log("f(lowerBound):", evaluate(lowerBound), "f(upperBound):", evaluate(upperBound));
        return null;
    }
    else if (result == 0) {
        return 0;
    }
    else if (result == Infinity) {
        return Infinity;
    }
    

    // if (lowerBound > 2) {
    //     console.log(`Final lowerBound guess was ${lowerBound}`);
    // }

    return Math.log10(result);
}

// converts expression with q (qubits) to expression with n (problem size) by using the inverse of 
// the function specified by qubitToProblemSize parameter
function convertQubits(model, expression) {
    let replacement = "";
    if (model.qubitToProblemSize === "2^{q}") {
        replacement = "(log(n, 2))";
    }
    else if (model.qubitToProblemSize === "log({q})") {
        replacement = "(2^n)";
    }
    else if (model.qubitToProblemSize === "{q}") {
        replacement = "n";
    }
    else {
        console.log("this should never print");
    }

    let newExpression = utils.replaceVariable(expression, "q", replacement);

    return newExpression;
}

//returns the log_10 of the amount of logical qubits available with the given parameters
function getLogicalQubits(year, roadmap, physicalLogicalQubitsRatio, ratioImprovementRate , roadmapUnit) {
    const logOfPhysicalQubits = utils.getPhysicalQubits(year, roadmap, "exponential");
    if (roadmapUnit === "logical") {
        return logOfPhysicalQubits
    }

    //log_10 of the PLQR including the ratio improvement rate
    let adjustedPLQR = Math.log10(physicalLogicalQubitsRatio) + (year - currentYear) * Math.log10(ratioImprovementRate);
    const minimumPLQR = Math.log10(3); //minimum PLQR is 3
    adjustedPLQR = Math.max(adjustedPLQR, minimumPLQR);

    //logLogicalQubits has the log_10 of the number of logical qubits
    let logLogicalQubits = logOfPhysicalQubits - adjustedPLQR

    return logLogicalQubits
}


//function returns the log of the problem size solvable, even though there is a "10 ** problemSize"
function getQuantumFeasible(year, roadmap, physicalLogicalQubitsRatio, ratioImprovementRate, qubitToProblemSize, roadmapUnit) {
    //logLogicalQubits has the log_10 of the true number of logical qubits
    let logLogicalQubits = getLogicalQubits(year, roadmap, physicalLogicalQubitsRatio, ratioImprovementRate , roadmapUnit)
    // console.log("logLogicalQubits: " + logLogicalQubits);

    if (qubitToProblemSize == "2^{q}") {
        // let problemSize = (logOfPhysicalQubits + Math.log10(Math.log10(2)) - Math.log10(physicalLogicalQubitsRatio))
        let problemSize = (logLogicalQubits + Math.log10(Math.log10(2)))
        return 10 ** problemSize;
    }
    else if (qubitToProblemSize == "2^(2^{q})") {
        // let problemSize = Math.pow(2, Math.pow(10, logOfPhysicalQubits) / physicalLogicalQubitsRatio) * Math.log10(2)
        let problemSize = Math.pow(2, Math.pow(10, logLogicalQubits)) * Math.log10(2)
        return problemSize;
    }
    else if (qubitToProblemSize == "{q}") {
        // let problemSize = logOfPhysicalQubits -  Math.log10(physicalLogicalQubitsRatio)
        let problemSize = logLogicalQubits
        return problemSize;
    }
    else if (qubitToProblemSize == "log({q})") {
        // let problemSize = Math.log10(logOfPhysicalQubits - Math.log10(physicalLogicalQubitsRatio)) - Math.log10(Math.log10(2))
        let problemSize = Math.log10(logLogicalQubits) - Math.log10(Math.log10(2))

        //true if logLogicalQubits is negative
        //(Amount of physical qubits is less than the ratio to achieve a single logical qubit)
        if (isNaN(problemSize)) {
            return 0;
        }

        return problemSize;
    }
    else {
        console.log("this should never print");
        return 0;
    }

}

function calculateQuantumEconomicAdvantage(model) {
    let hardwareSlowdown = model.hardwareSlowdown;
    let physicalLogicalQubitsRatio = model.physicalLogicalQubitsRatio;
    let ratioImprovementRate = utils.percentageToFraction(Number(model.ratioImprovementRate));
    let quantumImprovementRate = utils.percentageToFraction(Number(model.quantumImprovementRate));
    let qubitToProblemSize = model.qubitToProblemSize;
    let roadmapUnit = model.roadmapUnit;

    let classicalRuntimeInput = model.classicalRuntimeInput;
    let quantumRuntimeInput = model.quantumRuntimeInput;
    let penaltyInput = convertQubits(model, model.penaltyInput);


    //lcf = logged classical function
    let lcf = utils.createLoggedFunction(classicalRuntimeInput);
    let lqf = utils.createLoggedFunction(quantumRuntimeInput);
    let lpf = utils.createLoggedFunction(penaltyInput);
    
    //lcfc = logged classical function cost
    // let lcfc = utils.createLoggedFunction(model.classicalWork);
    // let lqfc = utils.createLoggedFunction(convertQubits(model, model.quantumWork));
    

    // let costFactor = (Number(model.costFactor))
    let costImprovementRate = utils.percentageToFraction(Number(model.costImprovementRate));

    let processors = model.processors;

    function qf(roadmap) {
        return year => getQuantumFeasible(year, roadmap, physicalLogicalQubitsRatio, ratioImprovementRate, qubitToProblemSize, roadmapUnit)
    }

    function qa(logClassicalFunction, logQuantumFunction, logPenaltyFunction, hardwareSlowdown, quantumImprovementRate) {
        //should probably be refactored eventually
        return year => getQuantumAdvantage(logClassicalFunction, logQuantumFunction, logPenaltyFunction, hardwareSlowdown, quantumImprovementRate, processors, costImprovementRate, year)
    }


    let quantumFeasible = qf(model.roadmap);
    
    let quantumAdvantage = qa(lcf, lqf, lpf, hardwareSlowdown, quantumImprovementRate);
    // let quantumCostAdvantage = qa(lcfc, lqfc, lpf, costFactor, costImprovementRate);


    const tStar = utils.bisectionMethod(year => quantumFeasible(year) - quantumAdvantage(year), currentYear, 3000, "tStar in QEA");
    // const tCostStar = utils.bisectionMethod(year => quantumFeasible(year) - quantumCostAdvantage(year), currentYear, 3000, "tCostStar in QEA");

    return [tStar, quantumFeasible(tStar)];
}

function forcedAdvantage(model) {
    let hardwareSlowdown = model.hardwareSlowdown;
    let physicalLogicalQubitsRatio = model.physicalLogicalQubitsRatio;
    let ratioImprovementRate = utils.percentageToFraction(Number(model.ratioImprovementRate));
    let quantumImprovementRate = utils.percentageToFraction(Number(model.quantumImprovementRate));
    let qubitToProblemSize = model.qubitToProblemSize;
    let roadmapUnit = model.roadmapUnit;

    let classicalRuntimeInput = model.classicalRuntimeInput;
    let quantumRuntimeInput = model.quantumRuntimeInput;
    let penaltyInput = convertQubits(model, model.penaltyInput);


    //lcf = logged classical function
    let lcf = utils.createLoggedFunction(classicalRuntimeInput);
    let lqf = utils.createLoggedFunction(quantumRuntimeInput);
    let lpf = utils.createLoggedFunction(penaltyInput);
    
    //lcfc = logged classical function cost
    let lcfc = utils.createLoggedFunction(model.classicalWork);
    let lqfc = utils.createLoggedFunction(convertQubits(model, model.quantumWork));
    

    let costFactor = (Number(model.costFactor))
    let costImprovementRate = utils.percentageToFraction(Number(model.costImprovementRate));

    let processors = model.processors;

    function qf(roadmap) {
        return year => getQuantumFeasible(year, roadmap, physicalLogicalQubitsRatio, ratioImprovementRate, qubitToProblemSize, roadmapUnit)
    }

    function qa(logClassicalFunction, logQuantumFunction, logPenaltyFunction, hardwareSlowdown, quantumImprovementRate) {
        //should probably be refactored eventually
        return year => getQuantumAdvantage(logClassicalFunction, logQuantumFunction, logPenaltyFunction, hardwareSlowdown, quantumImprovementRate, processors, costImprovementRate, year)
    }


    let quantumFeasible = qf(model.roadmap);
    
    let quantumAdvantage = qa(lcf, lqf, lpf, hardwareSlowdown, quantumImprovementRate);
    let quantumCostAdvantage = qa(lcfc, lqfc, lpf, costFactor, costImprovementRate);

    // console.log(quantumFeasible(currentYear), currentYear)

    const t1 = utils.bisectionMethod(year => quantumFeasible(year) - Math.log10(1024), currentYear, 3000, "tStar in QEA");
    const t2 = utils.bisectionMethod(year => quantumFeasible(year) - Math.log10(2048), currentYear, 3000, "tStar in QEA");
    const t3 = utils.bisectionMethod(year => quantumFeasible(year) - Math.log10(4096), currentYear, 3000, "tStar in QEA");
    // console.log(t1)
    return [t1, t2, t3];
}
function f() {
    let model = {...problems[0], ...hardware[2]};
    // model.quantumImprovementRate = 12;
    // let yv = currentYear;
    // let a = getQuantumFeasible(yv, model.roadmap, model.physicalLogicalQubitsRatio, utils.percentageToFraction(Number(model.ratioImprovementRate)), model.qubitToProblemSize, model.roadmapUnit);
    // let b = getQuantumAdvantage(utils.createLoggedFunction(model.classicalRuntimeInput), utils.createLoggedFunction(model.quantumRuntimeInput), utils.createLoggedFunction(convertQubits(model, model.penaltyInput)), model.hardwareSlowdown, utils.percentageToFraction(Number(model.quantumImprovementRate)), model.processors, utils.percentageToFraction(Number(model.costImprovementRate)), yv);
    // console.log(a, b);
    let [t1, t2, t3] = forcedAdvantage(model);
    console.log(t1, t2, t3);
}
f()

function feas() {
    let m = {
        "physicalLogicalQubitsRatio": [0, 2000, 25],
        "ratioImprovementRate": [-90, 90, 5],
    }

    let g = {} // {hardware: {parameter: {size: [values, problem sizes]}}}
    for (let hardwareIndex = 0; hardwareIndex < hardware.length; hardwareIndex++) {
        let hardwareName = hardware[hardwareIndex].hardwareName;
        // console.log(hardwareName)
        g[hardwareName] = {};
        for (let parameter in m) {
            // console.log(parameter);
            g[hardwareName][parameter] = {1024: [], 2048: [], 4096: []};
            let [lower, upper, step] = m[parameter];
            for (let value = lower; value <= upper; value += step) {
                let model = {...problems[0], ...hardware[hardwareIndex]};
                model[parameter] = value;
                let sizes = forcedAdvantage(model);
                g[hardwareName][parameter][1024].push([value, sizes[0]]);
                g[hardwareName][parameter][2048].push([value, sizes[1]]);
                g[hardwareName][parameter][4096].push([value, sizes[2]]); 

                // console.log([value, sizes]);
            }
        }
    }
        // for (let hardwareName in g) {
        //     for (let parameter in g[hardwareName]) {
        //         for (let size in g[hardwareName][parameter]) {
        //             console.log(hardwareName + "_" + parameter + "_" + size + " = ");
        //             console.log(g[hardwareName][parameter][size]);
        //         }
        //     }
        // }


}
// feas();


function s(){
    let model = {...problems[1], ...hardware[0]};
    // model.ratioImprovementRate = 50;
    model.quantumImprovementRate = 10;
    let f = getQuantumFeasible(2028, model.roadmap, model.physicalLogicalQubitsRatio, utils.percentageToFraction(Number(model.ratioImprovementRate)), model.qubitToProblemSize, model.roadmapUnit);
    let a = getQuantumAdvantage(utils.createLoggedFunction(model.classicalRuntimeInput), utils.createLoggedFunction(model.quantumRuntimeInput), utils.createLoggedFunction(convertQubits(model, model.penaltyInput)), model.hardwareSlowdown, utils.percentageToFraction(Number(model.quantumImprovementRate)), model.processors, utils.percentageToFraction(Number(model.costImprovementRate)), 2028);
    model.quantumImprovementRate = 15;
    let year2 = 2766;
    let g = getQuantumFeasible(year2, model.roadmap, model.physicalLogicalQubitsRatio, utils.percentageToFraction(Number(model.ratioImprovementRate)), model.qubitToProblemSize, model.roadmapUnit);
    console.log("f: " + f);
    console.log("g: " + g);

    let b = getQuantumAdvantage(utils.createLoggedFunction(model.classicalRuntimeInput), utils.createLoggedFunction(model.quantumRuntimeInput), utils.createLoggedFunction(convertQubits(model, model.penaltyInput)), model.hardwareSlowdown, utils.percentageToFraction(Number(model.quantumImprovementRate)), model.processors, utils.percentageToFraction(Number(model.costImprovementRate)), year2);
    console.log("a: " + a);
    console.log("b: " + b);
    console.log(Infinity - Infinity)
}

// s()

function main() {

    let m = {
        "hardwareSlowdown": [0, 10, .1],
        "processors": [0, 10, 0.1],
        "physicalLogicalQubitsRatio": [0, 2000, 25],
        "quantumImprovementRate": [-90, 90, 5],
        "costImprovementRate": [-90, 90, 5],
        "ratioImprovementRate": [-90, 90, 5],
    }

    let p = {}; // {instanceName: {parameter: [values, problem sizes]}}
    let t = {}; // {instanceName: {parameter: [values, times]}}
    for (let i = 0; i < hardware.length; i++) {
        for (let j = 0; j < problems.length; j++) {

            // j = 2;

            let instanceName = hardware[i].hardwareName + " " + problems[j].problemName;
            console.log(instanceName);
            p[instanceName] = {};
            t[instanceName] = {};
            let model = {...problems[j], ...hardware[i]};
            for (let parameter in m) {
                console.log(parameter);
                p[instanceName][parameter] = [];
                t[instanceName][parameter] = [];
                let alteredModel = {...model};
                let [lower, upper, step] = m[parameter];
                for (let value = lower; value <= upper; value += step) {
                    alteredModel[parameter] = value;
                    let [tstar, nstar] = calculateQuantumEconomicAdvantage(alteredModel);
                    p[instanceName][parameter].push([value, nstar]);
                    t[instanceName][parameter].push([value, tstar]);
                    // console.log([value, [tstar, nstar]]);
                    // console.log("hardware: " + model.hardwareName + " problem: " + model.problemName + " parameter: " + parameter + " value: " + value + " tstar: " + tstar + " nstar: " + nstar);
                }
            }
            // break;
            // let [tstar, nstar] = calculateQuantumEconomicAdvantage(model);
        }
        // break;
    }
    // console.log(d);
    for (let instanceName in t) {
        if (! (instanceName.includes("QuE") && instanceName.includes("Salesm"))) continue;
        for (let parameter in t[instanceName]) {
            console.log("time_" + parameter + "_" + instanceName + " = ");
            console.log(t[instanceName][parameter]);
            if (parameter in ["hardwareSlowdown", "processors"]) {
                console.log(t[instanceName][parameter].at(-1));
            }
        }
    }

}

// main();



//////////////////////////////////////////////////////////////

// function newAdvantage(modelog, targetSize, parameter, value) {
//     let model = {...modelog};
//     model[parameter] = value;

//     let hardwareSlowdown = model.hardwareSlowdown;
//     let physicalLogicalQubitsRatio = model.physicalLogicalQubitsRatio;
//     let ratioImprovementRate = utils.percentageToFraction(Number(model.ratioImprovementRate));
//     let quantumImprovementRate = utils.percentageToFraction(Number(model.quantumImprovementRate));
//     let qubitToProblemSize = model.qubitToProblemSize;
//     let roadmapUnit = model.roadmapUnit;

//     let classicalRuntimeInput = model.classicalRuntimeInput;
//     let quantumRuntimeInput = model.quantumRuntimeInput;
//     let penaltyInput = convertQubits(model, model.penaltyInput);


//     //lcf = logged classical function
//     let lcf = utils.createLoggedFunction(classicalRuntimeInput);
//     let lqf = utils.createLoggedFunction(quantumRuntimeInput);
//     let lpf = utils.createLoggedFunction(penaltyInput);
    
//     //lcfc = logged classical function cost
//     let lcfc = utils.createLoggedFunction(model.classicalWork);
//     let lqfc = utils.createLoggedFunction(convertQubits(model, model.quantumWork));
    

//     let costFactor = (Number(model.costFactor))
//     let costImprovementRate = utils.percentageToFraction(Number(model.costImprovementRate));

//     let processors = model.processors;

//     function qf(roadmap) {
//         return year => getQuantumFeasible(year, roadmap, physicalLogicalQubitsRatio, ratioImprovementRate, qubitToProblemSize, roadmapUnit)
//     }

//     function qa(logClassicalFunction, logQuantumFunction, logPenaltyFunction, hardwareSlowdown, quantumImprovementRate) {
//         //should probably be refactored eventually
//         return year => getQuantumAdvantage(logClassicalFunction, logQuantumFunction, logPenaltyFunction, hardwareSlowdown, quantumImprovementRate, processors, costImprovementRate, year)
//     }


//     let quantumFeasible = qf(model.roadmap);
    
//     let quantumAdvantage = qa(lcf, lqf, lpf, hardwareSlowdown, quantumImprovementRate);
//     // let quantumCostAdvantage = qa(lcfc, lqfc, lpf, costFactor, costImprovementRate);

//     const newTime = utils.bisectionMethod(year => targetSize - quantumAdvantage(year), 2023, 3000);   
    
//     // const tStar = utils.bisectionMethod(year => quantumFeasible(year) - quantumAdvantage(year), currentYear, 3000, "tStar in QEA");
//     const tStar = utils.bisectionMethod(year => quantumFeasible(year) - quantumAdvantage(year), 2023, 3000, "tStar in QEA");
//     // console.log("tStar: " + tStar);
//     // console.log("newTime: " + newTime);
//     // const tCostStar = utils.bisectionMethod(year => quantumFeasible(year) - quantumCostAdvantage(year), currentYear, 3000, "tCostStar in QEA");
//     if (tStar < currentYear) {
//         console.log("tStar is less than current year");
//     }
//     if (newTime < currentYear || newTime > 3000) {
//         console.log("newTime is out of bounds");
//         console.log("newTime: " + newTime);
//         console.log(parameter + ": " + value);
//     }
//     return [tStar, newTime];
// }

    // let m = {
    //     "hardwareSlowdown": [4, 10, 0.5],
    //     "processors": [5, 10, 0.5],
    //     "quantumImprovementRate": [-90, 0, 10],
    //     "costImprovementRate": [-90, 0, 10],
    // }
    // let d = {};
    // for (let parameter in m) {
    //     d[parameter] = [];
    //     let [lower, upper, step] = m[parameter];
    //     for (let value = lower; value <= upper; value += step) {
    //         let [tstar, newTime] = newAdvantage(model, 2.3056, parameter, value);
    //         d[parameter].push([value, newTime]);
    //     }
    // }
    // console.log(d);

// ibm factorization
// {
//     hardwareSlowdown: [
//       [ 4, 2031.269700333476 ],
//       [ 4.5, 2036.7332915365696 ],
//       [ 5, 2042.1968681812286 ],
//       [ 5.5, 2047.6604593843222 ],
//       [ 6, 2053.1240505874157 ],
//       [ 6.5, 2058.5876272320747 ],
//       [ 7, 2064.0512184351683 ],
//       [ 7.5, 2069.514809638262 ],
//       [ 8, 2074.978386282921 ],
//       [ 8.5, 2080.4419774860144 ],
//       [ 9, 2085.905568689108 ],
//       [ 9.5, 2091.369145333767 ],
//       [ 10, 2096.8327365368605 ]
//     ],
//     processors: [
//       [ 5, 2028.865709722042 ],
//       [ 5.5, 2034.32931548357 ],
//       [ 6, 2039.7928921282291 ],
//       [ 6.5, 2045.2564687728882 ],
//       [ 7, 2050.720074534416 ],
//       [ 7.5, 2056.1836511790752 ],
//       [ 8, 2061.6472278237343 ],
//       [ 8.5, 2067.1108335852623 ],
//       [ 9, 2072.5744102299213 ],
//       [ 9.5, 2078.0379868745804 ],
//       [ 10, 2083.5015926361084 ]
//     ],
//     quantumImprovementRate: [
//       [ -90, 2025.3382920362055 ],
//       [ -80, 2025.4750357717276 ],
//       [ -70, 2025.6221414729953 ],
//       [ -60, 2025.79732311517 ],
//       [ -50, 2026.0201399549842 ],
//       [ -40, 2026.3219872564077 ],
//       [ -30, 2026.7630495876074 ],
//       [ -20, 2027.4796885252 ],
//       [ -10, 2028.865709722042 ],
//       [ 0, 2032.731439948082 ]
//     ],
//     costImprovementRate: [
//       [ -90, 2025.3382920362055 ],
//       [ -80, 2025.4750357717276 ],
//       [ -70, 2025.6221414729953 ],
//       [ -60, 2025.79732311517 ],
//       [ -50, 2026.0201399549842 ],
//       [ -40, 2026.3219872564077 ],
//       [ -30, 2026.7630495876074 ],
//       [ -20, 2027.4796885252 ],
//       [ -10, 2028.865709722042 ],
//       [ 0, 2032.731439948082 ]
//     ]
//   }