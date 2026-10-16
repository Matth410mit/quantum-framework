// Roadmap import/export: schema, validation, migration and serialization.
//
// Format 2.x records only what a source reported. Each data point holds an
// open set of metrics in plain units (physicalQubits: 156, gateTimeNs: 60),
// never the app's internal base-10 logs, and never a number the calculator
// derived. Calculator assumptions such as the physical-to-logical qubit ratio
// (PLQR), its yearly change and the extrapolation type belong to the
// calculator, which applies them when a roadmap is loaded.
// Full spec: docs/roadmap-format.md. JSON Schema: public/schemas/.

export const SCHEMA_VERSION = '2.0.0';
export const COLLECTION_KIND = 'roadmap-collection';
const SUPPORTED_MAJOR = 2;

export const MODALITIES = [
  'superconducting',
  'trapped-ion',
  'neutral-atom',
  'semiconductor',
  'photonic',
  'topological',
  'other',
];

// Display names used by hardware preset names, e.g. "IBM (Superconducting)".
export const MODALITY_LABELS = {
  superconducting: 'Superconducting',
  'trapped-ion': 'Trapped Ion',
  'neutral-atom': 'Neutral Atom',
  semiconductor: 'Semiconductors',
  photonic: 'Photonic',
  topological: 'Topological',
  other: 'Other',
};

export const DATA_POINT_STATUSES = ['demonstrated', 'projected'];

// Who published the numbers: the hardware maker, someone reporting on them, or
// a calculator user who typed or edited them.
export const PROVENANCES = ['vendor-published', 'third-party', 'user-entered'];

// Known metrics, in the plain units they are stored in. Other metric names
// are accepted and kept as long as their values are finite numbers.
export const METRICS = {
  physicalQubits: { label: 'Physical qubits', unit: 'qubits', min: 0 },
  logicalQubits: { label: 'Logical qubits', unit: 'qubits', min: 0 },
  twoQubitGateError: { label: 'Two-qubit gate error', unit: 'probability', min: 0, max: 1 },
  singleQubitGateError: { label: 'Single-qubit gate error', unit: 'probability', min: 0, max: 1 },
  readoutError: { label: 'Readout error', unit: 'probability', min: 0, max: 1 },
  gateTimeNs: { label: 'Two-qubit gate time', unit: 'ns', min: 0 },
  coherenceTimeUs: { label: 'Coherence time (T2)', unit: 'us', min: 0 },
  logicalErrorRate: { label: 'Logical error rate', unit: 'per logical operation', min: 0, max: 1 },
  logicalClockRateHz: { label: 'Logical clock rate', unit: 'Hz', min: 0 },
  systemCostUsd: { label: 'System cost', unit: 'USD', min: 0 },
};

export const QUBIT_METRICS = { physical: 'physicalQubits', logical: 'logicalQubits' };

// ---------------------------------------------------------------------------
// Metric values: a plain number, or { value, low?, high? } when the source gave
// a range.

export function metricValue(m) {
  if (typeof m === 'number') return m;
  if (m && typeof m === 'object') return m.value;
  return undefined;
}

function isFiniteNumber(x) {
  return typeof x === 'number' && Number.isFinite(x);
}

function validateMetric(name, m, where, errors) {
  const def = METRICS[name];
  const value = metricValue(m);
  if (!isFiniteNumber(value)) {
    errors.push(`${where}.metrics.${name} must be a number or { value, low, high }`);
    return;
  }
  if (typeof m === 'object') {
    for (const k of Object.keys(m)) {
      if (!['value', 'low', 'high'].includes(k)) {
        errors.push(`${where}.metrics.${name} has unknown field "${k}" (allowed: value, low, high)`);
      }
    }
    if (m.low != null && (!isFiniteNumber(m.low) || m.low > value)) {
      errors.push(`${where}.metrics.${name}.low must be a number no greater than value`);
    }
    if (m.high != null && (!isFiniteNumber(m.high) || m.high < value)) {
      errors.push(`${where}.metrics.${name}.high must be a number no less than value`);
    }
  }
  if (def) {
    if (def.min != null && value < def.min) {
      errors.push(`${where}.metrics.${name} must be at least ${def.min} (${def.unit})`);
    }
    if (def.max != null && value > def.max) {
      errors.push(`${where}.metrics.${name} must be at most ${def.max} (${def.unit})`);
    }
  }
}

