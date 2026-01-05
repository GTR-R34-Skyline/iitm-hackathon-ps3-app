export function buildDatasetProfile(
  rows: any[],
  headers: string[]
) {
  const rowCount = rows.length
  const profile: any = {
    rowCount,
    columns: {},
  }

  headers.forEach((col) => {
    let nulls = 0
    const values = new Set<any>()

    rows.forEach((row) => {
      const val = row[col]
      if (val === null || val === undefined || val === "") {
        nulls++
      } else {
        values.add(val)
      }
    })

    profile.columns[col] = {
      nullRate: +(nulls / rowCount).toFixed(3),
      uniqueRate: +(values.size / rowCount).toFixed(3),
    }
  })

  return profile
}
