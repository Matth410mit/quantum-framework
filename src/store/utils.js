import * as math from 'mathjs';
// finite guards for plotting
const MIN_POSITIVE_Q = 1e-6;
const MIN_LOG10_Q    = Math.log10(MIN_POSITIVE_Q);

function finiteOr(value, fallback) {
  return Number.isFinite(value) ? value : fallback;
}

// Accept both "{q}" and "q"
export function normalizeQubitMapping(exprRaw) {
  if (typeof exprRaw !== "string") return exprRaw;
  return exprRaw.replace(/\{\s*q\s*\}/gi, "q");
}


export function normalizeQExpr(expr = "") {
    return String(expr)
      .trim()
      .replaceAll(/\{q\}/g, "q") // legacy -> new
      .replaceAll(/\s+/g, "")
      .toLowerCase();
  }
  
  export function classifyQubitMapping(expr) {
    const s = normalizeQExpr(expr);
  
    if (s === "q") return "linear";
    if (s === "2^q" || s === "2^{q}") return "exp";
    if (s === "2^(2^q)" || s === "2^(2^{q})") return "doubleexp";
    if (s === "log(q,2)" || s === "log2(q)" || s === "log({q})" || s === "log(q)") return "log";
  
    return "custom";
  }
  
  export function isBuiltinQubitMapping(expr) {
    return classifyQubitMapping(expr) !== "custom";
  }
  
  /** Replace every free occurrence of a variable name with a replacement expression. */
  export function replaceVariable(srcExpression, varName, replacementExpr) {
    // Matches `varName` as a symbol (not part of a longer name)
    const re = new RegExp(`\\b${varName}\\b`, "g");
    // Also support the legacy {q}
    const reLegacy = new RegExp(`\\{${varName}\\}`, "g");
    return String(srcExpression).replaceAll(re, replacementExpr).replaceAll(reLegacy, replacementExpr);
  }  

//rounds input number to the specified number of digits
export function round(number, decimalDigits=2) {
    const factor = 10 ** decimalDigits
    return Math.round(number * factor) / factor
}

export function drawDashLine(chart, point, dashLine, color='rgba(255,0,0,0.3)') {
    const xAxis = chart.xAxis[0]
    const yAxis = chart.yAxis[0]

    const x = Math.round(xAxis.toPixels(point[0]))
    const y = Math.round(yAxis.toPixels((point[1])))
    const d = ['M', xAxis.left, y, 'L', x, y, 'L', x, yAxis.top + yAxis.height]

    return dashLine
        ? dashLine.attr({ d })
        : chart.renderer.path(d).attr({ 'stroke-dasharray': '8,4', 'stroke': color, 'stroke-width': 2, zIndex: 1 }).add()
}

//returns a string representing the year and quarter ("2024 Q2") of the input year
export function yearToQuarter(yearFloat) {
    const year = Math.floor(yearFloat); // Extracts the year part
    const fraction = yearFloat - year; // Gets the fractional part of the year
    const quarter = Math.floor(fraction * 4) + 1; // Calculates the quarter

    return `${year} Q${quarter}`;
}

//returns a string representing the year and month ("2024 Jun") of the input year
export function yearToMonth(yearFloat) {
    const year = Math.floor(yearFloat); // Extracts the year part
    const fraction = yearFloat - year; // Gets the fractional part of the year
    const monthIndex = Math.floor(fraction * 12); // Calculates the month index (0-11)

    // Array of month abbreviations
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    // Select the correct month abbreviation using the month index
    const monthAbbreviation = months[monthIndex];

    return `${year} ${monthAbbreviation}`;
}

//returns 10^{exponent} in html
export function toBase10HTML(exponent) {
    if (exponent === -Infinity) {
        return '10<sup>0</sup>';
    }

    return `10<sup>${round(exponent, 1)}</sup>`;
}

export function applyLogRules(node) {
    if (node.isOperatorNode && node.op === '*') {
        // log10(a * b) -> log10(a) + log10(b)
        const transformedArgs = node.args.map(arg => applyLogRules(arg));
        return transformedArgs.reduce((acc, arg) => new math.OperatorNode('+', 'add', [acc, arg]));
    } 
    if (node.isOperatorNode && node.op === '/') {
        // log10(a / b) -> log10(a) - log10(b)
        if (node.args.length != 2) {
            console.log("error applying log to division")
            return
        }
        let [numerator, denominator] = node.args
        return new math.OperatorNode("-", "subtract", [
            applyLogRules(numerator),
            applyLogRules(denominator)
        ])
    } 
    else if (node.isOperatorNode && node.op === '^') {
        // log10(a^b) -> b * log10(a)
        const [base, exponent] = node.args;
        return new math.OperatorNode('*', 'multiply', [
            exponent,
            applyLogRules(base)
        ]);
    } 
    else if (node.isParenthesisNode) {
        return applyLogRules(node.content)
    }
    else if (node.isOperatorNode || node.isFunctionNode || node.isSymbolNode || node.isConstantNode) {
        return new math.FunctionNode(new math.SymbolNode("log10"), [node])
    }
    else {
        console.log("parsing expression. this should never print")
    }

    return node;
}