// ---------------------------------------------------------------------------
// Validation of a format 2.x roadmap. Returns an array of error strings.

const DATE_RE = /^\d{4}(-\d{2}(-\d{2})?)?$/;

function validateSource(source, where, errors, required) {
  if (source == null) {
    if (required) errors.push(`${where} is required: { url } or { citation }`);
    return;
  }
  if (typeof source !== 'object' || Array.isArray(source)) {
    errors.push(`${where} must be an object like { "url": "...", "published": "2025-06-10" }`);
    return;
  }
  const hasUrl = typeof source.url === 'string' && source.url.trim();
  const hasCitation = typeof source.citation === 'string' && source.citation.trim();
  if (!hasUrl && !hasCitation) {
    errors.push(`${where} needs a url or a citation`);
  }
  if (source.published != null && !DATE_RE.test(String(source.published))) {
    errors.push(`${where}.published must be YYYY, YYYY-MM or YYYY-MM-DD`);
  }
}

function requireString(obj, field, errors) {
  if (typeof obj[field] !== 'string' || !obj[field].trim()) {
    errors.push(`Missing or empty mandatory field: ${field}`);
  }
}

export function validateRoadmap(roadmap) {
  const errors = [];
  if (!roadmap || typeof roadmap !== 'object') return ['Roadmap must be an object'];

  requireString(roadmap, 'title', errors);
  requireString(roadmap, 'organization', errors);

  if (!roadmap.modality) {
    errors.push('Missing mandatory field: modality');
  } else if (!MODALITIES.includes(roadmap.modality)) {
    errors.push(`Invalid modality "${roadmap.modality}". Must be one of: ${MODALITIES.join(', ')}`);
  }

  validateSource(roadmap.source, 'source', errors, true);

  if (roadmap.provenance != null && !PROVENANCES.includes(roadmap.provenance)) {
    errors.push(`Invalid provenance "${roadmap.provenance}". Must be one of: ${PROVENANCES.join(', ')}`);
  }

  for (const field of ['physicalLogicalQubitsRatio', 'ratioImprovementRate', 'extrapolationType']) {
    if (roadmap[field] != null) {
      errors.push(`${field} is a calculator setting, not roadmap data; remove it from the roadmap`);
    }
  }

  if (!Array.isArray(roadmap.dataPoints) || roadmap.dataPoints.length === 0) {
    errors.push('dataPoints must be a non-empty array');
    return errors;
  }

  roadmap.dataPoints.forEach((dp, i) => {
    const where = `dataPoints[${i}]`;
    if (!dp || typeof dp !== 'object') {
      errors.push(`${where} must be an object`);
      return;
    }
    if (!Number.isInteger(dp.year)) {
      errors.push(`${where}.year must be an integer`);
    }
    if (!DATA_POINT_STATUSES.includes(dp.status)) {
      errors.push(`${where}.status must be one of: ${DATA_POINT_STATUSES.join(', ')}`);
    }
    if (dp.provenance != null && !PROVENANCES.includes(dp.provenance)) {
      errors.push(`${where}.provenance must be one of: ${PROVENANCES.join(', ')}`);
    }
    validateSource(dp.source, `${where}.source`, errors, false);
    if (!dp.metrics || typeof dp.metrics !== 'object' || Array.isArray(dp.metrics) || Object.keys(dp.metrics).length === 0) {
      errors.push(`${where}.metrics must be an object with at least one metric`);
      return;
    }
    for (const [name, m] of Object.entries(dp.metrics)) {
      validateMetric(name, m, where, errors);
    }
  });

  return errors;
}

