// Loads lessons/*.md. Each file has a small front matter block and special fenced blocks:
//   ```turtle data          starting data shown in the Data tab
//   ```turtle shapes        starting SHACL shapes (enables the Shapes tab)
//   ```sparql query         starting query
//   ```sparql solution      exercise: learner's query must return the same results as this one
//   ```sparql check         exercise: this ASK must be true on the learner's data
//   ```turtle solution-data / solution-shapes   loaded by "Show solution"
// Everything else is the lesson text (Markdown).

const files = import.meta.glob('../lessons/*.md', { query: '?raw', import: 'default', eager: true })

const SPECIAL = /```(turtle|sparql)[ \t]+(data|shapes|query|solution|check|solution-data|solution-shapes)[ \t]*\n([\s\S]*?)\n```[ \t]*\n?/g

// SHACL pages have no starting query, so offer one for exploring the data.
const EXPLORE_QUERY = `# SPARQL works here too. Explore the data, e.g. all typed things:
SELECT ?thing ?type
WHERE { ?thing a ?type }
ORDER BY ?type ?thing
`

function parseFrontMatter (src) {
  const m = src.match(/^---\n([\s\S]*?)\n---\n/)
  if (!m) return [{}, src]
  const meta = {}
  for (const line of m[1].split('\n')) {
    const i = line.indexOf(':')
    if (i > 0) meta[line.slice(0, i).trim()] = line.slice(i + 1).trim()
  }
  return [meta, src.slice(m[0].length)]
}

function parseLesson (path, src) {
  const id = path.split('/').pop().replace(/\.md$/, '')
  const [meta, rest] = parseFrontMatter(src)
  const blocks = {}
  const body = rest.replace(SPECIAL, (_, _lang, kind, code) => {
    blocks[kind] = code
    return ''
  })
  let check = null
  if (blocks.check) check = 'ask'           // an ASK on the learner's data (a solution query may also be given)
  else if (blocks.solution) check = 'query'
  else if (meta.expect_focus !== undefined) check = 'shacl'
  return {
    id,
    title: meta.title || id,
    section: meta.section || '',
    reasoning: meta.reasoning || 'none',
    checkReasoning: meta.check_reasoning || null,
    tab: meta.tab || null,
    format: meta.format || 'turtle',
    start: meta.start || null,
    expectFocus: meta.expect_focus !== undefined
      ? meta.expect_focus.split(/[\s,]+/).filter(Boolean)
      : null,
    check,
    body,
    data: blocks.data ?? '',
    shapes: blocks.shapes ?? null,
    query: blocks.query ?? (blocks.shapes ? EXPLORE_QUERY : ''),
    solution: blocks.solution ?? null,
    checkQuery: blocks.check ?? null,
    solutionData: blocks['solution-data'] ?? null,
    solutionShapes: blocks['solution-shapes'] ?? null
  }
}

export const lessons = Object.keys(files)
  .sort()
  .map(p => parseLesson(p, files[p]))
