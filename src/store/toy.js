import * as math from 'mathjs';

function main() {
    // const result = math.sqrt(16);
    // console.log(`The square root of 16 is ${result}`);
    
    // const expression = '2 * (3 + 4)';
    // const expression = 'log(100, 11)';
    let scope = {
        n: Math.pow(10, 10.66),
        // n: Math.pow(10, 11),
        hws: 3.78
    }
    // console.log(math.evaluate([
    //     'n = 10^{10.66}',
    //     'hws = 3.78',
    //     // 'f * g'
    //   ]))
    // const expression = math.parse('n - log(n, 2) * 10^(hws) * n^(0.5)')
    // const expression = math.parse('log(n, 10) / 2 - hws - log(log(n,2),10)')
    // const code1 = expression.compile()
    // console.log(code1.evaluate(scope))

    // const expression = 'log(n, 10) - hws - log(log(n,2),10)';
    // const evaluated = math.evaluate(expression);
    // console.log(`The result of the expression '${expression}' is ${evaluated}`);


    // Define the original expression
    // const expression = '2 * (3 + 4)';
    // const expression = 'log(n,10)/2-hws - log(log(n,2),10)';
    // const expression = 'n - log(n, 2) * 10^(hws) * n^(0.5)';
    const expression = 'log(n, 2) * 10^(hws) * n^(0.5)';

    // Parse the original expression
    const parsedExpression = math.parse(expression);

    // Create a new expression that is the base-10 logarithm of the original expression
    const logExpression = math.parse(`log10(${parsedExpression.toString()})`);

    // // Evaluate the new expression
    // const evaluated = logExpression.evaluate(scope);

    // console.log(`The original expression is: ${expression}`);
    // console.log(`The parsed expression is: ${parsedExpression.toString()}`);
    // console.log(`The log expression is: ${logExpression.toString()}`);
    // console.log(`The result of the log expression is: ${evaluated}`);


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
    
        // Traverse the parsed expression
        parsedExpression.traverse(processNode);



}



main()