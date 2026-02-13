import * as utils from "/Users/fred/Desktop/FutureTech/quantum-framework/src/store/utils.js"
import * as math from 'mathjs';

let problems = [

    {
        problemName: "Integer Factorization",
        classicalRuntime: (n) => 4 / (9 ** (1 / 3)) * (Math.log(10) ** (2 / 3)) * Math.log10(Math.E) * (10 ** (n / 3)) * (n ** (2 / 3)),
        quantumRuntime: (n) => 2 * n + Math.log10(n) + Math.log10(Math.log(10)),
        classicalRuntimeLabel: "O(e^{(64/9 * n)^{1/3} * \\ln(n)^{2/3}})",
        quantumRuntimeLabel: "O(n^{2} * \\ln(n))",
        classicalRuntimeInput: "e^((64/9 * n)^(1/3) * log(n, e)^(2/3))",
        classicalWork: "e^((64/9 * n)^(1/3) * log(n, e)^(2/3))",
        quantumRuntimeInput: "n^(2) * log(n, e)",
        quantumWork: "n^(2) * log(n, e) * q",
        penaltyInput: "log(n, 2)",
        qubitToProblemSize: "{q}",
        penalty: "log(n)",
    },
    {
        problemName: "Database Search",
        classicalRuntime: (n) => n,
        quantumRuntime: (n) => n / 2,
        classicalRuntimeLabel: "O(n)",
        quantumRuntimeLabel: "O(\\sqrt{n})",
        classicalRuntimeInput: "n",
        classicalWork: "n",
        quantumRuntimeInput: "sqrt(n)",
        quantumWork: "sqrt(n) * q",
        penaltyInput: "log(n, 2)",
        qubitToProblemSize: "2^{q}",
        penalty: "log(n)",
    },
    {
        problemName: "Traveling Salesman",
        classicalRuntime: (n) => 3 * n + 10 ** (n) * Math.log10(2),
        quantumRuntime: (n) => n + 10 ** (n) * Math.log10(1.78),
        classicalRuntimeLabel: "O(n^{3} * 2^{n})",
        quantumRuntimeLabel: "O(n * 1.78^{n})",
        classicalRuntimeInput: "n^3 * 2^n",
        classicalWork: "n^3 * 2^n",
        quantumRuntimeInput: "n * 1.78^n",
        quantumWork: "n * 1.78^n * q",
        penaltyInput: "log(n, 2)",
        qubitToProblemSize: "{q}",
        penalty: "log(n)",
    },
    {
        problemName: "Time Dependent Hartree-Fock Approximation (Quantum Chemistry)",
        classicalRuntime: (n) => 3 * n,
        quantumRuntime: (n) => n,
        classicalRuntimeLabel: "O(n^{3})",
        quantumRuntimeLabel: "O(n)",
        classicalRuntimeInput: "n^3",
        classicalWork: "n^3",
        quantumRuntimeInput: "n",
        quantumWork: "n * q",
        penaltyInput: "log(n, 2)",
        qubitToProblemSize: "{q}",
        penalty: "log(n)",
    },
    {
        problemName: "Full Configuration Interaction (Quantum Chemistry)",
        classicalRuntime: (n) => 10 ** (n) * Math.log10(Math.E) * (n * Math.log(10) - 1),
        quantumRuntime: (n) => 5 * n,
        classicalRuntimeLabel: "O(n!)",
        quantumRuntimeLabel: "O(n^{5})",
        classicalRuntimeInput: "(2 * pi * n)^(1/2) * (n / e)^n",
        classicalWork: "(2 * pi * n)^(1/2) * (n / e)^n",
        quantumRuntimeInput: "n^5",
        quantumWork: "n^5 * q",
        penaltyInput: "log(n, 2)",
        qubitToProblemSize: "{q}",
        penalty: "log(n)",
    },
]