// ---------------------------------------------------------------------------
// Version handling and migration of older files.

function parseMajor(version) {
  const match = String(version).match(/^(\d+)(\.\d+)?(\.\d+)?$/);
  return match ? Number(match[1]) : NaN;
}

function isLegacyYearMap(obj) {
  if (!obj || typeof obj !== 'object' || Array.isArray(obj)) return false;
  const entries = Object.entries(obj);
  return entries.length > 0 && entries.every(([k, v]) => /^\d{4}$/.test(k) && Number.isFinite(Number(v)));
}

function modalityFromLabel(label) {
  if (!label) return 'other';
  const lower = String(label).trim().toLowerCase();
  const found = Object.entries(MODALITY_LABELS).find(([slug, l]) => l.toLowerCase() === lower || slug === lower);
  return found ? found[0] : 'other';
}

function sourceFromString(str, published) {
  const source = {};
  const s = typeof str === 'string' ? str.trim() : '';
  if (/^https?:\/\//i.test(s)) source.url = s;
  else source.citation = s || 'Not provided';
  if (published != null && published !== '') source.published = String(published);
  return source;
}

function dropEmpty(obj) {
  for (const k of Object.keys(obj)) {
    if (obj[k] == null || obj[k] === '') delete obj[k];
  }
  return obj;
}

// Format 1.0 stored both physical and logical counts, with one of them computed
// from the PLQR. Keep only the count in the roadmap's own unit (the one that
// was reported), and hand the PLQR settings back as calculator settings.
function migrateV1Roadmap(rm) {
  const unit = rm.roadmapUnit === 'logical' ? 'logical' : 'physical';
  const key = QUBIT_METRICS[unit];
  const otherKey = QUBIT_METRICS[unit === 'physical' ? 'logical' : 'physical'];

  const dataPoints = (rm.dataPoints || []).map((dp) => {
    let metrics = {};
    if (dp[key] != null) metrics[key] = Number(dp[key]);
    else if (dp.qubits != null) metrics[key] = Number(dp.qubits);
    else if (dp[otherKey] != null) metrics[otherKey] = Number(dp[otherKey]);
    return { year: Number(dp.year), status: dp.type || 'projected', metrics };
  });

  const roadmap = dropEmpty({
    id: rm.id,
    title: rm.title,
    organization: rm.organization,
    modality: modalityFromLabel(rm.qubitCategory),
    technology: rm.qubitDetailed,
    source: sourceFromString(rm.source, rm.publicationDate || rm.publicationYear),
    notes: rm.notes,
    dataPoints,
  });

  const settings = dropEmpty({
    roadmapUnit: unit,
    physicalLogicalQubitsRatio: rm.physicalLogicalQubitsRatio,
    ratioImprovementRate: rm.ratioImprovementRate,
    extrapolationType: rm.extrapolationType,
  });

  return { roadmap, settings };
}

function migrateLegacyYearMap(map) {
  const dataPoints = Object.entries(map).map(([year, qubits]) => ({
    year: Number(year),
    status: 'projected',
    metrics: { physicalQubits: Number(qubits) },
  }));
  return {
    title: 'Imported roadmap',
    organization: 'Unknown',
    modality: 'other',
    provenance: 'user-entered',
    source: { citation: 'Not provided' },
    dataPoints,
  };
}

// Returns { valid, roadmaps, settings, errors, warnings }.
// settings[i] holds calculator settings carried by an older file for
// roadmaps[i] (PLQR, ratio change, extrapolation), or null.
export function validateImportFile(data) {
  const warnings = [];

  if (!data || typeof data !== 'object') {
    return { valid: false, roadmaps: [], settings: [], errors: ['Input must be a JSON object'], warnings };
  }

  let roadmaps;
  let settings;

  if (isLegacyYearMap(data)) {
    roadmaps = [migrateLegacyYearMap(data)];
    settings = [null];
    warnings.push('Converted a plain { year: qubits } roadmap. Its counts were assumed to be physical qubits, and it has no source; edit the title and source before sharing it.');
  } else {
    if (!data.schemaVersion) {
      return { valid: false, roadmaps: [], settings: [], errors: ['Missing schemaVersion field'], warnings };
    }
    const major = parseMajor(data.schemaVersion);
    if (!Array.isArray(data.roadmaps)) {
      return { valid: false, roadmaps: [], settings: [], errors: ['roadmaps must be an array'], warnings };
    }

    if (major === 1) {
      const migrated = data.roadmaps.map(migrateV1Roadmap);
      roadmaps = migrated.map((m) => m.roadmap);
      settings = migrated.map((m) => m.settings);
      warnings.push(`Converted from format ${data.schemaVersion} to ${SCHEMA_VERSION}: kept each roadmap's reported qubit counts, dropped the counts that had been computed from the physical-to-logical ratio, and applied the file's ratio settings to the calculator.`);
    } else if (major === SUPPORTED_MAJOR) {
      if (data.kind != null && data.kind !== COLLECTION_KIND) {
        return { valid: false, roadmaps: [], settings: [], errors: [`kind must be "${COLLECTION_KIND}"`], warnings };
      }
      roadmaps = data.roadmaps;
      settings = data.roadmaps.map(() => null);
    } else if (major > SUPPORTED_MAJOR) {
      return { valid: false, roadmaps: [], settings: [], errors: [`This file uses format ${data.schemaVersion}, which is newer than this calculator supports (${SCHEMA_VERSION}).`], warnings };
    } else {
      return { valid: false, roadmaps: [], settings: [], errors: [`Unrecognized schemaVersion "${data.schemaVersion}"`], warnings };
    }
  }

  const errors = [];
  const titles = new Set();
  roadmaps.forEach((rm, i) => {
    validateRoadmap(rm).forEach((e) => errors.push(`roadmaps[${i}]: ${e}`));
    if (typeof rm.title === 'string') {
      const key = rm.title.trim().toLowerCase();
      if (titles.has(key)) errors.push(`roadmaps[${i}]: duplicate title "${rm.title}"`);
      titles.add(key);
    }
    for (const name of Object.keys(collectMetricNames(rm))) {
      if (!METRICS[name]) {
        warnings.push(`roadmaps[${i}]: kept unrecognized metric "${name}"; the calculator does not use it yet.`);
      }
    }
  });

  return { valid: errors.length === 0, roadmaps, settings, errors, warnings };
}

function collectMetricNames(rm) {
  const names = {};
  for (const dp of rm.dataPoints || []) {
    for (const name of Object.keys((dp && dp.metrics) || {})) names[name] = true;
  }
  return names;
}

export function importRoadmaps(text, fileName = '') {
  if (/\.csv$/i.test(fileName)) {
    let parsed;
    try {
      parsed = parseRoadmapsCSV(text);
    } catch (e) {
      return { valid: false, roadmaps: [], settings: [], errors: [`Invalid CSV: ${e.message}`], warnings: [] };
    }
    return validateImportFile(parsed);
  }
  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch (e) {
    return { valid: false, roadmaps: [], settings: [], errors: [`Invalid JSON: ${e.message}`], warnings: [] };
  }
  return validateImportFile(parsed);
}

// ---------------------------------------------------------------------------
// Converting between a roadmap and the calculator's single { year: qubits }
// series. This is where the calculator's PLQR assumption is applied.

// Same formula as getLogicalQubits in Models.vue: the ratio changes by
// ratioImprovementRate percent a year from baseYear, and never drops below 3.
export function getAdjustedPLQR(year, plqr, ratioImprovementRate, baseYear) {
  const annualFactor = 1 + ratioImprovementRate / 100;
  const adjusted = plqr * Math.pow(annualFactor, year - baseYear);
  return Math.max(3, adjusted);
}

// Builds the series the calculator plots. The unit is whichever qubit metric
// most data points report (physical on a tie). A year that reports only the
// other unit is converted with the PLQR settings, and a note says so. Years
// with no qubit count are left out of the series but stay in the roadmap.
// Returns { roadmap, roadmapUnit, dataPointTypes, notes }.
export function roadmapToQubitSeries(rm, { physicalLogicalQubitsRatio, ratioImprovementRate, baseYear }) {
  const points = rm.dataPoints || [];
  const count = (key) => points.filter((dp) => metricValue(dp.metrics?.[key]) != null).length;
  const roadmapUnit = count('logicalQubits') > count('physicalQubits') ? 'logical' : 'physical';
  const key = QUBIT_METRICS[roadmapUnit];
  const otherKey = QUBIT_METRICS[roadmapUnit === 'physical' ? 'logical' : 'physical'];

  const byYear = new Map();
  for (const dp of points) {
    if (!byYear.has(dp.year)) byYear.set(dp.year, []);
    byYear.get(dp.year).push(dp);
  }

  const roadmap = {};
  const dataPointTypes = {};
  const notes = [];
  for (const year of [...byYear.keys()].sort((a, b) => a - b)) {
    const yearPoints = byYear.get(year);
    const pick = (k) => yearPoints
      .filter((dp) => metricValue(dp.metrics?.[k]) != null)
      .reduce((best, dp) => (!best || metricValue(dp.metrics[k]) > metricValue(best.metrics[k]) ? dp : best), null);

    const direct = pick(key);
    if (direct) {
      roadmap[year] = metricValue(direct.metrics[key]);
      dataPointTypes[year] = direct.status || 'projected';
      continue;
    }
    const other = pick(otherKey);
    if (!other) continue;
    const plqr = getAdjustedPLQR(year, physicalLogicalQubitsRatio, ratioImprovementRate, baseYear);
    const reported = metricValue(other.metrics[otherKey]);
    roadmap[year] = roadmapUnit === 'physical' ? reported * plqr : reported / plqr;
    dataPointTypes[year] = other.status || 'projected';
    notes.push(`${rm.title} ${year}: reported ${reported} ${roadmapUnit === 'physical' ? 'logical' : 'physical'} qubits, shown as ${Math.round(roadmap[year])} ${roadmapUnit} using a ratio of ${plqr.toFixed(1)}.`);
  }

  return { roadmap, roadmapUnit, dataPointTypes, notes };
}

function sameNumber(a, b) {
  return Number(a) === Number(b) || Math.abs(Number(a) - Number(b)) <= 1e-9 * Math.max(Math.abs(Number(a)), Math.abs(Number(b)));
}

// Builds a roadmap from a hardware preset and the calculator's current series.
// If the preset came from an imported file (record) and a year's value is
// unchanged since import, that year's original data points are written back
// exactly as imported, so a value that was reported as logical qubits stays
// logical. Edited or added years are written as user-entered points.
export function hardwareToRoadmap({ hardware, series, roadmapUnit, dataPointTypes }) {
  const record = hardware?.roadmapRecord;
  const importedSeries = hardware?.importedSeries;
  const key = QUBIT_METRICS[roadmapUnit === 'logical' ? 'logical' : 'physical'];
  const types = dataPointTypes || {};

  const dataPoints = [];
  for (const [yearStr, value] of Object.entries(series || {})) {
    const year = Number(yearStr);
    const status = types[year] || types[yearStr] || 'projected';
    const unchanged = record && importedSeries
      && importedSeries.roadmapUnit === roadmapUnit
      && importedSeries.roadmap[year] != null
      && sameNumber(importedSeries.roadmap[year], value)
      && importedSeries.dataPointTypes?.[year] === status;
    if (unchanged) {
      for (const dp of record.dataPoints.filter((p) => p.year === year)) {
        dataPoints.push(JSON.parse(JSON.stringify(dp)));
      }
      continue;
    }
    const point = { year, status, metrics: { [key]: Number(value) } };
    if (record) point.provenance = 'user-entered';
    dataPoints.push(point);
  }

  // Imported points with no qubit count (e.g. only a gate error) are not in
  // the series, so carry them over as they were.
  if (record) {
    for (const dp of record.dataPoints) {
      const m = dp.metrics || {};
      if (metricValue(m.physicalQubits) == null && metricValue(m.logicalQubits) == null) {
        dataPoints.push(JSON.parse(JSON.stringify(dp)));
      }
    }
  }
  dataPoints.sort((a, b) => a.year - b.year);

  if (record) {
    const { dataPoints: _ignored, ...meta } = record;
    return { ...JSON.parse(JSON.stringify(meta)), dataPoints };
  }

  const name = hardware?.hardwareName || 'Roadmap';
  const labelMatch = name.match(/\(([^)]+)\)\s*$/);
  return dropEmpty({
    id: slugify(name),
    title: name,
    organization: name.replace(/\([^)]*\)\s*$/, '').trim() || name,
    modality: modalityFromLabel(labelMatch ? labelMatch[1] : null),
    provenance: hardware?.provenance,
    source: sourceFromString(hardware?.reference),
    dataPoints,
  });
}

