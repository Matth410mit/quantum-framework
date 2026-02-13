<script setup>
import katex from 'katex'; 
import 'katex/dist/katex.min.css'; 

const rows = [
  { parameter: 'Problem Size', symbol: 'n', context: 'The parameter used to calculate runtimes and necessary logical qubits.' },
  { parameter: 'Number of Processors', symbol: '10^p', context: 'A factor dividing into the parallelizable classical runtime.' },
  { parameter: 'Classical Runtime', symbol: 'C(n, 10^p)', context: 'A function in terms of problem size and the number of processors.' },
  { parameter: 'Quantum Runtime', symbol: 'Q(n)', context: 'A function in terms of problem size.' },
  { parameter: 'Qubit to Problem Size', symbol: 'QPS', context: 'Function used to calculate the maximum feasible problem size from the number of logical qubits. Its inverse QPS^{-1} is often used.' },
  { parameter: 'Roadmap', symbol: 'R(t)', context: 'Function which outputs the expected number of physical qubits at the given year, considering the means of extrapolation and the growth of the roadmap.' },
  { parameter: 'Hardware Slowdown', symbol: '10^{\\text{hws}}', context: 'The relative slowdown on quantum computers.' },
  { parameter: 'Quantum Improvement Rate', symbol: 'QIR', context: 'The rate at which the hardware slowdown decreases.' },
  { parameter: 'Physical-Logical Qubit Ratio', symbol: 'PLQR', context: 'The number of physical qubits required to represent one logical qubit.' },
  { parameter: 'Physical-Logical Qubit Ratio Improvement Rate', symbol: 'RIR', context: 'The rate at which the physical-logical qubit ratio decreases.' },
  { parameter: 'Connectivity Penalty', symbol: 'P(q)', context: 'A function in terms of the number of logical qubits.' },
  { parameter: 'Cost Improvement Rate', symbol: 'CIR', context: 'The rate at which the number of processors decreases.' }
];