let hardware = [
    {
        category: "Established builders",
        hardwareName: "IBM (Superconducting)",
        hardwareSlowdown: 3.78,
        costFactor: 8,
        quantumImprovementRate: -10,
        costImprovementRate: -10,
        physicalLogicalQubitsRatio: 1000,
        ratioImprovementRate: -2,
        roadmap: {
            2020: 27,
            2022: 127,
            2024: 133,
            2025: 156,
            2029: 200,
            2033: 2000,
        },
        roadmapUnit: "physical",
        extrapolationType: "exponential",
    },
    {
        hardwareName: "IonQ (Trapped Ion)",
        hardwareSlowdown: 6.7,
        costFactor: 8,
        quantumImprovementRate: -10,
        costImprovementRate: -10,
        physicalLogicalQubitsRatio: 32,
        ratioImprovementRate: -2,
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
    },
    {
        hardwareName: "Pasqal (Neutral Atom)",
        hardwareSlowdown: 5.1,
        costFactor: 8,
        quantumImprovementRate: -10,
        costImprovementRate: -10,
        physicalLogicalQubitsRatio: 100,
        ratioImprovementRate: -2,
        roadmap: {
            2022: 200,
            2024: 1000,
            2026: 10000,
        },
        roadmapUnit: "physical",
        extrapolationType: "exponential",
        reference: "https://www.hpcwire.com/2024/03/13/pasqal-issues-roadmap-to-10000-qubits-in-2026-and-fault-tolerance-in-2028/",
    }
]

// converts expression with q (qubits) to expression with n (problem size) by using the inverse of 
// the function specified by qubitToProblemSize parameter
function getQuantumWork(model) {
    let quantumWork = model.quantumWork;
    console.log("quantum work was ", quantumWork);
    if (model.qubitToProblemSize === "2^{q}") {
        //regular expression to remove only q's that are not part of a word (like sqrt)
        quantumWork = quantumWork.replaceAll(/\bq\b/g, "(log(n, 2))");
    }
    else if (model.qubitToProblemSize === "log({q})") {
        quantumWork = quantumWork.replaceAll(/\bq\b/g, "(2^n)");
    }
    else if (model.qubitToProblemSize === "{q}") {
        quantumWork = quantumWork.replaceAll(/\bq\b/g, "n");
    }
    else {
        console.log("this should never print");
    }
    console.log("quantum work is ", quantumWork);
    return quantumWork;
}


//returns the log_10 of the amount of logical qubits available with the given parameters
function getLogicalQubits(year, roadmap, physicalLogicalQubitsRatio, ratioImprovementRate , roadmapUnit) {
    const logOfPhysicalQubits = utils.getPhysicalQubits(year, roadmap, "exponential")
    if (roadmapUnit === "logical") {
        return logOfPhysicalQubits
    }
    //log_10 of the PLQR including the ratio improvement rate
    let adjustedPLQR = Math.log10(physicalLogicalQubitsRatio) + (year - 2024) * Math.log10(ratioImprovementRate);
    if (adjustedPLQR < Math.log10(3)) { //minimum PLQR is 3
        adjustedPLQR = Math.log10(3)
    }

    //logLogicalQubits has the log_10 of the true number of logical qubits
    let logLogicalQubits = logOfPhysicalQubits - adjustedPLQR

    return logLogicalQubits
}

// returns log_10 of the problem size where qa is reached
function getQuantumAdvantage(logClassicalFunction, logQuantumFunction, logPenaltyFunction, hardwareSlowdown, quantumImprovementRate, year = 2024) {
    // let adjustmentFactor = Number(hardwareSlowdown) + Math.log10(Math.pow(quantumImprovementRate, year - 2024));
    let adjustmentFactor = Number(hardwareSlowdown) + (year - 2024) * Math.log10(quantumImprovementRate);
    adjustmentFactor = math.max(adjustmentFactor, 0);
    // if (adjustmentFactor == 0) {
    //     console.log("adjustment factor is ", adjustmentFactor, " year is ", year);
    // }

    function evaluate(n) {
        let value = logClassicalFunction(n) - logQuantumFunction(n) - logPenaltyFunction(n) - adjustmentFactor;
        return value;
    }

    let upperBound = 10**100;
    let lowerBound = 2;
    let lastValue = evaluate(lowerBound);
    while (lowerBound < 50 && lastValue >= 0) {
        lowerBound += 0.25;
        let nextValue = evaluate(lowerBound);

        lastValue = nextValue;
        // if (nextValue >= lastValue) {
        //     console.log("QA function is always positive?! (quantum is always better) ");
        //     break;
        // }
        // else {
        //     lastValue = nextValue;
        // }
    }
    let result = utils.bisectionMethod(evaluate, lowerBound, upperBound);

    if (result === null) {
        console.log(`null returned!!!! year was ${year} and adjustmentFactor was ${adjustmentFactor}`);
        console.log("lowerBound:", lowerBound, "upperBound:", upperBound);
        console.log("f(lowerBound):", evaluate(lowerBound), "f(upperBound):", evaluate(upperBound));
        return 0;
    }
    else if (lowerBound > 2) {
        console.log(`Had to guess start for QA bisection more than once, final lowerBound was ${lowerBound}`);
    }

    return Math.log10(result);

}

