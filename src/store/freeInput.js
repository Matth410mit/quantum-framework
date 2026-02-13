import * as math from 'mathjs';
import { parse } from 'vue/compiler-sfc';
import * as utils from "/Users/fred/Desktop/FutureTech/quantum-framework/src/store/utils.js"


function main() {

    // let expression = "n^2 + log(n)";
    // parsedExpression.traverse(processNode);
    // console.log(parsedExpression.toTex());
    // console.log(parsedExpression.compile().evaluate(scope));

    // let expression = "n^(2) * log10(n) * e";
    // let expression = "(2 * pi * n)^(1/2) * (n / e)^n";
    // let expression = "n^3 + 2^n";
    // let expression = "n * (n - 10^11) / (n - 10^11)";
    // let expression = "n * (n - 10^3)";
    // let parsedExpression = math.parse(expression);
    // let logged = utils.applyLogRules(parsedExpression);

    // let scope = {n: 100, y: 2};
    
    
    // console.log(expression)
    // console.log(parsedExpression.toString())
    // console.log(logged.toString())
    // console.log(math.simplify(logged.toString()).toString())
    // logged.traverse(processNode);

    let classicalRuntimeInput = "n * (n - 10^3)";
    let quantumRuntimeInput = "n ^ 0.5";
    let penaltyInput = "log(n, 2)";
    let hardwareSlowdown = 3.78;
    let quantumImprovementRate = .9;

    let lcf = utils.createLoggedFunction(classicalRuntimeInput);
    let lqf = utils.createLoggedFunction(quantumRuntimeInput);
    let lpf = utils.createLoggedFunction(penaltyInput);

    console.log("lcf(2):", lcf(2), "\nlqf(2):", lqf(2), "\nlpf(2):", lpf(2));
    console.log(lcf(2) - lqf(2) - lpf(2) - hardwareSlowdown);
    console.log(Math.abs(lcf(2) - lqf(2) - lpf(2) - hardwareSlowdown));
    console.log(Math.abs(lcf(2) - lqf(2) - lpf(2) - hardwareSlowdown) < 100);

    console.log()
    let advantage = getQuantumAdvantage(lcf, lqf, lpf, hardwareSlowdown, quantumImprovementRate, 2024);
    console.log()
    console.log(advantage)

}

// returns log_10 of the problem size where qa is reached
function getQuantumAdvantage(logClassicalFunction, logQuantumFunction, logPenaltyFunction, hardwareSlowdown, quantumImprovementRate, year = 2024) {
    // let adjustmentFactor = Number(hardwareSlowdown) + Math.log10(Math.pow(quantumImprovementRate, year - 2024));
    let adjustmentFactor = Number(hardwareSlowdown) + (year - 2024) * Math.log10(quantumImprovementRate);
    adjustmentFactor = math.max(adjustmentFactor, 0);
    // if (adjustmentFactor == 0) {
    //     console.log("adjustment factor is ", adjustmentFactor, " year is ", year);
    // }

    // if (adjustmentFactor <= -5) { //if adjustmentFactor is ever 0, then there is no hardware slowdown, so any problem should be QEA
    //     console.log("adjustment factor is less than -5 and is ", adjustmentFactor, " year is ", year)
    //     return 0;
    // }
    // else if (adjustmentFactor <= 0) {
    //     console.log("adjustment factor is < 0 and is ", adjustmentFactor, " year is ", year)
    // }

    function evaluate(n) {
        let value = logClassicalFunction(n) - logQuantumFunction(n) - logPenaltyFunction(n) - adjustmentFactor;
        return value;
    }

    let lowerBound = 2;
    let upperBound = 10**100;
    let result = utils.bisectionMethod(evaluate, lowerBound, upperBound);
    // if (result === null) {
    while (result === null && lowerBound < 10) {
        lowerBound += 0.5;
        result = utils.bisectionMethod(evaluate, lowerBound, upperBound);
    }
    if (result === null) {
        console.log(`null returned!!!! year was ${year} and adjustmentFactor was ${adjustmentFactor}`);
        console.log("lowerBound:", lowerBound, "upperBound:", upperBound);
        console.log("f(lowerBound):", evaluate(lowerBound), "f(upperBound):", evaluate(upperBound));
        return 0;
    }
    // if (lowerBound > 2) {
        // console.log(`Had to guess start for QA bisection more than once, final lowerBound was ${lowerBound}`);
    // }

    return Math.log10(result);

}

// Function to process each node
function processNode(node, path, parent) {
    console.log(`Node Type: ${node.type}`);
    
    // Log specific properties based on node type
    if (node.isOperatorNode) {
        console.log(`Operator: ${node.op}`);
    } else if (node.isConstantNode) {
        console.log(`Constant value: ${node.value}`);
    } else if (node.isSymbolNode) {
        console.log(`Symbol name: ${node.name}`);
    } else if (node.isFunctionNode) {
        console.log(`Function name: ${node.fn.name}`);
    } else {
        console.log("other");
    }

    console.log(`Node String: ${node.toString()}`);
}

main();


    // (2) * log10(n1) + log10(log10(n1)) + log10(e) + n1

    // n1 = 10 ** log10(n1) = 10 ** n2

    // 2 * n2 + log10(n2) + log10(e)

    // "n1^(2) * log10(n1) * e"
    // (10 ^ (n2))^2 * log10(10^n2) * e
    // 2 * n2 * log10(10) + n2 * log10(10) + log10(e)

    // n -> (10 ^ n)