// Roadmap import/export schema, validation, and serialization.
// Each data point stores both physical and logical qubit counts; conversion
// uses a year-dependent Physical-to-Logical Qubit Ratio (PLQR).

export const SCHEMA_VERSION = '1.0';

export const QUBIT_CATEGORIES = [
  'Superconducting',
  'Trapped Ion',
  'Neutral Atom',
  'Semiconductors',
  'Photonic',
  'Topological',
  'Other',
];

export const ROADMAP_UNITS = ['physical', 'logical'];

export const DATA_POINT_TYPES = ['demonstrated', 'projected'];

export const EXTRAPOLATION_TYPES = ['linear', 'exponential'];

// ratioImprovementRate is a percentage like -23, meaning the ratio
// is multiplied by (1 + rate/100) = 0.77 each year. Minimum PLQR is 3.
export function getAdjustedPLQR(year, plqr, ratioImprovementRate) {
  const annualFactor = 1 + ratioImprovementRate / 100;
  const yearsFromBase = year - 2024;
  const adjusted = plqr * Math.pow(annualFactor, yearsFromBase);
  return Math.max(3, adjusted);
}

export function computeQubitTuple(year, value, inputUnit, plqr, ratioImprovementRate) {
  const adjustedPLQR = getAdjustedPLQR(year, plqr, ratioImprovementRate);

  if (inputUnit === 'physical') {
    return {
      physicalQubits: value,
      logicalQubits: value / adjustedPLQR,
    };
  } else {
    return {
      physicalQubits: value * adjustedPLQR,
      logicalQubits: value,
    };
  }
}

// Returns an array of error strings (empty = valid).
export function validateRoadmap(roadmap) {
  const errors = [];

  if (!roadmap.title || typeof roadmap.title !== 'string' || !roadmap.title.trim()) {
    errors.push('Missing or empty mandatory field: title');
  }

  if (!roadmap.organization || typeof roadmap.organization !== 'string' || !roadmap.organization.trim()) {
    errors.push('Missing or empty mandatory field: organization');
  }

  if (!roadmap.source || typeof roadmap.source !== 'string' || !roadmap.source.trim()) {
    errors.push('Missing or empty mandatory field: source');
  }

  if (!roadmap.qubitCategory) {
    errors.push('Missing mandatory field: qubitCategory');
  } else if (!QUBIT_CATEGORIES.includes(roadmap.qubitCategory)) {
    errors.push(
      `Invalid qubitCategory "${roadmap.qubitCategory}". Must be one of: ${QUBIT_CATEGORIES.join(', ')}`
    );
  }

  if (roadmap.physicalLogicalQubitsRatio == null || typeof roadmap.physicalLogicalQubitsRatio !== 'number' || roadmap.physicalLogicalQubitsRatio <= 0) {
    errors.push('physicalLogicalQubitsRatio must be a positive number');
  }

  if (roadmap.ratioImprovementRate == null || typeof roadmap.ratioImprovementRate !== 'number') {
    errors.push('ratioImprovementRate must be a number (e.g., -23 for 23% annual improvement)');
  }

  if (!Array.isArray(roadmap.dataPoints) || roadmap.dataPoints.length === 0) {
    errors.push('dataPoints must be a non-empty array');
  } else {
    roadmap.dataPoints.forEach((dp, i) => {
      if (dp.year == null || typeof dp.year !== 'number' || !Number.isInteger(dp.year)) {
        errors.push(`dataPoints[${i}].year must be an integer`);
      }
      if (dp.physicalQubits == null || typeof dp.physicalQubits !== 'number' || dp.physicalQubits < 0) {
        errors.push(`dataPoints[${i}].physicalQubits must be a non-negative number`);
      }
      if (dp.logicalQubits == null || typeof dp.logicalQubits !== 'number' || dp.logicalQubits < 0) {
        errors.push(`dataPoints[${i}].logicalQubits must be a non-negative number`);
      }
      if (!DATA_POINT_TYPES.includes(dp.type)) {
        errors.push(
          `dataPoints[${i}].type must be one of: ${DATA_POINT_TYPES.join(', ')}`
        );
      }
    });
  }

  if (roadmap.roadmapUnit && !ROADMAP_UNITS.includes(roadmap.roadmapUnit)) {
    errors.push(`Invalid roadmapUnit "${roadmap.roadmapUnit}". Must be one of: ${ROADMAP_UNITS.join(', ')}`);
  }

  if (roadmap.extrapolationType && !EXTRAPOLATION_TYPES.includes(roadmap.extrapolationType)) {
    errors.push(
      `Invalid extrapolationType "${roadmap.extrapolationType}". Must be one of: ${EXTRAPOLATION_TYPES.join(', ')}`
    );
  }

  if (roadmap.publicationYear != null) {
    if (typeof roadmap.publicationYear !== 'number' || !Number.isInteger(roadmap.publicationYear)) {
      errors.push('publicationYear must be an integer (e.g., 2024)');
    }
  }

  if (roadmap.publicationDate) {
    const dateStr = String(roadmap.publicationDate);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
      errors.push('publicationDate must be in YYYY-MM-DD format');
    }
  }

  return errors;
}