//function returns the log of the problem size solvable, even though there is a "10 ** problemSize"
function getQuantumFeasible(year, roadmap, physicalLogicalQubitsRatio, ratioImprovementRate, qubitToProblemSize, roadmapUnit) {
    //logLogicalQubits has the log_10 of the true number of logical qubits
    let logLogicalQubits = getLogicalQubits(year, roadmap, physicalLogicalQubitsRatio, ratioImprovementRate , roadmapUnit)

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
    let ratioImprovementRate = ((100 + Number(model.ratioImprovementRate)) / 100);
    let quantumImprovementRate = ((100 + Number(model.quantumImprovementRate)) / 100);
    let qubitToProblemSize = model.qubitToProblemSize;
    let roadmapUnit = model.roadmapUnit;
    let currentYear = new Date().getFullYear();

    let classicalRuntimeInput = model.classicalRuntimeInput;
    let quantumRuntimeInput = model.quantumRuntimeInput;
    let penaltyInput = model.penaltyInput;

    //lcf = logged classical function
    let lcf = utils.createLoggedFunction(classicalRuntimeInput);
    let lqf = utils.createLoggedFunction(quantumRuntimeInput);
    let lpf = utils.createLoggedFunction(penaltyInput);
    
    //lcfc = logged classical function cost
    let lcfc = utils.createLoggedFunction(model.classicalWork);
    let lqfc = utils.createLoggedFunction(getQuantumWork(model));
    

    let costFactor = (Number(model.costFactor))
    let costImprovementRate = ((100 + Number(model.costImprovementRate)) / 100);

    function qf(roadmap) {
        return year => getQuantumFeasible(year, roadmap, physicalLogicalQubitsRatio, ratioImprovementRate, qubitToProblemSize, roadmapUnit)
    }

    function qa(logClassicalFunction, logQuantumFunction, logPenaltyFunction, hardwareSlowdown, quantumImprovementRate) {
        return year => getQuantumAdvantage(logClassicalFunction, logQuantumFunction, logPenaltyFunction, hardwareSlowdown, quantumImprovementRate, year)
    }


    let quantumFeasible = qf(model.roadmap);

    let quantumAdvantage = qa(lcf, lqf, lpf, hardwareSlowdown, quantumImprovementRate);
    let quantumCostAdvantage = qa(lcfc, lqfc, lpf, costFactor, costImprovementRate);

    const tStar = utils.bisectionMethod(year => quantumFeasible(year) - quantumAdvantage(year), 2024, 3000);
    const tCostStar = utils.bisectionMethod(year => quantumFeasible(year) - quantumCostAdvantage(year), 2024, 3000);

    // console.log("tStar:", tStar);
    // console.log("tStar:", tStar, "tCostStar:", tCostStar);
    return [tStar, tCostStar];
}

