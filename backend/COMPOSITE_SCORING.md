# Composite Data Quality Score (DQS) Engine

The composite scoring engine combines individual dimension scores into a single Data Quality Score (DQS) using configurable weighted averaging.

## Function: `computeDQS(dimensions, weights)`

### Parameters

- **`dimensions`** (Object, required): Object containing dimension scores
  ```javascript
  {
    completeness: number,    // 0-100
    uniqueness: number,      // 0-100
    consistency: number,     // 0-100
    validity: number,        // 0-100
    timeliness?: number      // 0-100 (optional)
  }
  ```

- **`weights`** (Object, optional): Custom weights object (defaults to `DEFAULT_WEIGHTS`)
  ```javascript
  {
    completeness: number,    // Weight (0-1)
    uniqueness: number,      // Weight (0-1)
    consistency: number,     // Weight (0-1)
    validity: number,        // Weight (0-1)
    timeliness?: number      // Weight (0-1, optional)
  }
  ```

### Returns

```javascript
{
  dimensions: {
    completeness: number,
    uniqueness: number,
    consistency: number,
    validity: number,
    timeliness?: number
  },
  DQS: number  // Composite score (0-100, rounded integer)
}
```

## Default Weights

The default weights reflect payment domain priorities:

```javascript
{
  completeness: 0.25,  // 25% - Critical for compliance
  uniqueness: 0.20,    // 20% - Important for data integrity
  consistency: 0.15,   // 15% - Affects operational efficiency
  validity: 0.25,      // 25% - Essential for compliance
  timeliness: 0.15     // 15% - Relevant but less critical
}
```

### Weight Rationale

- **Completeness (25%)**: Missing data leads to regulatory issues and transaction failures
- **Validity (25%)**: Invalid data violates business rules and causes failures
- **Uniqueness (20%)**: Duplicates cause reconciliation issues and analytics errors
- **Consistency (15%)**: Inconsistent formats require manual cleanup
- **Timeliness (15%)**: Stale data affects decisions but correctness is more critical

## Usage Examples

### Basic Usage (Default Weights)

```javascript
const { computeAllScores, computeDQS } = require('./data-quality-functions.js')

const rows = [
  { id: '1', name: 'John', email: 'john@example.com', date: '2024-01-15' },
  { id: '2', name: 'Jane', email: 'jane@example.com', date: '2024-01-14' },
]

// Compute dimension scores
const dimensions = computeAllScores(rows)

// Compute composite DQS
const result = computeDQS(dimensions)

console.log(result)
// {
//   dimensions: {
//     completeness: 100,
//     uniqueness: 100,
//     consistency: 95,
//     validity: 100,
//     timeliness: 95
//   },
//   DQS: 98
// }
```

### Custom Weights

```javascript
// Equal weighting
const equalWeights = {
  completeness: 0.2,
  uniqueness: 0.2,
  consistency: 0.2,
  validity: 0.2,
  timeliness: 0.2,
}

const result = computeDQS(dimensions, equalWeights)
```

### Compliance-Focused Weights

```javascript
// Emphasize completeness and validity for compliance
const complianceWeights = {
  completeness: 0.35,  // Higher weight
  uniqueness: 0.15,
  consistency: 0.10,
  validity: 0.35,      // Higher weight
  timeliness: 0.05,    // Lower weight
}

const result = computeDQS(dimensions, complianceWeights)
```

### Without Timeliness

```javascript
// Timeliness is optional - weights are automatically redistributed
const dimensionsNoTimeliness = {
  completeness: 85,
  uniqueness: 90,
  consistency: 80,
  validity: 88,
  // timeliness not provided
}

const result = computeDQS(dimensionsNoTimeliness)
// Weights for other dimensions are proportionally increased
```

## Calculation Formula

```
DQS = Σ(score_i × weight_i) / Σ(weight_i)
```

Where:
- `score_i` = score for dimension i (0-100)
- `weight_i` = weight for dimension i (0-1)
- Final result is rounded to nearest integer

## Weight Normalization

- Weights are automatically normalized if they don't sum to 1.0
- If timeliness is missing, its weight is redistributed proportionally to other dimensions
- Invalid weights are handled gracefully (defaults to 0)

## Edge Cases

- **Missing dimensions**: Invalid or missing required dimensions default to 0
- **Invalid weights**: Weights are normalized automatically
- **No timeliness**: Weight is redistributed to other dimensions
- **Empty dimensions object**: Returns `{ dimensions: {}, DQS: 0 }`

## Notes

- DQS is always a rounded integer (0-100)
- Scores are clamped to 0-100 range
- Function is deterministic (same input = same output)
- Weights should sum to 1.0 for clarity (auto-normalized if not)

