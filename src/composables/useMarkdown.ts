export function countCheckboxes(body: string): { done: number; total: number } {
  const matches = body.match(/- \[([ x])\]/g) || []
  return {
    done: matches.filter(m => m.includes('[x]')).length,
    total: matches.length,
  }
}

export function toggleCheckbox(body: string, index: number): string {
  let ci = -1
  return body
    .split('\n')
    .map(line => {
      const m = line.match(/^(\s*- \[)([ x])(\] .+)$/)
      if (m) {
        ci++
        if (ci === index) {
          return m[1] + (m[2] === 'x' ? ' ' : 'x') + m[3]
        }
      }
      return line
    })
    .join('\n')
}
