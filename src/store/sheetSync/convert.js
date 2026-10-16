/**
 * Turns the sheet's complexity text (LaTeX-ish, e.g. "$O(V^2 2^V)$" or
 * "O(sqrt(n)*logn)") into a mathjs formula in n.
 *
 * convertComplexity(text, { vars, constants, allowP, bitsInExponent })
 *   -> { formula, assumptions } when usable
 *   -> { reason } when not (the reason is shown in the sync report)
 *
 * Conventions: log means log base 2 (computer-science convention, and the one
 * the sheet's Time Encoding functions use); ln is the natural log.
 */

import * as math from 'mathjs';

const FUNCTIONS = new Set(['log', 'log2', 'ln', 'lg', 'sqrt', 'exp', 'min', 'max', 'ceil', 'floor']);
const NAMED_CONSTANTS = new Set(['e', 'pi']);

// Greek letters and LaTeX names -> single symbols
const GREEK = [
    [/\\varepsilon|\\epsilon|ε|\beps(?:ilon)?\b/g, 'ε'],
    [/\\omega|ω/g, 'ω'],
    [/\\kappa|κ/g, 'κ'],
    [/\\alpha|α/g, 'α'],
    [/\\sigma|σ/g, 'σ'],
    [/\\delta|δ/g, 'δ'],
    [/\\lambda|λ/g, 'λ'],
    [/\\mu|μ/g, 'μ'],
    [/\\eta|η/g, 'η'],
    // Unicode fractions
    [/½/g, '(1/2)'],
    [/⅓/g, '(1/3)'],
    [/⅔/g, '(2/3)'],
    [/¼/g, '(1/4)'],
    [/¾/g, '(3/4)'],
];

// Index of the parenthesis that closes the one at `open`, or -1.
function matchParen(s, open) {
    let depth = 0;
    for (let i = open; i < s.length; i++) {
        if (s[i] === '(') depth++;
        else if (s[i] === ')') {
            depth--;
            if (depth === 0) return i;
        }
    }
    return -1;
}

// Replace every `NAME(...)` wrapper with its contents (e.g. O(...) -> ...).
function unwrap(s, name) {
    const re = new RegExp(`(^|[^A-Za-z_])${name}\\(`);
    let m;
    while ((m = re.exec(s))) {
        const start = m.index + m[1].length;
        const open = start + name.length;
        const close = matchParen(s, open);
        if (close === -1) {
            s = s.slice(0, start) + s.slice(open); // unbalanced: drop the name and keep going
            continue;
        }
        s = s.slice(0, start) + '(' + s.slice(open + 1, close) + ')' + s.slice(close + 1);
    }
    return s;
}

// \frac{a}{b} -> ((a)/(b)), braces assumed balanced
function replaceFrac(s) {
    let i;
    while ((i = s.indexOf('\\frac{')) !== -1) {
        const aStart = i + 6;
        let depth = 1, j = aStart;
        for (; j < s.length && depth; j++) depth += s[j] === '{' ? 1 : s[j] === '}' ? -1 : 0;
        const a = s.slice(aStart, j - 1);
        if (s[j] !== '{') return s.replace('\\frac', '');
        const bStart = j + 1;
        depth = 1;
        let k = bStart;
        for (; k < s.length && depth; k++) depth += s[k] === '{' ? 1 : s[k] === '}' ? -1 : 0;
        const b = s.slice(bStart, k - 1);
        s = s.slice(0, i) + `((${a})/(${b}))` + s.slice(k);
    }
    return s;
}