// ---------------------------------------------------------------------------
// JSON export.

function normalizeRoadmap(rm) {
  return dropEmpty({
    id: rm.id || slugify(rm.title),
    title: rm.title,
    organization: rm.organization,
    modality: rm.modality,
    technology: rm.technology,
    qecScheme: rm.qecScheme,
    provenance: rm.provenance,
    source: rm.source,
    notes: rm.notes,
    dataPoints: rm.dataPoints,
  });
}

export function exportRoadmaps(roadmaps, exportedAt = new Date().toISOString().split('T')[0]) {
  const payload = {
    schemaVersion: SCHEMA_VERSION,
    kind: COLLECTION_KIND,
    exportedAt,
    roadmaps: roadmaps.map(normalizeRoadmap),
  };
  return JSON.stringify(payload, null, 2);
}

// ---------------------------------------------------------------------------
// CSV: long format, one row per roadmap x data point x metric, so new metrics
// never need new columns. Roadmap fields repeat on every row.

export const CSV_HEADERS = [
  'roadmap_id',
  'title',
  'organization',
  'modality',
  'technology',
  'qec_scheme',
  'provenance',
  'source_url',
  'source_citation',
  'source_published',
  'roadmap_notes',
  'year',
  'status',
  'system',
  'point_provenance',
  'point_source_url',
  'point_notes',
  'metric',
  'value',
  'low',
  'high',
  'unit',
];

