"""
Merges data from multiple CSV sources
"""

import csv
import json
import re
from typing import Dict, List, Optional, Tuple

class ComprehensiveAlgorithmParser:
    def __init__(self, parallel_csv: str, quantum_csv: str, sheet1_csv: str, approx_csv: str):
        self.parallel_csv = parallel_csv
        self.quantum_csv = quantum_csv
        self.sheet1_csv = sheet1_csv
        self.approx_csv = approx_csv
        
    def convert_to_mathjs(self, formula: str) -> Optional[str]:
        """Convert LaTeX/mathematical notation to mathjs format"""
        if not formula or formula.strip() in ['', '-', '?', 'derived']:
            return None
        
        formula = formula.strip()
        
        # Remove LaTeX $ signs
        formula = re.sub(r'\$', '', formula)
        
        # Skip L_n notation (too complex)
        if 'L_n[' in formula or 'L_n\\[' in formula:
            match = re.search(r'exp\(\((.+?)\)\)', formula)
            if match:
                inner = match.group(1)
                inner = re.sub(r'\\?ln\s+n', 'log(n, e)', inner)
                inner = re.sub(r'\(ln n\)', '(log(n, e))', inner)
                inner = re.sub(r'ln\s*n', 'log(n, e)', inner)
                return f"e^({inner})"
            return None
        
        # Skip non-standard parameters
        if any(x in formula for x in ['M^a', 'r(a)', 'T_1', 'TP', 'B \\', 'pi(', 'under assumption', 'p(n)', '2^{(p(n)}']):
            return None
        
        # Convert common patterns
        conversions = [
            # O() notation
            (r'O\((.*?)\)', r'\1'),
            (r'Omega\((.*?)\)', r'\1'),
            (r'Theta\((.*?)\)', r'\1'),
            
            # Exponentials
            (r'\\exp\s*\{([^}]+)\}', r'e^(\1)'),
            (r'\\exp\s*\(([^)]+)\)', r'e^(\1)'),
            (r'exp\s*\(([^)]+)\)', r'e^(\1)'),
            
            # Logarithms
            (r'\\log_2\s*\{([^}]+)\}', r'log(\1, 2)'),
            (r'\\log_2\s*\(([^)]+)\)', r'log(\1, 2)'),
            (r'\\log\s*\{([^}]+)\}', r'log(\1, e)'),
            (r'\\log\s*\(([^)]+)\)', r'log(\1, e)'),
            (r'\\ln\s*\{([^}]+)\}', r'log(\1, e)'),
            (r'\\ln\s*\(([^)]+)\)', r'log(\1, e)'),
            (r'ln\(([^)]+)\)', r'log(\1, e)'),
            (r'ln n', 'log(n, e)'),
            (r'log n', 'log(n, e)'),
            (r'log\(n\)', 'log(n, e)'),
            (r'\\log V', 'log(V, e)'),
            (r'log V', 'log(V, e)'),
            
            # Square roots
            (r'\\sqrt\{([^}]+)\}', r'sqrt(\1)'),
            (r'\\lceil([^\\]+)\\rceil', r'ceil(\1)'),
            
            # Powers  
            (r'\^\{([^}]+)\}', r'^(\1)'),
            (r'\\{', '('),
            (r'\\}', ')'),
            
            # Clean up
            (r'\\', ''),
            (r'\s+', ' '),
        ]
        
        for pattern, replacement in conversions:
            formula = re.sub(pattern, replacement, formula)
        
        formula = formula.strip()
        
        # Replace V with n (for graph algorithms)
        formula = re.sub(r'\bV\b', 'n', formula)
        formula = re.sub(r'\bE\b', 'n^2', formula)
        
        # Final validation - reject if still has complex notation
        if any(x in formula for x in ['\\', '_{', 'under', 'assumption', 'o(1)', 'where']):
            return None
        
        return formula if formula else None
    
    def parse_parallel_classical(self, problem_name: str) -> List[Dict]:
        """Parse parallel classical algorithms"""
        algorithms = []
        
        with open(self.parallel_csv, 'r', encoding='utf-8') as f:
            reader = csv.reader(f)
            headers = next(reader)
            
            name_idx = 1
            algo_name_idx = 17
            variant_idx = 7
            runtime_idx = 27
            work_idx = 31
            
            for row in reader:
                if len(row) > name_idx and row[name_idx].strip() == problem_name:
                    algo_name = row[algo_name_idx].strip() if len(row) > algo_name_idx else ''
                    if algo_name:
                        algorithms.append({
                            'name': algo_name,
                            'variant': row[variant_idx].strip() if len(row) > variant_idx else '',
                            'runtime': row[runtime_idx].strip() if len(row) > runtime_idx else '',
                            'work': row[work_idx].strip() if len(row) > work_idx else '',
                            'parallel': True,
                            'source': 'parallel_algos'
                        })
        
        return algorithms
    
    def parse_sheet1_classical(self, problem_name: str) -> List[Dict]:
        """Parse sequential classical algorithms from Sheet1"""
        algorithms = []
        
        with open(self.sheet1_csv, 'r', encoding='utf-8') as f:
            reader = csv.reader(f)
            headers = next(reader)
            
            name_idx = 1
            algo_name_idx = 14
            variant_idx = 4
            runtime_idx = 28
            quantum_idx = 50
            
            for row in reader:
                if len(row) > name_idx and row[name_idx].strip() == problem_name:
                    is_quantum = row[quantum_idx].strip() if len(row) > quantum_idx else '0'
                    if is_quantum not in ['1', 'Y', 'y', 'Yes']:
                        algo_name = row[algo_name_idx].strip() if len(row) > algo_name_idx else ''
                        if algo_name:
                            runtime = row[runtime_idx].strip() if len(row) > runtime_idx else ''
                            algorithms.append({
                                'name': algo_name,
                                'variant': row[variant_idx].strip() if len(row) > variant_idx else '',
                                'runtime': runtime,
                                'work': runtime,
                                'parallel': False,
                                'source': 'sheet1'
                            })
        
        return algorithms
    
    def parse_approx_classical(self, problem_name: str) -> List[Dict]:
        """Parse approximation/heuristic algorithms from Approx_Algos"""
        algorithms = []
        
        with open(self.approx_csv, 'r', encoding='utf-8') as f:
            reader = csv.reader(f)
            headers = next(reader)
            
            name_idx = 1
            algo_name_idx = 15
            variant_idx = 5
            runtime_idx = 28
            
            for row in reader:
                if len(row) > name_idx and row[name_idx].strip() == problem_name:
                    algo_name = row[algo_name_idx].strip() if len(row) > algo_name_idx else ''
                    if algo_name:
                        runtime = row[runtime_idx].strip() if len(row) > runtime_idx else ''
                        algorithms.append({
                            'name': algo_name,
                            'variant': row[variant_idx].strip() if len(row) > variant_idx else '',
                            'runtime': runtime,
                            'work': runtime,
                            'parallel': False,
                            'approximation': True,
                            'source': 'approx_algos'
                        })
        
        return algorithms
    
    def parse_quantum(self, problem_name: str) -> List[Dict]:
        """Parse quantum algorithms"""
        algorithms = []
        
        with open(self.quantum_csv, 'r', encoding='utf-8') as f:
            reader = csv.reader(f)
            headers = next(reader)
            
            name_idx = 1
            algo_name_idx = 13
            variant_idx = 4
            runtime_idx = 27
            work_idx = 29
            
            for row in reader:
                if len(row) > name_idx and row[name_idx].strip() == problem_name:
                    algo_name = row[algo_name_idx].strip() if len(row) > algo_name_idx else ''
                    if algo_name:
                        algorithms.append({
                            'name': algo_name,
                            'variant': row[variant_idx].strip() if len(row) > variant_idx else '',
                            'runtime': row[runtime_idx].strip() if len(row) > runtime_idx else '',
                            'work': row[work_idx].strip() if len(row) > work_idx else '',
                            'source': 'quantum'
                        })
        
        return algorithms
    
    def create_variant(self, algo: Dict, index: int, algo_type: str) -> Dict:
        """Create variant object from algorithm data"""
        runtime_mathjs = self.convert_to_mathjs(algo['runtime'])
        work_mathjs = self.convert_to_mathjs(algo['work'])
        
        # Handle work formula
        if runtime_mathjs and not work_mathjs:
            if algo_type == 'classical':
                if algo.get('parallel', False):
                    work_mathjs = re.sub(r'\s*/\s*p', '', runtime_mathjs)
                else:
                    work_mathjs = runtime_mathjs
            else:  # quantum
                work_mathjs = f"({runtime_mathjs}) * q"
        
        available = runtime_mathjs is not None and work_mathjs is not None
        
        # Generate key
        name_key = re.sub(r'[^a-z0-9]+', '-', algo['name'].lower())[:50]
        key = f"{name_key}-{index}"
        
        # Estimate metrics
        metrics = self.estimate_metrics(algo['runtime'], algo.get('approximation', False))
        
        description = algo.get('variant', '')[:150] or 'Algorithm variant'
        if algo.get('approximation', False):
            description = f"Approximation/Heuristic: {description}"
        
        variant = {
            'key': key,
            'name': algo['name'][:80],
            'description': description,
            'available': available,
            'runtimeFormula': runtime_mathjs,
            'workFormula': work_mathjs,
            'metrics': metrics,
            'reference': f"Source: {algo['source']} - {algo.get('variant', '')}",
            'parallel': algo.get('parallel', False)
        }
        
        if algo.get('approximation', False):
            variant['approximation'] = True
        
        if not available:
            variant['note'] = f"Formula unavailable - original: {algo['runtime'][:50]}"
        
        return variant
    
    def estimate_metrics(self, runtime: str, is_approximation: bool = False) -> Dict[str, int]:
        """Estimate performance metrics"""
        metrics = {'speed': 2, 'work': 2, 'span': 2, 'space': 2}
        
        runtime_lower = runtime.lower() if runtime else ''
        
        # Approximation algorithms are typically faster but less precise
        if is_approximation:
            metrics['speed'] = 1
        
        if any(x in runtime_lower for x in ['n log n', 'nlog', 'm+n', 'v^2 log v', 'v log v']):
            metrics['speed'] = 1
        elif any(x in runtime_lower for x in ['n^2', 'v^2', 'n^3', 'v^3']):
            metrics['speed'] = 2
        elif any(x in runtime_lower for x in ['2^n', 'e^', 'exp', 'v^2 e']):
            metrics['speed'] = 3
        elif 'sqrt(n)' in runtime_lower or 'n/2' in runtime_lower:
            metrics['speed'] = 1
        
        metrics['work'] = metrics['speed']
        
        return metrics
    
    def parse_problem(self, problem_name: str, names: Dict) -> Optional[Dict]:
        """Parse complete problem from all sources"""
        parallel_name = names.get('parallel')
        sheet1_name = names.get('sheet1')
        approx_name = names.get('approx')
        quantum_name = names.get('quantum')
        
        # Get all classical algorithms
        classical_algos = []
        if parallel_name:
            classical_algos.extend(self.parse_parallel_classical(parallel_name))
        if sheet1_name:
            classical_algos.extend(self.parse_sheet1_classical(sheet1_name))
        if approx_name:
            classical_algos.extend(self.parse_approx_classical(approx_name))
        
        # Get quantum algorithms
        quantum_algos = []
        if quantum_name:
            quantum_algos.extend(self.parse_quantum(quantum_name))
        
        if not classical_algos or not quantum_algos:
            print(f"⚠️  Skipping {problem_name}: Classical={len(classical_algos)}, Quantum={len(quantum_algos)}")
            return None
        
        print(f"✓ {problem_name}: {len(classical_algos)} classical, {len(quantum_algos)} quantum")
        
        classical_variants = [self.create_variant(algo, i, 'classical') for i, algo in enumerate(classical_algos)]
        quantum_variants = [self.create_variant(algo, i, 'quantum') for i, algo in enumerate(quantum_algos)]
        
        return {
            'classical': classical_variants,
            'quantum': quantum_variants
        }