function freeFeasible(model, testYear, parameter, range = [-(10**20), 10**20]) {
    let hardwareSlowdown = model.hardwareSlowdown;
    let physicalLogicalQubitsRatio = model.physicalLogicalQubitsRatio;
    let ratioImprovementRate = ((100 + Number(model.ratioImprovementRate)) / 100);
    let quantumImprovementRate = ((100 + Number(model.quantumImprovementRate)) / 100);
    let qubitToProblemSize = model.qubitToProblemSize;
    let roadmapUnit = model.roadmapUnit;
    let currentYear = new Date().getFullYear();

    let classicalRuntimeInput = model.classicalRuntimeInput;
    let quantumRuntimeInput = model.quantumRuntimeInput;
    let penaltyInput = model.penaltyInput;

    //lcf = logged classical function
    let lcf = utils.createLoggedFunction(classicalRuntimeInput);
    let lqf = utils.createLoggedFunction(quantumRuntimeInput);
    let lpf = utils.createLoggedFunction(penaltyInput);
    
    //lcfc = logged classical function cost
    let lcfc = utils.createLoggedFunction(model.classicalWork);
    let lqfc = utils.createLoggedFunction(getQuantumWork(model));
    

    let costFactor = (Number(model.costFactor))
    let costImprovementRate = ((100 + Number(model.costImprovementRate)) / 100);

    // function qf(roadmap) {
    //     return year => getQuantumFeasible(year, roadmap, physicalLogicalQubitsRatio, ratioImprovementRate, qubitToProblemSize, roadmapUnit)
    // }

    function qf(roadmap) {
        let base = "getQuantumFeasible(testYear, roadmap, physicalLogicalQubitsRatio, ratioImprovementRate, qubitToProblemSize, roadmapUnit)";
        base = base.replace(parameter, "parameter");
        // eval("return parameter => " + base);
        return eval('(' + "parameter => " + base + ')');

        // return year => getQuantumFeasible(testYear, roadmap, physicalLogicalQubitsRatio, ratioImprovementRate, qubitToProblemSize, roadmapUnit)
    }

    function qa(logClassicalFunction, logQuantumFunction, logPenaltyFunction, hardwareSlowdown, quantumImprovementRate) {
        return year => getQuantumAdvantage(logClassicalFunction, logQuantumFunction, logPenaltyFunction, hardwareSlowdown, quantumImprovementRate, year)
    }


    let quantumFeasible = qf(model.roadmap);

    let quantumAdvantage = qa(lcf, lqf, lpf, hardwareSlowdown, quantumImprovementRate);
    // let quantumCostAdvantage = qa(lcfc, lqfc, lpf, costFactor, costImprovementRate);

    let goal = quantumAdvantage(testYear);
    // let costGoal = quantumCostAdvantage(testYear);

    const pStar = utils.bisectionMethod(parameter => quantumFeasible(parameter) - goal, range[0], range[1]);
    // const pCostStar = utils.bisectionMethod(parameter => quantumFeasible(parameter) - costGoal, 1, 10**20);

    // console.log("parameter: ", parameter, "pStar:", pStar, "pCostStar:", pCostStar);
    // console.log("testYear:", testYear, "parameter:", parameter, "pStar:", pStar);

    return pStar;
}

function freeAdvantage(model, testYear, parameter, range = [-(10**20), 10**20]) {
    let hardwareSlowdown = model.hardwareSlowdown;
    let physicalLogicalQubitsRatio = model.physicalLogicalQubitsRatio;
    let ratioImprovementRate = ((100 + Number(model.ratioImprovementRate)) / 100);
    let quantumImprovementRate = ((100 + Number(model.quantumImprovementRate)) / 100);
    let qubitToProblemSize = model.qubitToProblemSize;
    let roadmapUnit = model.roadmapUnit;
    let currentYear = new Date().getFullYear();

    let classicalRuntimeInput = model.classicalRuntimeInput;
    let quantumRuntimeInput = model.quantumRuntimeInput;
    let penaltyInput = model.penaltyInput;

    //lcf = logged classical function
    let lcf = utils.createLoggedFunction(classicalRuntimeInput);
    let lqf = utils.createLoggedFunction(quantumRuntimeInput);
    let lpf = utils.createLoggedFunction(penaltyInput);
    
    //lcfc = logged classical function cost
    let lcfc = utils.createLoggedFunction(model.classicalWork);
    let lqfc = utils.createLoggedFunction(getQuantumWork(model));
    

    let costFactor = (Number(model.costFactor))
    let costImprovementRate = ((100 + Number(model.costImprovementRate)) / 100);

    function qf(roadmap) {
        return year => getQuantumFeasible(year, roadmap, physicalLogicalQubitsRatio, ratioImprovementRate, qubitToProblemSize, roadmapUnit)
    }

    // function qf(roadmap) {
    //     let base = "getQuantumFeasible(testYear, roadmap, physicalLogicalQubitsRatio, ratioImprovementRate, qubitToProblemSize, roadmapUnit)";
    //     base = base.replace(parameter, "parameter");
    //     eval("return parameter => " + base);
    //     // return year => getQuantumFeasible(testYear, roadmap, physicalLogicalQubitsRatio, ratioImprovementRate, qubitToProblemSize, roadmapUnit)
    // }

    function qa(logClassicalFunction, logQuantumFunction, logPenaltyFunction, hardwareSlowdown, quantumImprovementRate) {
        if (parameter == "costFactor") {
            parameter = "hardwareSlowdown";
        }
        if (parameter == "costImprovementRate") {
            parameter = "quantumImprovementRate";
        }

        let base = "getQuantumAdvantage(logClassicalFunction, logQuantumFunction, logPenaltyFunction, hardwareSlowdown, quantumImprovementRate, testYear)";
        base = base.replace(parameter, "parameter");
        return eval('(' + "parameter => " + base + ')');
        // return year => getQuantumAdvantage(logClassicalFunction, logQuantumFunction, logPenaltyFunction, hardwareSlowdown, quantumImprovementRate, year)
    }

    // console.log("parameter: ", parameter)

    let quantumFeasible = qf(model.roadmap);
    let f = null;

    if (parameter[0] == "c") {
        f = qa(lcfc, lqfc, lpf, costFactor, costImprovementRate);

    }
    else {
        f = qa(lcf, lqf, lpf, hardwareSlowdown, quantumImprovementRate);
    }


    let goal = quantumFeasible(testYear);
    // console.log("goal:", goal);
    // console.log(f(-.0010))

    // const pStar = utils.bisectionMethod(parameter => goal - f(parameter), -(10**20), 10**20);
    const pStar = utils.bisectionMethod(parameter => goal - f(parameter), range[0], range[1]);


    // console.log("pStar:", pStar);
    // console.log("testYear:", testYear, "parameter:", parameter, "pStar:", pStar);
    return pStar;
}