export function createLoggedFunction(expression) {
    // let loggedTree = applyLogRules(math.parse(expression));
    // console.log(expression)
    // console.log(loggedTree.toString())
    // loggedTree = loggedTree.compile();

    let loggedTree = applyLogRules(math.parse(expression)).compile();
    function logged(value, scope = {n: value}) {
        // let scope = {n: value};
        return loggedTree.evaluate(scope);
    }
    return logged;
}

export function createConvertedFunction(expression) {
    let replaced = expression.replaceAll("n", "(10^(n))");
    return createLoggedFunction(replaced);
}

function simpleLinearRegression(x, y) {
    let n = x.length;
    let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;
    for (let i = 0; i < n; i++) {
        sumX += x[i];
        sumY += y[i];
        sumXY += x[i] * y[i];
        sumXX += x[i] * x[i];
    }
    let slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    let intercept = (sumY - slope * sumX) / n;
    return { slope, intercept };
}

function linearInterpolation(xValues, yValues, x) {
    let i = 0;
    for (; i < xValues.length - 1; i++) {
        if (x <= xValues[i + 1]) break;
    }
    let x1 = xValues[i], y1 = yValues[i];
    let x2 = xValues[i + 1], y2 = yValues[i + 1];
    return y1 + (y2 - y1) * (x - x1) / (x2 - x1);
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

const interpolationFunctions = {
    linear: linearInterpolation,
    exponential: exponentialInterpolation
}

// a map containing serialized strings of the inputs to the linear regression function mapped to their output regression
const regressionMap = new Map();

//returns log_10 of the number of qubits available based on inputs and saves the value to the regressionMap
export function getPhysicalQubits(year, roadmap, extrapolationType, baseFactor = 1) {
  year = parseFloat(year);
  let years = Object.keys(roadmap).map(Number);
  let qubits = Object.values(roadmap).map(Number);

  // actual value of the number of physical qubits
  let numberOfPhysicalQubits;
  // logOfPhysicalQubits holds log_10 of the true number of physical qubits
  let logOfPhysicalQubits;

  if (roadmap.hasOwnProperty(year)) {
    numberOfPhysicalQubits = roadmap[year];
    logOfPhysicalQubits = Math.log10(numberOfPhysicalQubits);
  } else if (year > Math.max(...years)) {
    if (extrapolationType === 'linear') {
      let [lastYears, lastQubits] = [years.slice(-2), qubits.slice(-2)];
      let key = JSON.stringify([lastYears, lastQubits]);
      let regression = regressionMap.has(key)
        ? regressionMap.get(key)
        : (regressionMap.set(key, simpleLinearRegression(lastYears, lastQubits)), regressionMap.get(key));

      numberOfPhysicalQubits = regression.slope * year + regression.intercept;
      logOfPhysicalQubits = Math.log10(numberOfPhysicalQubits);
    } else {
      // exponential regression is just linear regression in log space
      let [lastYears, lastQubitsLog] = [years.slice(-2), qubits.slice(-2).map(x => Math.log10(x))];
      let key = JSON.stringify([lastYears, lastQubitsLog]);
      let regression = regressionMap.has(key)
        ? regressionMap.get(key)
        : (regressionMap.set(key, simpleLinearRegression(lastYears, lastQubitsLog)), regressionMap.get(key));

      logOfPhysicalQubits = regression.slope * year + regression.intercept;
      // (You previously experimented with baseFactor; leaving it out here matches your working path.)
    }
  } else {
    numberOfPhysicalQubits = interpolationFunctions[extrapolationType](years, qubits, year);
    logOfPhysicalQubits = Math.log10(numberOfPhysicalQubits);
  }

  return logOfPhysicalQubits;
}

// find when f(x) = 0
// assumes f is a function such that f(a) * f(b) < 0 and f(b) > 0
// export function bisectionMethod(f, a, b, tol = 1e-7, maxIter = 10000000) {
// export function bisectionMethod(f, a, b, tol = 1e-7, maxIter = 400) {
export function bisectionMethod(f, a, b, description = "", tol = 1e-7, maxIter = 1000) {
    let fa = f(a);
    let fb = f(b);

    if (fa == null || fb == null || isNaN(fa) || isNaN(fb)) {
        console.log("fa or fb is null or NaN; returning null")
        console.log("Description: ", description) 
        console.log(`a: ${a}, b: ${b}, b-a: ${b-a}, fa: ${fa}, fb: ${fb}`);
        return null;
    }

    if (fa >= 0) {
        // console.log("fa is positive. implies that classical is always more expensive")
        // console.log("Description: ", description) 
        // console.log(`a: ${a}, b: ${b}, b-a: ${b-a}, fa: ${fa}, fb: ${fb}`);
        return 0;
    }
    if (fb < 0) {
        // console.log("fb is negative. implies that quantum is always more expensive")
        // console.log("Description: ", description) 
        // console.log(`a: ${a}, b: ${b}, b-a: ${b-a}, fa: ${fa}, fb: ${fb}`);
        return Infinity;
    }
    
    let c = a;
    let fc = fa;
    for (let i = 0; i < maxIter; i++) {
        c = (a + b) / 2;
        fc = f(c);
        if (fc == null || isNaN(fc)) {
            console.log("fc is null or NaN; returning null");
            console.log("Description: ", description) 
            console.log(`a: ${a}, b: ${b}, b-a: ${b-a}, c: ${c}, fa: ${fa}, fb: ${fb}, fc: ${fc}`);
            return null;
        }
        if (Math.abs(fc) < tol || Math.abs(b - a) < tol) {
            // if (Math.abs(fc) >= tol) {
            //     console.log("binary search range tolerance reached before value tolerance. function is very sensitive to changes in input.")
            //     console.log("Description: ", description) 
            //     console.log(`a: ${a}, b: ${b}, b-a: ${b-a}, c: ${c}, fa: ${fa}, fb: ${fb}, fc: ${fc}`);
            // }
            // else {
            //     console.log("smooth binary search")
            // }
            return c;
        }

        if (fa * fc < 0) {
            b = c;
            fb = fc;
        } else {
            a = c;
            fa = fc;
        }
    }

    console.log("couldn't converge during binary search. returning last value") 
    console.log("Description: ", description) 
    console.log(`a: ${a}, b: ${b}, b-a: ${b-a}, c: ${c}, fa: ${fa}, fb: ${fb}, fc: ${fc}`);
    return c;
}

//returns (log_10 of) the amount of logical qubits needed to achieve said problem size using
//the function specified by qubitToProblemSize (accepts "{q}" or "q", and "log({q})" or "log(q)")
//( logSize is log_10 of the actual problem size )
export function problemSizeToQubits(logSize, qubitToProblemSize) {
    const norm = normalizeQubitMapping(String(qubitToProblemSize || "").trim());
  
    // We compute q (the logical qubits), then return log10(q).
    // All paths are clamped to keep charts stable.
    let qValue;
  
    if (norm === "2^{q}") {
      // size = 10^logSize = 2^q  =>  q = log2(10^logSize) = logSize / log10(2)
      qValue = logSize / Math.log10(2);
  
    } else if (norm === "2^(2^{q})") {
      // size = 2^(2^q)
      // log2(size) = 2^q
      // 2^q = log2(10^logSize) = logSize * log2(10)
      // q = log2( log2(10^logSize) ) = log2( logSize * log2(10) )
      const inner = logSize * Math.LOG2E * Math.log(10); // log2(10) == Math.LOG2E*Math.log(10)
      qValue = Math.log2(Math.max(inner, MIN_POSITIVE_Q));
  
    } else if (norm === "{q}" || norm === "q") {
      // size == q  =>  logSize = log10(q)  =>  log10(q) = logSize
      // So we can return logSize directly (just clamp to be safe)
      const log10q = finiteOr(logSize, MIN_LOG10_Q);
      return log10q;
  
    } else if (norm === "log({q})" || norm === "log(q)") {
      // size = log10(q)
      // 10^logSize = log10(q)  =>  q = 10^(10^logSize)
      // For stability, clamp extremely small/negative logSize so q stays finite
      const rhs = Math.pow(10, logSize);
      qValue = Math.pow(10, rhs);
  
    } else {
      // Unknown form — keep previous behavior (but stable)
      // Fallback: pretend size == q  =>  log10(q) = logSize
      const log10q = finiteOr(logSize, MIN_LOG10_Q);
      return log10q;
    }
  
    // Guard: q must be positive finite
    qValue = Number.isFinite(qValue) && qValue > 0 ? qValue : MIN_POSITIVE_Q;
  
    // Return log10(q)
    return finiteOr(Math.log10(qValue), MIN_LOG10_Q);
  }  

/**
 * Find the largest problem size (as log10) solvable within a compute-time budget.
 * @param {Function} lqf  – logged quantum runtime: lqf(logN) = log10(runtime(N))
 * @param {Function} lpf  – logged penalty: lpf(logN) = log10(penalty(N))
 * @param {number} maxOpsLog – log10 of the max allowed total operations
 * @param {number} slowdownLog – log10 of the hardware slowdown factor (added to quantum runtime)
 * @returns {number} log10(max_problem_size) that fits within the budget
 */
export function findTimeFeasibleProblemSize(lqf, lpf, maxOpsLog, slowdownLog = 0) {
    // Total quantum cost for problem of size 10^logN:
    //   log10(total_ops) = lqf(logN) + lpf(logN) + slowdownLog
    // We want: lqf(logN) + lpf(logN) + slowdownLog <= maxOpsLog
    function f(logN) {
        return lqf(logN) + lpf(logN) + slowdownLog - maxOpsLog;
    }

    // If even logN=0 (problem size=1) exceeds budget, nothing is feasible
    if (f(0) > 0) return -Infinity;

    // Use bisection to find the crossover point
    const result = bisectionMethod(f, 0, 300, "timeFeasible", 1e-7, 1000);
    if (result === null || result === Infinity) return Infinity;
    if (result === 0) return 0;
    return Math.log10(result);
}

// returns the fractional representation of the percentage input
// -20% -> 0.8, +30% -> 1.3
export function percentageToFraction(percentage) {
    return 1 + percentage / 100;
}

// Flexible qubit→problem size mapping helpers
// (reuses the top-level `import * as math from 'mathjs'` above)

// These are the original dropdown options + brace-less equivalents
const BUILTIN_QUBIT_MAPPINGS = new Set([
    "2^{q}",
    "{q}",
    "q",     
    "log({q})",
    "log(q)",   
    "2^(2^{q})"   // huge; we always cap this in evaluation
]);
  
  
// Turn a user expression like "{q}^3 + {q}*log({q})" (or "q^3 + q*log(q)") into f(q) -> number
export function compileQubitMapping(expr) {
    const normalized = normalizeQubitMapping(String(expr || ""));
    const node = math.parse(normalized);
    const compiled = node.compile();
    return (q) => compiled.evaluate({ q });
}
    
  
export function evaluateQubitMapping(
    expr,
    q,
    {
      allowNonPositive = false,
      clamp = 1e300   // big enough to show “very large” but still finite
    } = {}
  ) {
    const raw = String(expr || "").trim();
    const norm = normalizeQubitMapping(raw);
  
    // 1) handle known presets explicitly so they never go red
    if (isBuiltinQubitMapping(norm)) {
      let value;
      switch (norm) {
        case "2^{q}": {
          // grows fast → cap if needed
          const candidate = Math.pow(2, q);
          value = Number.isFinite(candidate) ? candidate : clamp;
          break;
        }
        case "{q}":
        case "q": {
          value = q;
          break;
        }
        case "log({q})":
        case "log(q)": {
          // keep base-10 semantics for the preset log
          if (q <= 0) {
            return { ok: false, error: "Expression evaluated to a non-positive number" };
          }
          value = Math.log10(q);
          break;
        }
        case "2^(2^{q})": {
          // astronomically large by design → always cap
          value = clamp;
          break;
        }
      }
  
      if (!Number.isFinite(value)) {
        return { ok: false, error: "Expression did not produce a finite number" };
      }
      if (value <= 0 && !allowNonPositive) {
        return { ok: false, error: "Expression evaluated to a non-positive number" };
      }
      return { ok: true, value };
    }
  
    // 2) user-provided expression (any math.js expression; braces optional)
    try {
      const fn = compileQubitMapping(norm);
      let value = fn(q);
  
      if (!Number.isFinite(value)) {
        // if it blew up, try clamping instead of rejecting
        value = clamp;
      }
  
      if (value <= 0 && !allowNonPositive) {
        return { ok: false, error: "Expression evaluated to a non-positive number" };
      }
  
      return { ok: true, value };
    } catch (e) {
      return { ok: false, error: e?.message || "Parse error" };
    }
  }
  