function escapeCSV(value) {
  if (value == null) return '';
  const str = String(value);
  if (/[",\n\r]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export function exportRoadmapsCSV(roadmaps) {
  const rows = [CSV_HEADERS.join(',')];
  for (const raw of roadmaps) {
    const rm = normalizeRoadmap(raw);
    for (const dp of rm.dataPoints || []) {
      for (const [metric, m] of Object.entries(dp.metrics || {})) {
        const row = {
          roadmap_id: rm.id,
          title: rm.title,
          organization: rm.organization,
          modality: rm.modality,
          technology: rm.technology,
          qec_scheme: rm.qecScheme,
          provenance: rm.provenance,
          source_url: rm.source?.url,
          source_citation: rm.source?.citation,
          source_published: rm.source?.published,
          roadmap_notes: rm.notes,
          year: dp.year,
          status: dp.status,
          system: dp.system,
          point_provenance: dp.provenance,
          point_source_url: dp.source?.url,
          point_notes: dp.notes,
          metric,
          value: metricValue(m),
          low: typeof m === 'object' ? m.low : null,
          high: typeof m === 'object' ? m.high : null,
          unit: METRICS[metric]?.unit,
        };
        rows.push(CSV_HEADERS.map((h) => escapeCSV(row[h])).join(','));
      }
    }
  }
  return rows.join('\n');
}

function parseCSVRows(text) {
  const rows = [];
  let row = [];
  let field = '';
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"' && text[i + 1] === '"') { field += '"'; i++; }
      else if (c === '"') inQuotes = false;
      else field += c;
    } else if (c === '"') {
      inQuotes = true;
    } else if (c === ',') {
      row.push(field); field = '';
    } else if (c === '\n' || c === '\r') {
      if (c === '\r' && text[i + 1] === '\n') i++;
      row.push(field); field = '';
      if (row.some((f) => f !== '')) rows.push(row);
      row = [];
    } else {
      field += c;
    }
  }
  if (inQuotes) throw new Error('unterminated quoted field');
  row.push(field);
  if (row.some((f) => f !== '')) rows.push(row);
  return rows;
}