def main():
    parser = ComprehensiveAlgorithmParser(
        'AlgoWiki_algorithms__our_copy__-_Parallel_Algos.csv',
        'AlgoWiki_algorithms__our_copy__-_Quantum_Algorithms.csv',
        'AlgoWiki_algorithms__our_copy__-_Sheet1.csv',
        'AlgoWiki_algorithms__our_copy__-_Approx_Algos.csv'
    )
    
    problems = {
        'Integer Factorization': {
            'parallel': 'Integer Factoring',
            'sheet1': 'Integer Factoring',
            'approx': None,
            'quantum': 'Integer Factoring'
        },
        'Database Search': {
            'parallel': 'String Search',
            'sheet1': 'String Search',
            'approx': 'String Search',
            'quantum': 'String Search'
        },
        'Traveling Salesman': {
            'parallel': None,
            'sheet1': None,
            'approx': 'The Traveling-Salesman Problem',
            'quantum': 'The Traveling-Salesman Problem'
        }
    }
    
    results = {}
    
    print("=== Parsing All Sources (4 CSVs) ===\n")
    
    for problem_name, names in problems.items():
        result = parser.parse_problem(problem_name, names)
        
        if result:
            results[problem_name] = result
            
            classical_available = sum(1 for v in result['classical'] if v['available'])
            quantum_available = sum(1 for v in result['quantum'] if v['available'])
            print(f"  Available: {classical_available}/{len(result['classical'])} classical, {quantum_available}/{len(result['quantum'])} quantum")
            
            # Show breakdown
            classical_parallel = sum(1 for v in result['classical'] if v.get('parallel', False))
            classical_approx = sum(1 for v in result['classical'] if v.get('approximation', False))
            classical_exact = len(result['classical']) - classical_approx
            print(f"  Classical breakdown: {classical_parallel} parallel, {classical_exact - classical_parallel} sequential exact, {classical_approx} approximation\n")
    
    # Save to JSON
    with open('/mnt/user-data/outputs/parsed_algorithms_4sources.json', 'w') as f:
        json.dump(results, f, indent=2)
    
    print(f"\n✓ Parsed {len(results)} problems")
    print(f"✓ Saved to /mnt/user-data/outputs/parsed_algorithms_4sources.json")
    
    # Print summary
    print("\n=== SUMMARY ===")
    for problem_name, data in results.items():
        print(f"\n{problem_name}:")
        print(f"  Total classical: {len(data['classical'])}")
        print(f"  Total quantum: {len(data['quantum'])}")
    
    return results

if __name__ == '__main__':
    main()