import sympy as sp

def solve(classical, quantum, hardware_slowdown):

    classical = sp.simplify(classical)
    quantum = sp.simplify(quantum)
    hardware_slowdown = sp.simplify(hardware_slowdown)


    n = sp.symbols('n')
    solutions = sp.solve((classical) - ((quantum) * (hardware_slowdown)), n)
    solutions = [sp.N(solution) for solution in solutions]
    solutions = [float(solution) for solution in solutions if solution.is_real]
    solutions.sort()
    return solutions

def is_valid(expr):
    try:
        n = sp.symbols('n')
        sympy_expr = sp.sympify(expr)
        for sub_expr in sympy_expr.atoms(sp.Function):
            if isinstance(sub_expr, sp.core.function.AppliedUndef):
                return False

        return sympy_expr.free_symbols == {n} or sympy_expr.free_symbols == set()
    except sp.SympifyError:
        return False    

def get_points(expr, midPoint):
    points = []
    n = sp.symbols('n')
    for i in range(0, 200):
        x = midPoint ** (i / 100)
        y = sp.sympify(expr).subs(n, x)
        points.append([float(x), float(y)])
    return points

def get_quantum_advantage_data(classical, quantum, hardware_slowdown):
    validation = [is_valid(classical), is_valid(
        quantum), is_valid(hardware_slowdown)]
    if False in validation:
        return None
    solutions = solve(classical, quantum, hardware_slowdown)
    nStar = 1
    if len(solutions) > 0:
        nStar = solutions[-1]
    midPoint = nStar if nStar > 1 and nStar < sp.oo else 1000000000000

    classical_points = get_points(classical, midPoint)

    quantum = sp.simplify(quantum)
    hardware_slowdown = sp.simplify(hardware_slowdown)
    quantumXHardware = sp.simplify(quantum * hardware_slowdown)
    quantum_points = get_points(quantumXHardware, midPoint)
    return {
        "nStar": nStar,
        "classical": classical_points,
        "quantum": quantum_points
    }

def get_quantum_economic_advantage_data(classical, quantum, hw, hw_ratio, physical_qubits0):
    classical = sp.simplify(classical)
    quantum = sp.simplify(quantum)
    hw = sp.simplify(hw)


    n = sp.symbols('n')
    t = sp.symbols('t')
    solutions = sp.solve((classical) - ((quantum) * (hw)), n)
    
    