// Auto-computes missing qubit values if PLQR is provided.
// Returns { valid, roadmaps, errors }.
export function validateImportFile(data) {
  const errors = [];

  if (!data || typeof data !== 'object') {
    return { valid: false, roadmaps: [], errors: ['Input must be a JSON object'] };
  }

  if (!data.schemaVersion) {
    errors.push('Missing schemaVersion field');
  }

  if (!Array.isArray(data.roadmaps)) {
    return { valid: false, roadmaps: [], errors: ['roadmaps must be an array'] };
  }

  const titles = new Set();
  const processedRoadmaps = data.roadmaps.map((rm, i) => {
    const processed = autoComputeQubitTuples(rm);

    const rmErrors = validateRoadmap(processed);
    rmErrors.forEach((e) => errors.push(`roadmaps[${i}]: ${e}`));

    if (processed.title) {
      const key = processed.title.trim().toLowerCase();
      if (titles.has(key)) {
        errors.push(`roadmaps[${i}]: duplicate title "${processed.title}"`);
      }
      titles.add(key);
    }

    return processed;
  });

  return {
    valid: errors.length === 0,
    roadmaps: processedRoadmaps,
    errors,
  };
}

export function importRoadmaps(jsonString) {
  let parsed;
  try {
    parsed = JSON.parse(jsonString);
  } catch (e) {
    return { valid: false, roadmaps: [], errors: [`Invalid JSON: ${e.message}`] };
  }
  return validateImportFile(parsed);
}

// If a roadmap has PLQR info and data points with only one qubit type,
// auto-fill the other qubit type.
function autoComputeQubitTuples(roadmap) {
  const rm = { ...roadmap };
  if (!Array.isArray(rm.dataPoints) || rm.physicalLogicalQubitsRatio == null || rm.ratioImprovementRate == null) {
    return rm;
  }

  const unit = rm.roadmapUnit || 'physical';
  rm.dataPoints = rm.dataPoints.map((dp) => {
    const newDp = { ...dp };

    if (newDp.physicalQubits != null && newDp.logicalQubits == null && newDp.year != null) {
      const tuple = computeQubitTuple(newDp.year, newDp.physicalQubits, 'physical', rm.physicalLogicalQubitsRatio, rm.ratioImprovementRate);
      newDp.logicalQubits = tuple.logicalQubits;
    }
    else if (newDp.logicalQubits != null && newDp.physicalQubits == null && newDp.year != null) {
      const tuple = computeQubitTuple(newDp.year, newDp.logicalQubits, 'logical', rm.physicalLogicalQubitsRatio, rm.ratioImprovementRate);
      newDp.physicalQubits = tuple.physicalQubits;
    }
    // legacy "qubits" field uses the roadmapUnit type
    else if (newDp.qubits != null && newDp.physicalQubits == null && newDp.logicalQubits == null && newDp.year != null) {
      const tuple = computeQubitTuple(newDp.year, newDp.qubits, unit, rm.physicalLogicalQubitsRatio, rm.ratioImprovementRate);
      newDp.physicalQubits = tuple.physicalQubits;
      newDp.logicalQubits = tuple.logicalQubits;
      delete newDp.qubits;
    }

    if (!newDp.type) {
      newDp.type = 'projected';
    }

    return newDp;
  });

  return rm;
}

