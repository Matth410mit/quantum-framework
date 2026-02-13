import matplotlib.pyplot as plt
from matplotlib.ticker import FuncFormatter, LogLocator, FormatStrFormatter, MaxNLocator
import numpy as np

import data

# plt.figure()



# x_values, y_values = zip(*size_plqr_ibm_factorization)
# # plt.plot(x_values, y_values, label='IBM PLQR 1024')
# plt.plot(x_values, y_values)
# plt.title('IBM Factorization PLQR')

# plt.show()

# # Extract x and y values
# x_values, y_values = zip(*data.ibm_plqr_1024)

# # Create the plot
# plt.figure(figsize=(10, 6))
# plt.plot(x_values, y_values, linestyle='-', color='b')

# # Set x-axis to logarithmic scale
# plt.xscale("log")
# plt.scatter(264, 2031.2570641748607, color='red', s=100, edgecolors='black', zorder=3, label="Default Value")


# # Formatting
# plt.xlabel("Physical-Logical Qubit Ratio")
# plt.ylabel("Projected Year")
# plt.title("Projected Year for IBM Hardware to Factor a 1024-bit Problem Based on Physical-Logical Qubit Ratio")
# plt.legend()
# plt.grid(True, which="both", linestyle="--", linewidth=0.5)

# # Show the plot
# plt.show()

# Extract x and y values
# x_values1, y_values1 = zip(*data.ibm_plqr_4096)
# x_values2, y_values2 = zip(*data.ionq_plqr_4096)
# x_values3, y_values3 = zip(*data.quera_plqr_4096)

# # Create the plot
# plt.figure(figsize=(10, 6))
# plt.plot(x_values1, y_values1, linestyle='-', color='b', label="IBM")
# plt.plot(x_values1, y_values2, linestyle='-', color='g', label="IonQ")
# plt.plot(x_values1, y_values3, linestyle='-', color='y', label="QuEra")

# # Set x-axis to logarithmic scale
# # plt.xscale("log")
# # plt.scatter(264, 2031.2570641748607, color='black', s=100, edgecolors='black', zorder=3, label="Default Values")
# # plt.scatter(32, 2027.3687826935202, color='black', s=100, edgecolors='black', zorder=3, )
# # plt.scatter(100, 2027.4091886356473, color='black', s=100, edgecolors='black', zorder=3, )


# # Formatting
# plt.xlabel("Physical-Logical Qubit Ratio")
# plt.ylabel("Projected Year")
# plt.title("Projected Year for Quantum Hardware to Factor a 4096-bit Problem Based on Physical-Logical Qubit Ratio")
# plt.legend()
# plt.grid(True, which="both", linestyle="--", linewidth=0.5)

# # Show the plot
# plt.show()

# x_values1, y_values1 = zip(*data.quera_plqr_1024)
# x_values2, y_values2 = zip(*data.quera_plqr_2048)
# x_values3, y_values3 = zip(*data.quera_plqr_4096)

# # Create the plot
# plt.figure(figsize=(10, 6))
# plt.plot(x_values1, y_values1, linestyle='-', color='b', label="n = 1024")
# plt.plot(x_values1, y_values2, linestyle='-', color='g', label="n = 2048")
# plt.plot(x_values1, y_values3, linestyle='-', color='y', label="n = 4096")

# # Set x-axis to logarithmic scale
# # plt.xscale("log")
# # plt.axvline(x=264, color='red', linestyle='--', linewidth=1.5, label="Default Value")



# # Formatting
# plt.xlabel("Physical-Logical Qubit Ratio")
# plt.ylabel("Projected Year")
# plt.title("Projected Year for QuEra Hardware to Factor an n-bit Problem Based on Physical-Logical Qubit Ratio")
# plt.legend()
# plt.grid(True, which="both", linestyle="--", linewidth=0.5)

# # Show the plot
# plt.show()

# x_values, y_values = zip(*data.size_hws_ibm_factorization)
# y_values = [10**y for y in y_values]

# # Create the plot
# plt.figure(figsize=(10, 6))
# plt.plot(x_values, y_values, linestyle='-', color='b')
# formatter = FuncFormatter(lambda x, pos: r'$10^{%d}$' % x)
# plt.gca().xaxis.set_major_formatter(formatter)
# # plt.gca().yaxis.set_major_formatter(formatter)
# # plt.gca().yaxis.set_major_locator(LogLocator(base=10.0, subs=np.arange(2, 10) * 0.1, numticks=10))


