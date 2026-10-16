# Roadmap file format 2.0.0

The calculator imports and exports hardware roadmaps as JSON (the master copy) or as a long-format CSV. The JSON Schema is `public/schemas/roadmap-collection-2.0.0.schema.json`, and the code is `src/store/roadmapSchema.js`.

## Rules

1. **Only reported numbers.** A data point holds what the source published. If a vendor gives logical qubits, store `logicalQubits`; the calculator does the physical/logical conversion when it loads the file.
2. **No calculator assumptions.** The physical-to-logical qubit ratio (PLQR), its yearly change and the extrapolation type are calculator settings and are rejected inside a roadmap.
3. **Plain values in stated units.** `gateTimeNs: 60` means 60 ns. Never the app's internal base-10 logs.
4. **Open list of metrics.** Unknown metric names are kept, as long as the values are numbers.
5. **Provenance and certainty.** Each data point is `demonstrated` or `projected`. Each roadmap has a source (URL or citation, plus publication date) and a `provenance`. Any metric can carry `low`/`high` bounds.
6. **Semantic versioning.** Files say `"schemaVersion": "2.0.0"`. Any 2.x file can be imported. Format 1.0 files and plain `{ "year": qubits }` objects are converted automatically. Files from a newer major version are refused with a message.

## JSON

```json
{
  "schemaVersion": "2.0.0",
  "kind": "roadmap-collection",
  "exportedAt": "2026-10-07",
  "roadmaps": [{
    "id": "ibm-2025",
    "title": "IBM 2025 (Superconducting)",
    "organization": "IBM",
    "modality": "superconducting",
    "qecScheme": "qLDPC",
    "provenance": "vendor-published",
    "source": { "url": "https://www.ibm.com/quantum/hardware#roadmap", "published": "2025-06-10" },
    "dataPoints": [
      { "year": 2025, "status": "demonstrated", "system": "Heron",
        "metrics": { "physicalQubits": 156, "twoQubitGateError": 0.003, "gateTimeNs": 60 } },
      { "year": 2029, "status": "projected", "system": "Starling",
        "metrics": { "logicalQubits": { "value": 200, "low": 150, "high": 200 } } }
    ]
  }]
}
```

The numbers above only illustrate the shape.

### Roadmap fields

| Field | Required | Notes |
|---|---|---|
| `title` | yes | Unique within a file |
| `organization` | yes | |
| `modality` | yes | `superconducting`, `trapped-ion`, `neutral-atom`, `semiconductor`, `photonic`, `topological`, `other` |
| `source` | yes | `{ url }` or `{ citation }`, optional `published` (`YYYY`, `YYYY-MM` or `YYYY-MM-DD`) |
| `dataPoints` | yes | At least one |
| `id` | no | Generated from the title if missing |
| `provenance` | no | `vendor-published`, `third-party` (e.g. press coverage of a vendor plan), `user-entered` |
| `technology`, `qecScheme`, `notes` | no | Free text |

### Data point fields

| Field | Required | Notes |
|---|---|---|
| `year` | yes | Integer |
| `status` | yes | `demonstrated` or `projected` |
| `metrics` | yes | At least one metric |
| `system`, `notes` | no | e.g. `"Heron"` |
| `provenance`, `source` | no | Override the roadmap's values for this point. Points edited in the calculator are exported as `user-entered`. |

### Metrics

A metric is a number, or `{ "value": n, "low": n, "high": n }` with `low` and `high` optional.

| Name | Unit |
|---|---|
| `physicalQubits` | qubits |
| `logicalQubits` | qubits |
| `twoQubitGateError` | probability (0 to 1) |
| `singleQubitGateError` | probability (0 to 1) |
| `readoutError` | probability (0 to 1) |
| `gateTimeNs` | ns |
| `coherenceTimeUs` | µs |
| `logicalErrorRate` | per logical operation (0 to 1) |
| `logicalClockRateHz` | Hz |
| `systemCostUsd` | USD |

The calculator currently plots only `physicalQubits` and `logicalQubits`. Other metrics are kept on import and written back out on export.

## CSV

One row per roadmap × data point × metric, so a new metric never needs a new column. Roadmap fields repeat on every row.

```
roadmap_id,title,organization,modality,technology,qec_scheme,provenance,source_url,source_citation,source_published,roadmap_notes,year,status,system,point_provenance,point_source_url,point_notes,metric,value,low,high,unit
ibm-2025,IBM 2025 (Superconducting),IBM,superconducting,,qLDPC,vendor-published,https://www.ibm.com/quantum/hardware#roadmap,,2025-06-10,,2025,demonstrated,Heron,,,,physicalQubits,156,,,qubits
```

On import, rows with the same `roadmap_id`, `year`, `status` and `system` become one data point. The `unit` column is informational.

## How the calculator loads a roadmap

The calculator plots one qubit series per hardware, in either physical or logical qubits. On import it picks whichever unit most data points report (physical on a tie). A year that reports only the other unit is converted with the current PLQR settings, using the same formula as the charts, and the import message lists each conversion. Years with no qubit count stay in the roadmap but are not plotted.

On export, a year that hasn't been edited since import is written back exactly as it was imported, so a logical count stays logical. Edited or added years are written in the series' unit and marked `user-entered`.

## Converting older files

- **Format 1.0** stored both physical and logical counts, one of them computed from the PLQR. The import keeps only the count in the roadmap's `roadmapUnit` (the one that was reported) and applies the file's PLQR, ratio change and extrapolation type to the calculator. `qubitCategory` becomes `modality`, `qubitDetailed` becomes `technology`, and `source`/`publicationDate` become `source.url` (or `source.citation`) and `source.published`.
- **Plain `{ "2024": 100, "2030": 10000 }` objects** are read as physical qubits with no source. The import message asks for a title and source.