function normalizeRoadmap(rm) {
  return {
    id: rm.id || slugify(rm.title),
    title: rm.title,
    organization: rm.organization,
    qubitCategory: rm.qubitCategory,
    qubitDetailed: rm.qubitDetailed || null,
    roadmapUnit: rm.roadmapUnit || 'physical',
    extrapolationType: rm.extrapolationType || 'exponential',
    physicalLogicalQubitsRatio: rm.physicalLogicalQubitsRatio,
    ratioImprovementRate: rm.ratioImprovementRate,
    dataPoints: (rm.dataPoints || []).map((dp) => ({
      year: dp.year,
      physicalQubits: dp.physicalQubits,
      logicalQubits: dp.logicalQubits,
      type: dp.type || 'projected',
    })),
    publicationYear: rm.publicationYear || null,
    publicationDate: rm.publicationDate || null,
    source: rm.source,
    notes: rm.notes || null,
  };
}

export function exportRoadmaps(roadmaps) {
  const payload = {
    schemaVersion: SCHEMA_VERSION,
    roadmaps: roadmaps.map(normalizeRoadmap),
  };
  return JSON.stringify(payload, null, 2);
}

const CSV_HEADERS = [
  'id',
  'title',
  'organization',
  'qubitCategory',
  'qubitDetailed',
  'roadmapUnit',
  'extrapolationType',
  'physicalLogicalQubitsRatio',
  'ratioImprovementRate',
  'year',
  'physicalQubits',
  'logicalQubits',
  'dataPointType',
  'publicationYear',
  'publicationDate',
  'source',
  'notes',
];

function escapeCSV(value) {
  if (value == null) return '';
  const str = String(value);
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

// One row per data point.
export function exportRoadmapsCSV(roadmaps) {
  const rows = [CSV_HEADERS.join(',')];

  for (const rm of roadmaps) {
    const norm = normalizeRoadmap(rm);
    for (const dp of norm.dataPoints) {
      rows.push(
        [
          escapeCSV(norm.id),
          escapeCSV(norm.title),
          escapeCSV(norm.organization),
          escapeCSV(norm.qubitCategory),
          escapeCSV(norm.qubitDetailed),
          escapeCSV(norm.roadmapUnit),
          escapeCSV(norm.extrapolationType),
          norm.physicalLogicalQubitsRatio,
          norm.ratioImprovementRate,
          dp.year,
          dp.physicalQubits,
          dp.logicalQubits,
          escapeCSV(dp.type),
          escapeCSV(norm.publicationYear),
          escapeCSV(norm.publicationDate),
          escapeCSV(norm.source),
          escapeCSV(norm.notes),
        ].join(',')
      );
    }
  }

  return rows.join('\n');
}

// Convert { year: qubits } to a dataPoints array with both physical and
// logical counts. Marks all points as the given default type.
export function legacyRoadmapToDataPoints(roadmapObj, inputUnit = 'physical', plqr = 264, ratioImprovementRate = -23, defaultType = 'projected') {
  return Object.entries(roadmapObj).map(([year, qubits]) => {
    const yearNum = Number(year);
    const tuple = computeQubitTuple(yearNum, Number(qubits), inputUnit, plqr, ratioImprovementRate);
    return {
      year: yearNum,
      physicalQubits: tuple.physicalQubits,
      logicalQubits: tuple.logicalQubits,
      type: defaultType,
    };
  });
}

// Convert dataPoints back to { year: qubits }. Optionally filter by type.
export function dataPointsToLegacyRoadmap(dataPoints, unit = 'physical', filterType = null) {
  const filtered = filterType
    ? dataPoints.filter((dp) => dp.type === filterType)
    : dataPoints;

  const qubitKey = unit === 'physical' ? 'physicalQubits' : 'logicalQubits';

  return filtered
    .sort((a, b) => a.year - b.year)
    .reduce((acc, dp) => {
      acc[dp.year] = dp[qubitKey];
      return acc;
    }, {});
}

function slugify(text) {
  if (!text) return 'roadmap-' + Date.now();
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