# # Set x-axis to logarithmic scale
# # plt.xscale("log")
# # plt.axvline(x=3.78, color='red', linestyle='--', linewidth=1.5, label="Default Value")
# plt.scatter(3.78, 10**2.3056, color='black', s=100, edgecolors='black', zorder=3, label="Default Value")




# # Formatting
# plt.xlabel("Hardware Slowdown")
# plt.ylabel("Projected Problem Size")
# plt.title("Projected Problem Size at QEA for Integer Factorzation on IBM Hardware based on Hardware Slowdown")
# # plt.ylabel("Projected Year")
# # plt.title("Projected Year of QEA for Integer Factorzation on IBM Hardware based on Hardware Slowdown")
# plt.legend()
# plt.grid(True, which="both", linestyle="--", linewidth=0.5)

# # Show the plot
# plt.show()

# names = {"ibm": "IBM", "ionq": "IonQ", "quera": "QuEra"}
# params = {"plqr": "Physical-Logical Qubit Ratio", "rir": "Physical-Logical Qubit Ratio Improvement Rate"}
# sizes = {1024: "1024", 2048: "2048", 4096: "4096"}

# for name in names:
#     for param in params:
#         for size in sizes:
#             instance = f"{name}_{param}_{size}"
#             x_values, y_values = zip(*getattr(data, instance))
#             plt.figure(figsize=(10, 6))
#             plt.plot(x_values, y_values, linestyle='-', color='b')
#             plt.xlabel(params[param])
#             plt.ylabel("Projected Year")
#             plt.title(f"Projected Year for {names[name]} Hardware to Factor a {sizes[size]}-bit Problem Based on {params[param]}")
#             plt.grid(True, which="both", linestyle="--", linewidth=0.5)
#             plotpath = f"plots/{instance}.png"
#             plt.savefig(plotpath, dpi=300, bbox_inches="tight")
#             # plt.show()

names = {"ionq": "IonQ", "quera": "QuEra"}
# problems = {"factorization": "Integer Factorization"}
# params = {
#     "hws": "Hardware Slowdown",
#     "plqr": "Physical-Logical Qubit Ratio",}
# names = {"ibm": "IBM", "ionq": "IonQ", "quera": "QuEra"}
problems = {"factorization": "Integer Factorization", "search": "Database Search", "tsp": "Traveling Salesman Problem"}
params = {
    "hws": "Hardware Slowdown",
    "processors": "Processors",
    "plqr": "Physical-Logical Qubit Ratio",
    "qir": "Quantum Improvement Rate",
    "cir": "Cost Improvement Rate",
    "rir": "Physical-Logical Qubit Ratio Improvement Rate"
    }
outputs = {"size": "Projected Problem Size", "time": "Projected Year"}

formatter = FuncFormatter(lambda x, pos: r'$10^{%d}$' % x)
# Custom formatter: show two decimals unless both are zero
def custom_formatter(x, pos):
    if x == int(x):  # check if the value is effectively an integer
        return f'{int(x)}'
    return f'{x:.2f}'

for name in names:
    for problem in problems:
        for param in params:
            for output in outputs:
                instance = f"{output}_{param}_{name}_{problem}"
                x_values, y_values = zip(*getattr(data, instance))

                plt.figure(figsize=(10, 6))
                if param in {"hws", "processors"}:
                    plt.gca().xaxis.set_major_formatter(formatter)
                if output == "size":
                    if problem != "search":
                        y_values = [10**y for y in y_values]
                    else:
                        plt.gca().yaxis.set_major_formatter(formatter)

                elif output == "time":
                    plt.gca().yaxis.set_major_formatter(custom_formatter)



                plt.plot(x_values, y_values, linestyle='-', color='b')
                plt.xlabel(params[param])
                plt.ylabel(outputs[output])


                plt.title(f"{outputs[output]} of QEA for {problems[problem]} on {names[name]} Hardware based on {params[param]}")
                plt.grid(True, which="both", linestyle="--", linewidth=0.5)
                plotpath = f"plots/{instance}.png"
                plt.savefig(plotpath, dpi=300, bbox_inches="tight")
                plt.close()
                # plt.show()