// Text clean-up into something close to a mathjs expression.
function normalize(raw, assumptions) {
    let s = String(raw);

    // Prefer the specific bound when the sheet gives a vague one first.
    const specific = s.match(/more specifically:?\s*(.*)$/is);
    if (specific) s = specific[1];

    // The formula is usually between $...$; anything after it is commentary.
    const dollars = s.match(/\$([^$]+)\$/);
    if (dollars) s = dollars[1];

    s = s.replace(/<br\s*\/?>/gi, '\n').split('\n')[0];
    s = s.replace(/^[\s<≤~≈]+/, '').trim();

    // O-notation variants
    if (/\\tilde\{?O|\\tilda\s*O|Õ|O˜|O~|\\widetilde\{?O/.test(s)) assumptions.add('Ignores polylog factors (Õ).');
    s = s.replace(/\\widetilde\{O\}|\\tilde\{O\}|\\tildaO|\\tilda\s*O|Õ|O˜|O~/g, 'O');
    if (/O\^\{?\*\}?/.test(s)) assumptions.add('Ignores polynomial factors (O*).');
    s = s.replace(/O\^\{?\*\}?/g, 'O');
    s = s.replace(/\\mathcal\{O\}/g, 'O').replace(/\\Theta|Θ/g, 'O').replace(/\\left|\\right|\\!|\\,|\\;/g, '');

    for (const [re, sym] of GREEK) s = s.replace(re, sym);

    // o(1) terms in exponents and constants
    if (/o\(1\)/.test(s)) assumptions.add('Drops o(1) terms.');
    s = s.replace(/\(\s*(\d+(?:\.\d+)?)\s*\+\s*o\(1\)\s*\)/g, '$1');
    s = s.replace(/\s*\+\s*o\(1\)/g, '');

    s = replaceFrac(s);
    s = s.replace(/\\sqrt\[(\d+)\]\{([^{}]*)\}/g, '(($2)^(1/$1))');
    s = s.replace(/\\(log|ln|lg|exp|sqrt|min|max|text|mathrm|operatorname)\b/g, '$1');
    s = s.replace(/(?:text|mathrm|operatorname)\{([^{}]*)\}/g, '$1');
    s = s.replace(/\\cdot|\\times|·|×/g, '*');
    s = s.replace(/\\lceil|\\rceil|\\lfloor|\\rfloor/g, '');
    s = s.replace(/[{]/g, '(').replace(/[}]/g, ')');
    s = s.replace(/\\/g, '');
    s = s.replace(/−/g, '-');

    // separate glued function names ("nlog n", "loglogn") from what precedes them
    s = s.replace(/(log|ln|lg|sqrt|exp|min|max)/g, ' $1');
    s = s.replace(/\b(log|ln|lg|sqrt|exp|min|max)\s+\(/g, '$1(');
    s = s.replace(/\bsqrt\s*([A-Za-z0-9.]+)\b(?!\s*\()/g, 'sqrt($1)');

    // log bases: log_2 x, log_{2} x -> lg
    s = s.replace(/log_\(?2\)?/g, 'lg');
    // log^k(x), log^k x -> (log(x))^k
    s = s.replace(/\b(log|lg|ln)\s*\^\s*\(?([0-9.]+)\)?\s*\(/g, (_, f, k) => `${f}^${k}(`);
    s = s.replace(/\b(log|lg|ln)\^([0-9.]+)\(/g, '§$1§$2§(');
    s = s.replace(/\b(log|lg|ln)\s*\^\s*\(?([0-9.]+)\)?\s*([A-Za-z])\b/g, '(($1($3))^$2)');
    // log log x
    s = s.replace(/\b(log|lg|ln)\s*(log|lg|ln)\s*([A-Za-z])\b/g, '$1($2($3))');
    // log x, logn, ln n
    s = s.replace(/\b(log|lg|ln)\s*([A-Za-z])\b(?!\s*\()/g, '$1($2)');
    s = s.replace(/\b(log|lg|ln)([A-Za-z])\b/g, '$1($2)');

    // expand the §log§k§( markers: §log§2§(X) -> (log(X))^2
    let idx;
    while ((idx = s.indexOf('§')) !== -1) {
        const m = s.slice(idx).match(/^§(log|lg|ln)§([0-9.]+)§\(/);
        if (!m) break;
        const open = idx + m[0].length - 1;
        const close = matchParen(s, open);
        if (close === -1) break;
        s = s.slice(0, idx) + `((${m[1]}${s.slice(open, close + 1)})^${m[2]})` + s.slice(close + 1);
    }

    // close unbalanced parentheses the sheet left open
    const open = (s.match(/\(/g) || []).length, close = (s.match(/\)/g) || []).length;
    if (open > close) s += ')'.repeat(open - close);

    return s.trim();
}

// Split run-together letter products like "mn" or "nk" into "m*n", leaving
// function names alone.
function splitProducts(s) {
    return s.replace(/[A-Za-zα-ωΑ-Ω]+/g, (word, offset) => {
        const next = s.slice(offset + word.length).trimStart()[0];
        if (FUNCTIONS.has(word) || NAMED_CONSTANTS.has(word) || word === 'O' || word === 'poly' || word === 'polylog') return word;
        if (next === '(' && FUNCTIONS.has(word)) return word;
        if (word.length === 1) return word;
        // log/ln/lg glued to a variable ("logn" was handled above; "nlog" here)
        const glued = word.match(/^([A-Za-z]+?)(log|lg|ln|sqrt|exp)$/);
        if (glued && next === '(') return glued[1].split('').join('*') + '*' + glued[2];
        return word.split('').join('*');
    });
}

function collectSymbols(node) {
    const symbols = new Set();
    node.traverse((n, path, parent) => {
        if (n.isSymbolNode && !(parent && parent.isFunctionNode && parent.fn === n)) symbols.add(n.name);
    });
    return symbols;
}

// e^(...) exponents written with n = bit length really mean ln N = n ln 2.
function rewriteBitsInExponent(node) {
    const isLog = m => m.isFunctionNode && (m.fn.name === 'log' || m.fn.name === 'log2');
    return node.transform(n => {
        if (n.isOperatorNode && n.op === '^' && n.args[0].isSymbolNode && n.args[0].name === 'e') {
            // Does n appear only as log(n)? Then the sheet's n is the number N
            // itself (L_N written out), and ln N = n ln 2 for an n-bit N.
            let bare = false;
            n.args[1].traverse((m, path, parent) => {
                if (m.isSymbolNode && m.name === 'n' && !(parent && isLog(parent) && parent.args[0] === m)) bare = true;
            });
            const exponent = bare
                // L-notation shorthand: the sheet's n stands for ln N.
                ? n.args[1]
                    .transform(m => (m.isSymbolNode && m.name === 'n' ? math.parse('(n * log(2))') : m))
                    .transform(m => (m.isFunctionNode && m.fn.name === 'log2' ? new math.FunctionNode('log', m.args) : m))
                : n.args[1].transform(m => {
                    if (!isLog(m) || !m.args[0].isSymbolNode || m.args[0].name !== 'n') return m;
                    return math.parse(m.fn.name === 'log2' ? '(n)' : '(n * log(2))');
                });
            return new math.OperatorNode('^', 'pow', [n.args[0], exponent]);
        }
        return n;
    });
}

// x! overflows for x > 170, so use Stirling's approximation, which the
// calculator's log-space evaluation can handle.
function stirling(node) {
    return node.transform(n => {
        if (n.isOperatorNode && n.op === '!') {
            const x = n.args[0].toString({ implicit: 'show' });
            return math.parse(`(sqrt(2 * pi * (${x})) * ((${x}) / e) ^ (${x}))`);
        }
        return n;
    });
}

/**
 * @param {string} text  complexity text from the sheet
 * @param {object} opts
 *   vars: { letter: expression in n }
 *   constants: { symbol: value }
 *   allowP: keep `p` (classical processors)
 *   bitsInExponent: see rewriteBitsInExponent
 *   definitions: the row's "Parameter definitions" text, for nicer reasons
 */
export function convertComplexity(text, opts = {}) {
    const { vars = { n: 'n' }, constants = {}, allowP = false, bitsInExponent = false, definitions = '' } = opts;
    const assumptions = new Set();
    const raw = String(text ?? '').trim();

    if (!raw || raw === '-' || raw === '?' || /^n\/?a$/i.test(raw)) return { reason: 'No complexity in the sheet' };
    if (/\?/.test(raw)) return { reason: 'Marked uncertain in the sheet (?)' };
    if (/toffol|toffli|tofoli|t[- ]?count|t[- ]?depth|cnot|gates?:|depth:|circuit\s*\d/i.test(raw)) {
        return { reason: 'Gate count or circuit depth, not a runtime' };
    }
    if (/\bif\b|\botherwise\b|\bwhere\b|f_\{?bin/i.test(raw)) return { reason: 'Depends on cases or on a helper function' };

    let s = normalize(raw, assumptions);

    if (/\bpoly(log)?\s*\(|\bpolylog\b|\bpoly\b/i.test(s)) return { reason: 'Not specific (poly or polylog)' };
    if (/Omega|Ω/.test(s)) return { reason: 'Lower bound only' };
    if (/\?/.test(s)) return { reason: 'Marked uncertain in the sheet (?)' };

    // O(...) wrappers, including a little-o upper bound like o(exp(...))
    s = unwrap(s, 'O');
    s = s.replace(/(^|[^A-Za-z])o\(/g, '$1(');
    // e^{...} written as exp(...)
    s = s.replace(/\bexp\s*\(/g, 'e^(');
    if (/\bO\b|\bo\b/.test(s)) return { reason: "Couldn't read the formula" };

    s = splitProducts(s);
    // juxtaposition with spaces ("V^2 2^V") -> explicit multiplication
    s = s.replace(/\b(log2?|ln|lg|sqrt|exp|min|max)\s+\(/g, '$1(');
    s = s.replace(/([\w)!.ω])\s+(?=[\w(ω])/g, '$1*');

    // ln is the natural log; log and lg are base 2.
    s = s.replace(/\bln\(/g, '__NAT(').replace(/\b(lg|log)\(/g, 'log2(').replace(/__NAT\(/g, 'log(');

    let node;
    try {
        node = math.parse(s);
    } catch {
        return { reason: "Couldn't read the formula" };
    }

    const symbols = collectSymbols(node);
    const blocked = [];
    const scope = { ...constants };
    for (const sym of symbols) {
        if (sym in vars || sym in scope || NAMED_CONSTANTS.has(sym)) continue;
        if (sym === 'p' && allowP) continue;
        blocked.push(sym);
    }
    if (blocked.length) {
        const defs = blocked.map(sym => describe(sym, definitions)).join('; ');
        return { reason: `Uses ${defs}`, blocked };
    }

    node = node.transform(n => {
        if (n.isSymbolNode && !(n.name === 'n') && n.name in vars) return math.parse(`(${vars[n.name]})`);
        if (n.isSymbolNode && n.name in scope) return math.parse(String(scope[n.name]));
        if (n.isSymbolNode && n.name === 'n' && vars.n && vars.n !== 'n') return math.parse(`(${vars.n})`);
        return n;
    });
    if (bitsInExponent) node = rewriteBitsInExponent(node);
    node = stirling(node);

    const formula = node.toString({ implicit: 'show' });
    try {
        const value = math.compile(formula).evaluate({ n: 1000, p: 1 });
        if (typeof value !== 'number' || !Number.isFinite(value) && value !== Infinity || value <= 0) {
            return { reason: "Formula doesn't give a positive number" };
        }
    } catch {
        return { reason: "Couldn't read the formula" };
    }
    return { formula, assumptions: [...assumptions] };
}

// "k (condition number)" from a row's parameter definitions, when given.
function describe(symbol, definitions) {
    const lines = String(definitions || '').replace(/<br\s*\/?>/gi, '\n').split(/\n|;|,(?=\s*\$?[A-Za-zα-ω]\$?\s*:)/);
    for (const line of lines) {
        const m = line.match(/^\s*\$?\\?([A-Za-zα-ω_]+)\$?\s*[:;]\s*(.+)$/);
        if (!m) continue;
        const letter = m[1].replace(/\\(epsilon|varepsilon)/, 'ε').replace(/^epsilon$|^eps$/, 'ε').replace(/^kappa$/, 'κ');
        if (letter === symbol) return `${symbol} (${m[2].trim().replace(/\$/g, '')})`;
    }
    return symbol;
}