</script>
<template>
    <div class="max-w-prose mx-auto mb-16">
        <p class="text-gray=900 text-justify my-4">The Quantum Economic Advantage Calculator is an extension of the Quantum 
            Tortoise and Classical Hare framework, which defines Quantum Economic Advantage (QEA) as the point where quantum
            hardware can solve a given problem faster than comparably priced classical machines. Users can adjust key 
            inputs—such as hardware speeds, qubit roadmaps, and algorithmic runtimes—to explore how different factors 
            influence the timeline for QEA. The tool then generates visualizations, offering an intuitive way to 
            understand when quantum computing may surpass classical methods for various computational tasks. </p>
        <h2 class="text-2xl font-bold text-gray-800" id="Models"> Models </h2>
        <p class="text-gray=900 text-justify my-4"> A model in the framework refers to a specific
            problem-hardware instance being examined. Each model tracks its own parameters and displays its own
            graphs. </p>
        <p class="text-gray=900 text-justify my-4"> Upon opening the framework, there will be a template model already
            created which is ready to edit. Changing any input to the model will have its effects immediately displayed
            on the corresponding graphs (unless the parameter was changed in a popup menu in which case the user must
            hit save). </p>
        <h3 class="text-xl font-bold text-gray-800 mt-8" id="Simple vs Advanced View"> Simple vs Advanced View </h3>
        <p class="text-gray=900 text-justify my-4"> There are two ways of displaying a model on the user interface. The
            first is a simple view in which only the two major inputs of problem and hardware can be seen and selected.
            All the graphs are still visible and this view allows for easy comparison between them across multiple
            models. The second option is an advanced view in which the user is able to freely manipulate all variables
            associated with the computation of the graphs. It is more complex and may overwhelm the user if they are not
            too familiar with quantum hardware so the framework shows the simple view by default and allows users to
            choose their own level of involvement with the additional parameters. </p>
        <p class="text-gray=900 text-justify my-4"> Something worth noting is that two separate models could have the
            same options selected for problem and hardware, yet have very different choices for the remaining
            parameters. This could result in two models with the same options visible for their simple views but with
            drastically different graphs. </p>
        <h2 class="text-2xl font-bold text-gray-800" id="Inputs"> Inputs </h2>
        <p class="text-gray=900 text-justify my-4"> Each input into the models can be classified as either related to
            the problem or the hardware. We will refer to the problem and roadmap inputs themselves as major inputs and
            the inputs dependent on them as minor inputs. Each selectable option for the major inputs has default values
            for all of its corresponding minor inputs; as a result, changing a model's major inputs will automatically
            override the values of all its associated minor inputs. Changing a minor input has no effect on the other
            parameters. </p>
        <h3 class="text-xl font-bold text-gray-800 mt-8" id="Problem Inputs"> Problem Inputs </h3>
        <h4 class="text-lg font-medium text-gray-800 mt-8" id="Problem"> Problem </h4>
        <p class="text-gray=900 text-justify my-4"> 
            The problems serve as a primary input to the framework, determining the classical and quantum runtimes 
            under comparison. The tool provides preset options for users to explore, such as integer factorization, 
            unstructured database search, and the traveling salesman problem, each reflecting the best-known 
            worst-case time complexities for their respective algorithms.
        </p>
        
        <p class="text-gray=900 text-justify my-4"> 
            Classical runtimes are expressed as functions of both <span v-html="katex.renderToString('n')"></span> 
            (problem size) and <span v-html="katex.renderToString('p')"></span> (number of processors). We denote 
            these runtimes as <span v-html="katex.renderToString('C(n,p)')"></span> and quantum runtimes as 
            <span v-html="katex.renderToString('Q(n)')"></span>.
            In addition to the preset options, users can fully customize these runtime expressions, adjusting both 
            classical and quantum runtimes or defining new ones entirely. This flexibility allows stakeholders to 
            test hypotheses — for example, exploring how an optimistic projection of quantum runtimes impacts the 
            projected timeline for quantum economic advantage.
        </p>
        <p class="text-gray=900 text-justify my-4"> 
            Notably, while increasing <span v-html="katex.renderToString('p')"></span> reduces runtime, the total 
            computational effort, or "classical work," remains unchanged. The classical work is defined as the 
            runtime with a single processor, <span v-html="katex.renderToString('C(n,1)')"></span>, representing 
            the total number of operations required.
        </p>
        <h4 class="text-lg font-medium text-gray-800 mt-8" id="Qubit To Problem Size"> Qubit To Problem Size </h4>
        <p class="text-gray=900 text-justify my-4"> Qubit to Problem Size (QPS) is a function which maps logical qubits
            to the maximum problem size achievable with said amount of qubits. The inverse of this function
            (<span v-html="katex.renderToString('\\text{QPS}^{-1}')"></span>) is also used in some calculations. </p>
        <h3 class="text-xl font-bold text-gray-800 mt-8" id="Hardware Inputs"> Hardware Inputs </h3>
        <h4 class="text-lg font-medium text-gray-800 mt-8" id="Roadmap"> Roadmap </h4>
        <p class="text-gray=900 text-justify my-4"> 
            The primary hardware input is which quantum roadmap the tool will use to extrapolate the number of 
            available qubits. The calculator allows users to modify the existing roadmaps directly. Qubit-year 
            pairs can be adjusted to align with different expectations, and entirely new points can be added to 
            the projection. If a pessimistic user is confident that quantum devices will not exceed a certain 
            amount of physical qubits by a certain year, they have the freedom to update points in the roadmap and
            all calculations will automatically update to reflect the slower growth.
        </p>
        <p class="text-gray=900 text-justify my-4"> 
            By default, the tool estimates exponential growth for the roadmaps. When predicting the number of 
            available qubits, the tool interpolates values between existing points exponentially and extrapolates 
            beyond the final data points using the same growth rate. Users can also choose linear growth instead, 
            in which case the tool interpolates and extrapolates linearly.
        </p>
        <p class="text-gray=900 text-justify my-4"> 
            These projections for physical qubits are ultimately used to estimate the number of logical qubits, 
            which then feed into further calculations. Alternatively, users can bypass this step by directly 
            inputting a roadmap for logical qubits. In this case, the tool extrapolates the number of logical 
            qubits directly from the user-defined points, skipping the intermediary calculations involving physical-logical qubit ratios.
        </p>
        <h4 class="text-lg font-medium text-gray-800 mt-8" id="Hardware Slowdown"> Hardware Slowdown </h4>
        <p class="text-gray=900 text-justify my-4"> 
            Hardware slowdown, as previously described, refers to the number of operations a classical computer 
            can perform in the time it takes a comparably priced quantum computer to perform a single operation. 
            Since this factor can vary across a wide range and span multiple orders of magnitude, users input this 
            value logarithmically, as a power of 10.
        </p>
        <p class="text-gray=900 text-justify my-4"> 
            The hardware slowdown parameter can be directly input into the calculator. However, the framework also 
            allows users to compute this value by specifying the individual factors that contribute to it. In the 
            original framework, hardware slowdown was expressed as the product of three factors:

            <ol>
                <li> Speed Ratio: The ratio of the speed of a classical computer to that of the quantum computer. </li>
                <li> Gate Overhead: A factor representing the additional gates (operations) required to maintain fault tolerance. </li>
                <li> Algorithmic Constant Ratio: The ratio of the multiplicative constant from the classical algorithm's runtime to that of the quantum algorithm's. </li>
            </ol>
        </p>
        <p class="text-gray=900 text-justify my-4"> 
            With the expressive freedom our tool grants users when inputting problem runtimes, the algorithmic 
            constant ratio is now a redundant parameter, but has remained in the model because of its historical 
            presence. Given these advancements, only the speed ratio and gate overhead are now essential for 
            the calculation.
        </p>
        <p class="text-gray=900 text-justify my-4"> 
            Like the hardware slowdown, the speed ratio can either be entered directly into the calculator or 
            calculated from individual factors. Users can provide the 2-qubit gate time of the quantum computer 
            and the clock speed of the classical device. The speed ratio is computed by comparing the classical clock 
            speed by the quantum 2-qubit gate time, giving a direct comparison of how many classical operations can be 
            executed in the time it takes for a single quantum cycle.
        </p>
        <h4 class="text-lg font-medium text-gray-800 mt-8" id="Quantum Improvement Rate"> Quantum Improvement Rate </h4>
        <p class="text-gray=900 text-justify my-4"> 
            The quantum improvement rat (QIR) represents this framework's method of modeling changes in the hardware 
            slowdown over time, expressed as the percentage improvement year-to-year. (In the calculator, improvement 
            rates are expressed as negative values.)
            
            QIR is used to calculate the annual reduction in the hardware slowdown. Representing the hardware 
            slowdown in its linear form as <span v-html="katex.renderToString('S_t = 10^{\\text{hws}_t}')"></span>, 
            its change over time can be modeled by:
            
            
        </p>
        <p class="text-gray=900 text-center my-4"> 
            <span v-html="katex.renderToString('S_{t+1} = S_t * (1 - \\frac{qir}{100})')"></span>
        </p>
        <p class="text-gray=900 text-justify my-4"> 
            Users are also free to assume that quantum devices are becoming relatively slower over time, though 
            this represents a rather pessimistic outlook.
        </p>
        
        <h4 class="text-lg font-medium text-gray-800 mt-8" id="Physical-Logical Qubit Ratio"> Physical-Logical Qubit Ratio </h4>
        <p class="text-gray=900 text-justify my-4"> The physical-logical qubit ratio (PLQR) represents how many physical 
            qubits are needed to encode a single logical qubit. Its value can be directly input into the calculator. 
        </p>
        <h4 class="text-lg font-medium text-gray-800 mt-8" id="Physical-Logical Qubit Ratio Improvement Rate"> Physical-Logical Qubit Ratio Improvement Rate</h4>
        <p class="text-gray=900 text-justify my-4"> 
            Just as the hardware slowdown evolves based on the quantum improvement rate, the PLQR is influenced by the 
            physical-logical qubit ratio improvement rate (RIR). This adjustment is input and calculated in the same 
            manner as the quantum improvement rate. The decay of PLQR is limited to a minimum value of 3, 
            reflecting the constraints imposed by the most basic error correction schemes.
        </p>
        <h4 class="text-lg font-medium text-gray-800 mt-8" id="Connectivity Penalty"> Connectivity Penalty</h4>
        <p class="text-gray=900 text-justify my-4"> 
            Connectivity refers to the arrangement of interactions between qubits within a quantum system, often 
            represented as a qubit interaction graph, where vertices correspond to qubits and edges denote 
            allowable direct interactions. In practice, not all qubits in a quantum device can interact 
            directly, and this limited connectivity imposes constraints on quantum algorithm design.
        </p>
        <p class="text-gray=900 text-justify my-4"> 
            In the framework, connectivity overhead is modeled as a multiplicative penalty on the quantum runtime.
            Since the relationship between circuit connectivity and runtime is complex, this parameter 
            was designed to be as freely customizable as the runtimes themselves. The tool accepts expressions in terms of <span v-html="katex.renderToString('q')"></span>, 
            allowing users to adjust connectivity penalties to reflect the specific constraints of their quantum hardware.
        </p>
        <h4 class="text-lg font-medium text-gray-800 mt-8" id="Processors">Processors</h4>
        <p class="text-gray=900 text-justify my-4"> 
            This input represents the number of processors <span v-html="katex.renderToString('10^p')"></span> that would exist in a classical machine that is 
            comparably priced to the quantum one being considered. The number of processors reduces the classical 
            runtime as dictated by its expression. Like the hardware slowdown, it is input logarithmically.
        </p>
        <h4 class="text-lg font-medium text-gray-800 mt-8" id="Cost Improvement Rate">Cost Improvement Rate</h4>
        <p class="text-gray=900 text-justify my-4"> 
            The cost improvement rate (CIR) captures the relative rates of cost reduction for quantum and classical 
            operations over time. Specifically, it is defined as the ratio of the annual rates of change in the 
            costs of quantum and classical operations. For instance, if quantum costs decrease at a rate of 
            30% per year (0.7 multiplier), while classical costs decrease at a rate of 20% per year 
            (0.8 multiplier), the ratio of change would be 7/8. This implies that quantum costs improve at an 
            effective rate of approximately 12.5% per year relative to classical costs.
        </p>
        <p class="text-gray=900 text-justify my-4"> 
            While performance improvements influence the hardware slowdown associated with quantum runtimes 
            in the model, cost reductions primarily determine the number of classical processors that 
            can be leveraged to speed up classical runtimes. If quantum costs decline more rapidly than 
            classical costs, the cost-equivalent classical system becomes smaller over time, as fewer 
            classical processors can be purchased for the same budget. Consequently, in the tool, the 
            number of classical processors dividing into the classical runtime decreases each year. Both 
            cost and performance improvements ultimately impact the problem size required for algorithmic 
            advantage. This assumption applies when quantum costs are improving faster than classical 
            costs, though users have the flexibility to modify or disregard it if needed.
        </p>

        <h2 class="text-2xl font-bold text-gray-800" id="Calculations">Calculations</h2>
        <p class="text-gray=900 text-justify my-4"> 
        With all of the calculator’s inputs introduced, we can finally discuss how the tool calculates its findings.
        Before we dive into the mathematics, let us present the table below showing how each input is expressed in the equations.
        </p>
        <div class="overflow-x-auto mt-6">
        <table class="table-auto w-full border-collapse border border-gray-300">
            <thead>
            <tr class="bg-gray-200">
                <th class="border border-gray-300 px-4 py-2">Parameter</th>
                <th class="border border-gray-300 px-4 py-2">Symbolic Representation</th>
                <th class="border border-gray-300 px-4 py-2">Context</th>
            </tr>
            </thead>
            <tbody>
            <tr v-for="(row, index) in rows" :key="index">
                <td class="border border-gray-300 px-4 py-2">{{ row.parameter }}</td>
                <td class="border border-gray-300 px-4 py-2">
                <span v-html="katex.renderToString(row.symbol)"></span>
                </td>
                <td class="border border-gray-300 px-4 py-2">{{ row.context }}</td>
            </tr>
            </tbody>
        </table>
        </div>
        <p class="text-gray=900 text-justify my-4"> 
            The framework calculates the minimum problem size needed for algorithmic advantage. This is the smallest problem 
            size (<span v-html="katex.renderToString('n^*')"></span>) such that the runtime on quantum hardware is faster than the runtime on classical hardware.
            The expression for determining <span v-html="katex.renderToString('n^*')"></span> is:
        </p>
        <p class="text-gray=900 text-center my-4"> 
            <span v-html="katex.renderToString('n^* = n \\text{ }|\\text{ } C(n, 10^p) = 10^{\\text{hws}} \\cdot Q(n) \\cdot P(\\text{QPS}^{-1}(n))')"></span>
        </p>
        <p class="text-gray=900 text-justify my-4"> 
            This expression finds the problem size such that quantum devices, including connectivity penalties and hardware slowdowns,
            are comparable to classical devices' runtimes, including parallelization. Note this expression calculates the current 
            problem size needed for algorithmic advantage. The framework also incorporates the improvement of variables over time,
            with the trend of the required <span v-html="katex.renderToString('n^*')"></span> forming the advantage line in the QEA graph.
            The generic expression for the advantage line given a year <span v-html="katex.renderToString('t')"></span> (which we'll label Adv()) becomes:
        </p>
        <p class="text-gray=900 text-center my-4"> 
            <span v-html="katex.renderToString('\\text{Adv}(t) = n \\text{ }|\\text{ } C(n, 10^p * (1 + \\text{CIR} / 100)^{t - t_0}) = 10^{\\text{hws}} * (1 + \\text{QIR} / 100)^{t - t_0} * Q(n) * P(\\text{QPS}^{-1}(n))')"></span>
        </p>
        <p class="text-gray=900 text-justify my-4"> 
            where <span v-html="katex.renderToString('t_0')"></span> is the current year. The calculator also models feasibility
            over time. Given a selected roadmap, which includes the number of qubits achieved at target years and the desired
            extrapolation method, the tool calculates the maximum feasible problem size for each year. It also considers how
            many physical qubits are needed for logical qubits, their expected rate of change, and the conversion from logical
            qubits to the maximum solvable problem size. Using these factors, the framework computes the maximum feasible problem
            size at a given year <span v-html="katex.renderToString('t')"></span> (denoted as Feas(t)) as:
        </p>
        <p class="text-gray=900 text-center my-4"> 
            <span v-html="katex.renderToString('\\text{Feas}(t) = \\text{QPS}\\left(\\frac{R(t)}{\\text{PLQR} * (1 + \\text{RIR} / 100)^{t - t_0}}\\right)')"></span>
        </p>
        <p class="text-gray=900 text-justify my-4"> 
            With these formulations for how the problem size needed for advantage and the maximum feasible problem size 
            change over time, we can express the time of Quantum Economic Advantage as their intersection. That is:
        </p>
        <p class="text-gray=900 text-center my-4"> 
            <span v-html="katex.renderToString('t^* = t \\text{ }|\\text{ } \\text{Feas}(t) = \\text{Adv}(t)')"></span>
        </p>

        <h2 class="text-2xl font-bold text-gray-800" id="Cost Advantage"> Cost Advantage </h2>

        <p class="text-gray=900 text-justify my-4">
            All of the insights provided by the calculator so far have been focused on determining when a specific 
            instance of an algorithm would execute faster on equivalently priced quantum hardware compared to 
            classical hardware. The calculator also provides the ability to determine when certain algorithms 
            will become cheaper to execute on quantum hardware, even if this might take longer. This is achieved 
            by adapting the previous expressions with new variables.
        </p>

        <h3 class="text-xl font-bold text-gray-800 mt-8" id="Cost Inputs"> Cost Inputs </h3>
        <p class="text-gray=900 text-justify my-4">
            For speed comparisons, the tool evaluates quantum and classical hardware by comparing their runtimes, 
            factoring in a hardware slowdown. For cost comparisons, the tool assesses the total computational 
            effort required by each hardware, where the computational effort corresponds to the total number of 
            operations required to complete the computation. These operations are directly related to the original 
            problem's runtimes.
        </p>

        <p class="text-gray=900 text-justify my-4">
            Classical work (<span v-html="katex.renderToString('C_w')"></span>) is defined as the number of operations associated 
            with the classical runtime when evaluated using a single processor. By default, classical work is 
            evaluated as <span v-html="katex.renderToString('C(n, 1)')"></span>, but users have complete flexibility to change it to a different expression.
        </p>

        <p class="text-gray=900 text-justify my-4">
            Quantum runtime reflects the depth of the circuit implementing the algorithm. To quantify the total 
            computational effort, quantum work (<span v-html="katex.renderToString('Q_w')"></span>) is defined as the product of the runtime and the 
            number of logical qubits involved in the computation. Quantum work is expressed using an additional 
            variable <span v-html="katex.renderToString('q')"></span>, which represents the number of logical qubits. By default, quantum work is the 
            product of the quantum runtime and <span v-html="katex.renderToString('q')"></span>. The value of <span v-html="katex.renderToString('q')"></span> used in the expression is 
            <span v-html="katex.renderToString('QPS^{-1}(n)')"></span>, reflecting how the required number of qubits changes with problem size.
        </p>

        <p class="text-gray=900 text-justify my-4">
            The final adjustment for cost comparison involves incorporating the cost factor (<span v-html="katex.renderToString('10^{\\text{cf}}')"></span>), 
            which represents how much more expensive it is to perform operations on a quantum machine compared 
            to a classical one. This cost factor is analogous to the hardware slowdown for speed and is input 
            logarithmically. The cost factor can also vary over time, changing at a rate determined by the 
            cost improvement rate.
        </p>

        <h3 class="text-xl font-bold text-gray-800 mt-8" id="Cost Calculations"> Cost Calculations </h3>
        <p class="text-gray=900 text-justify my-4">
            The minimum problem size at which quantum computation becomes cheaper can be determined using 
            the following expression:
        </p>
        <p class="text-gray-900 text-center my-4" v-html="katex.renderToString('n_c^* = n \\text{ }|\\text{ } C_w(n) = 10^{\\text{cf}} * Q_w(n, \\text{QPS}^{-1}(n)) * P(\\text{QPS}^{-1}(n))')"></p>

        <p class="text-gray=900 text-justify my-4">
            The trend in <span v-html="katex.renderToString('n_c^*')"></span> over time defines the cost advantage, which is expressed as <span v-html="katex.renderToString('\\text{Adv}_c(t)')"></span>:
        </p>

        <p class="text-gray-900 text-center my-4">
            <span v-html="katex.renderToString('\\text{Adv}_c(t) = n \\text{ }|\\text{ } C_w(n) = 10^{\\text{cf}} * (1 + \\text{CIR} / 100)^{t - t_0} * Q_w(n, \\text{QPS}^{-1}(n)) * P(\\text{QPS}^{-1}(n))')"></span>
        </p>


        <p class="text-gray=900 text-justify my-4">
            Since feasibility is not affected by cost considerations, the time at which it becomes cheaper 
            to perform the problem on quantum hardware is determined by the intersection of 
            <span v-html="katex.renderToString('\\text{Adv}_c(t)')"></span> and <span v-html="katex.renderToString('\\text{Feas}(t)')"></span>:
        </p>

        <p class="text-gray-900 text-center my-4" v-html="katex.renderToString('t_c^* = t \\text{ }|\\text{ } \\text{Feas}(t) = \\text{Adv}_c(t)')"></p>
    


        <!-- <h2 class="text-2xl font-bold text-gray-800" id="Graphs"> Graphs </h2>
        <h3 class="text-xl font-bold text-gray-800 mt-8" id="Minimum Problem Size for Quantum Algorithmic Advantage"> Minimum Problem Size for Quantum Algorithmic Advantage </h3>
        <p class="text-gray=900 text-justify my-4"> This graph plots both the classical and quantum runtimes with
            problem size on the x-axis and classical time steps on the y-axis. It's purpose is to visualize the minimum
            problem size such that the quantum algorithm (including the penalty and hardware slowdown) would take less
            time to run than the classical counterpart. We denote said problem size with <span
                v-html="katex.renderToString('n^*')"></span> which occurs when the
            runtime trajectories intersect in the graph. Or mathematically, <span
                v-html="katex.renderToString('n^*')"></span> is the smallest problem size (n) such
            that </p>

        <p class="text-gray=900 text-center my-4 text-sm">

            <span v-html="katex.renderToString('C(n) = Q(n) * \\text{Penalty}(n) * \\text{hws}')"></span>
        </p>
        <h3 class="text-xl font-bold text-gray-800 mt-8" id="Economic Advantage of Quantum Computing"> Economic Advantage of Quantum Computing </h3>
        <p class="text-gray=900 text-justify my-4"> This graph answers perhaps the most important information in the
            framework: when will the problem become economically advantageous to run on quantum hardware? The x- and
            y-axes are time (in years) and problem size respectively. The two lines plotted are called the feasibility
            line (<span v-html="katex.renderToString('\\text{Feas}(t)')"></span>) and the quantum advantage line
            (<span v-html="katex.renderToString('\\text{Adv}(t)')"></span>). </p>
        <p class="text-gray=900 text-justify my-4"> The feasibility line represents how the maximum achievable problem
            size on the hardware increases over time. That is, all points which lie below this curve on the graph could
            have their problem sizes executed on the quantum hardware (although it might not yet be efficient to do so).
            This is influenced by the roadmap's trajectory of physical qubits, the value/rate of the physical to logical
            qubit ratio, and the function mapping logical qubits to problem sizes. If we denote the amount of physical
            qubits expected from a roadmap at year <span v-html="katex.renderToString('t')"></span> as the function <span v-html="katex.renderToString('R(t)')"></span>, we can express <span
                v-html="katex.renderToString('\\text{Feas}(t)')"></span> as
        </p>

        <p class="text-gray=900 text-center my-4 text-sm">

            <span
                v-html="katex.renderToString('\\text{Feas}(t) = \\text{QPS}(\\frac{R(t)}{PLQR * (1 - \\frac{rir}{100})^{t - 2024}})')"></span>
        </p>
        <p class="text-gray=900 text-justify my-4"> (Note that the year
            2024 is included into the equation because we assume PLQR is the value for the current year. The equation
            could be made more general by replacing it with an additional variable denoting the current year.) </p>
        <p class="text-gray=900 text-justify my-4"> The quantum advantage line represents how the minimum problem size
            to achieve advantage diminishes over time (although the size could actually increase if the quantum
            improvement rate is negative). All points which lie above this line would be advantageous to run on a
            quantum device (although it might not yet be possible to do so). Similar to how the first graph finds <span
                v-html="katex.renderToString('n^*')"></span>,
            this function plots the value of <span v-html="katex.renderToString('n^*')"></span> as the hardware slowdown
            changes over time. </p>
        <p class="text-gray=900 text-center my-4 text-sm">

            <span
                v-html="katex.renderToString('\\text{Adv}(t) = n \text{ }|\\text{ } C(n) = Q(n) * \\text{Penalty}(n) * \\text{hws} * (1 - \\frac{qir}{100})^{t-2024}')"></span>
        </p>
        <p class="text-gray=900 text-justify my-4"> The area above the feasibility represents problem sizes that are
            still too large for the progress of quantum devices in said year. The area below the advantage line
            represents problem sizes that are too small to actually achieve a practical advantage for said year. Once
            these two lines intersect, the area contained between them then represents the space of problem sizes which
            are both feasible and advantageous for quantum computers. This intersection occurs at the year <span
                v-html="katex.renderToString('t^*')"></span> such
            that <span v-html="katex.renderToString('\\text{Feas}(t) = \\text{Adv}(t)')"></span> , or equivalently: </p>
        <p class="text-gray=900 text-center my-4 text-sm">

            <span
                v-html="katex.renderToString(' n \\text{ }|\\text{ } (C(n) = Q(n) * \\text{Penalty}(n) * \\text{hws} * (1 - \\frac{qir}{100})^{t-2024}) = \\text{QPS}(\\frac{R(t)}{PLQR * (1 - \\frac{rir}{100})^{t - 2024}})')"></span>
        </p>

        <h3 class="text-xl font-bold text-gray-800 mt-8" id="Logical Qubit Quantum Economic Advantage"> Logical Qubit Quantum Economic Advantage </h3>
        <p class="text-gray=900 text-justify my-4"> This graph provides practically the same information as the previous
            one except in terms of different units. Whereas the previous graph plotted problem size over time, this one
            graphs logical qubits over time. The year marking the start of quantum economic advantage will remain
            exactly the same, but users are now able to see the trajectories in terms of logical qubits if they were
            more interested in that metric instead. Formally, the feasiblity line plotted would be <span
                v-html="katex.renderToString('\\text{QPS}^{-1}(\\text{Feas}(t))')"></span>
            and the advantage line would be <span
                v-html="katex.renderToString('\\text{QPS}^{-1}(\\text{Adv}(t))')"></span>. (Note
            that the former evaluates to an expression of the form <span
                v-html="katex.renderToString('\\text{QPS}^{-1}(\\text{QPS}(\\dots))')"></span> which
            mathemetically makes the two function calls useless, however since the <span
                v-html="katex.renderToString('\\text{QPS}(\\dots)')"></span> must be computed
            regardless, both computations are still performed in the framework. The results are the same to several
            decimal points as if no transformation had been done to the data.) </p> -->
    </div>
</template>