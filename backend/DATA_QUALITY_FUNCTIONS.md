# Data Quality Scoring Functions

Reusable JavaScript functions for computing data quality scores across 5 dimensions.

## Functions

### `computeCompleteness(rows)`

Calculates the percentage of non-empty values across all rows and columns.

**Parameters:**
- `rows` (Array<Object>): Array of row objects

**Returns:** Number (0-100)

**Logic:**
- Counts total cells and non-empty cells
- Empty = null, undefined, empty string, or whitespace-only
- Score = (non-empty cells / total cells) × 100

**Example:**
```javascript
const rows = [
  { id: '1', name: 'John', email: 'john@example.com' },
  { id: '2', name: '', email: 'jane@example.com' }, // Empty name
]
const score = computeCompleteness(rows) // ~83 (5/6 non-empty)
```

---

### `computeUniqueness(rows)`

Calculates the average uniqueness across all columns.

**Parameters:**
- `rows` (Array<Object>): Array of row objects

**Returns:** Number (0-100)

**Logic:**
- For each column: uniqueness = (unique values / total values) × 100
- Final score = average of all column uniqueness scores

**Example:**
```javascript
const rows = [
  { id: '1', name: 'John' },
  { id: '2', name: 'John' }, // Duplicate name
  { id: '3', name: 'Jane' },
]
const score = computeUniqueness(rows) // Lower score due to duplicate
```

---

### `computeConsistency(rows)`

Measures format consistency across rows using length variance.

**Parameters:**
- `rows` (Array<Object>): Array of row objects

**Returns:** Number (0-100)

**Logic:**
- For each column, calculates average deviation from mean length
- Lower deviation = higher consistency
- Score = 100 - (normalized deviation)

**Example:**
```javascript
const rows = [
  { name: 'John', email: 'john@example.com' },
  { name: 'Jane', email: 'jane@example.com' },
]
const score = computeConsistency(rows) // High score (consistent lengths)
```

---

### `computeValidity(rows)`

Measures the percentage of rows with valid key fields.

**Parameters:**
- `rows` (Array<Object>): Array of row objects

**Returns:** Number (0-100)

**Logic:**
- Uses first column as key field (typically ID)
- Counts rows where key field is non-empty
- Score = (valid rows / total rows) × 100

**Example:**
```javascript
const rows = [
  { id: '1', name: 'John' },
  { id: '', name: 'Jane' }, // Invalid (empty ID)
  { id: '3', name: 'Bob' },
]
const score = computeValidity(rows) // 67 (2/3 valid)
```

---

### `computeTimeliness(rows)`

Measures data freshness based on date columns.

**Parameters:**
- `rows` (Array<Object>): Array of row objects

**Returns:** Number (0-100)

**Logic:**
- Auto-detects date columns (looks for: date, time, timestamp, created, updated, modified)
- Calculates average age of dates
- Scores based on age thresholds:
  - < 1 hour: 100
  - < 6 hours: 95
  - < 24 hours: 85
  - < 72 hours: 70
  - < 168 hours (1 week): 50
  - ≥ 168 hours: 30
- Returns 50 (neutral) if no date column found

**Example:**
```javascript
const rows = [
  { id: '1', date: '2024-01-15' }, // Recent
  { id: '2', date: '2024-01-14' },
]
const score = computeTimeliness(rows) // High score (recent dates)
```

---

### `computeAllScores(rows)`

Convenience function that computes all dimension scores.

**Parameters:**
- `rows` (Array<Object>): Array of row objects

**Returns:** Object
```javascript
{
  completeness: number,
  uniqueness: number,
  consistency: number,
  validity: number,
  timeliness: number
}
```

**Example:**
```javascript
const rows = [
  { id: '1', name: 'John', email: 'john@example.com', date: '2024-01-15' },
  { id: '2', name: 'Jane', email: 'jane@example.com', date: '2024-01-14' },
]
const scores = computeAllScores(rows)
console.log(scores)
// {
//   completeness: 100,
//   uniqueness: 100,
//   consistency: 95,
//   validity: 100,
//   timeliness: 95
// }
```

## Usage

### Node.js / CommonJS

```javascript
const {
  computeCompleteness,
  computeUniqueness,
  computeConsistency,
  computeValidity,
  computeTimeliness,
  computeAllScores,
} = require('./data-quality-functions.js')

const rows = [{ id: '1', name: 'John' }, { id: '2', name: 'Jane' }]
const scores = computeAllScores(rows)
```

### Browser / ES Modules

```html
<script src="data-quality-functions.js"></script>
<script>
  const rows = [{ id: '1', name: 'John' }]
  const scores = DataQuality.computeAllScores(rows)
</script>
```

## Edge Cases

All functions handle edge cases gracefully:

- **Empty array**: Returns 0 (or 50 for timeliness if no dates)
- **Empty objects**: Returns valid scores based on available data
- **Missing columns**: Logs warning, returns valid score
- **Invalid data types**: Converts to string safely
- **No date column**: Timeliness returns 50 (neutral)

Functions log warnings to console but **never throw errors** for edge cases.

## Score Range

All scores are guaranteed to be between **0-100** (inclusive).

## Notes

- All functions are **deterministic** (same input = same output)
- Functions are **pure** (no side effects, except console warnings)
- Logic is **simple and explainable** (no machine learning)
- Performance is optimized for typical CSV sizes (thousands of rows)