// Rebuilds a format 2.x collection from the long CSV. Rows with the same
// roadmap, year, status and system become one data point.
export function parseRoadmapsCSV(text) {
  const rows = parseCSVRows(text.replace(/^﻿/, ''));
  if (rows.length === 0) throw new Error('file is empty');
  const header = rows[0].map((h) => h.trim());
  for (const required of ['roadmap_id', 'title', 'year', 'status', 'metric', 'value']) {
    if (!header.includes(required)) throw new Error(`missing column "${required}"`);
  }
  const col = (r, name) => {
    const i = header.indexOf(name);
    const v = i >= 0 ? (r[i] ?? '').trim() : '';
    return v === '' ? null : v;
  };
  const num = (v) => (v == null ? null : Number(v));

  const roadmaps = new Map();
  rows.slice(1).forEach((r) => {
    const id = col(r, 'roadmap_id') || col(r, 'title');
    if (!roadmaps.has(id)) {
      roadmaps.set(id, dropEmpty({
        id,
        title: col(r, 'title'),
        organization: col(r, 'organization'),
        modality: col(r, 'modality'),
        technology: col(r, 'technology'),
        qecScheme: col(r, 'qec_scheme'),
        provenance: col(r, 'provenance'),
        source: dropEmpty({ url: col(r, 'source_url'), citation: col(r, 'source_citation'), published: col(r, 'source_published') }),
        notes: col(r, 'roadmap_notes'),
        dataPoints: [],
        _index: new Map(),
      }));
    }
    const rm = roadmaps.get(id);
    const year = num(col(r, 'year'));
    const status = col(r, 'status');
    const system = col(r, 'system');
    const pointKey = `${year}|${status}|${system ?? ''}`;
    let dp = rm._index.get(pointKey);
    if (!dp) {
      dp = dropEmpty({
        year,
        status,
        system,
        provenance: col(r, 'point_provenance'),
        notes: col(r, 'point_notes'),
        metrics: {},
      });
      const pointUrl = col(r, 'point_source_url');
      if (pointUrl) dp.source = { url: pointUrl };
      rm._index.set(pointKey, dp);
      rm.dataPoints.push(dp);
    }
    const metric = col(r, 'metric');
    const value = num(col(r, 'value'));
    const low = num(col(r, 'low'));
    const high = num(col(r, 'high'));
    dp.metrics[metric] = low == null && high == null ? value : dropEmpty({ value, low, high });
  });

  return {
    schemaVersion: SCHEMA_VERSION,
    kind: COLLECTION_KIND,
    roadmaps: [...roadmaps.values()].map(({ _index, ...rm }) => {
      if (rm.source && Object.keys(rm.source).length === 0) delete rm.source;
      return rm;
    }),
  };
}

function slugify(text) {
  if (!text) return 'roadmap-' + Date.now();
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