function main() {
    let hardwareIndex = 2;
    let problemIndex = 4;
    let model = {...problems[problemIndex], ...hardware[hardwareIndex]};
    // console.log(model)

    let anchors = calculateQuantumEconomicAdvantage(model);
    // for (let i = 0; i < anchors.length; i++) {
    //     console.log("anchor", i, ":", anchors[i]);
    // }

    // anchor[1] if cost related, ensure range is ok
    // let pstar = freeAdvantage(model, anchors[1] - 1, "costImprovementRate", [.1, 2]);
    // let pstar = freeFeasible(model, anchors[0] - 1, "ratioImprovementRate", [.1, 2]);
    // physicalLogicalQubitsRatio, ratioImprovementRate
    // let pstar = freeAdvantage(model, anchors[1] + 1, "costFactor", [.1, 2]);
    // console.log(pstar)

    for (let parameter of ["hardwareSlowdown", "costFactor", "quantumImprovementRate",  "costImprovementRate"]) {
        let anchorIndex = 0;
        if (parameter == "costFactor" || parameter == "costImprovementRate") {
            anchorIndex = 1;
        }

        for (let delta of [-1, 1]) {
            let testYear = anchors[anchorIndex] + delta;

            let range = [0, 10**20];
            if (parameter.endsWith("Rate")) {
                range = [.00001, 1000];
            }

            let pstar = freeAdvantage(model, testYear, parameter, range);

            let og = model[parameter];
            
            if (parameter.endsWith("Rate")) {
                pstar = pstar * 100 - 100
            }
            let dp = (pstar - og) / og;

            console.log("parameter: ", parameter, "\noriginal: ", og, "\ndelta: ", delta, "\ntestYear: ", testYear, "\npstar: ", pstar, "\ndp: ", dp);
        }
    }

    for (let parameter of ["physicalLogicalQubitsRatio", "ratioImprovementRate"]) {
        let anchorIndex = 0;

        for (let delta of [-1, 1]) {
            let testYear = anchors[anchorIndex] + delta;
            
            let range = [0, 10**20];
            if (parameter.endsWith("Rate")) {
                range = [.00001, 1000];
            }

            let pstar = freeFeasible(model, testYear, parameter, range);

            let og = model[parameter];
            
            if (parameter.endsWith("Rate")) {
                pstar = pstar * 100 - 100
            }
            let dp = (pstar - og) / og;

            console.log("parameter: ", parameter, "\noriginal: ", og, "\ndelta: ", delta, "\ntestYear: ", testYear, "\npstar: ", pstar, "\ndp: ", dp);
        }
    }
    

}

main()