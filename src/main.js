import './style.css'
import { marked } from 'marked'
import { initEngine, buildStore, runQuery, validateShacl, RULES } from './engine.js'
import { createEditor } from './editor.js'
import { lessons } from './lessons.js'

const $ = id => document.getElementById(id)

// ---------- small storage helpers (never let storage errors break the page) ----------
const store = {
  get (k, d = null) { try { const v = localStorage.getItem(k); return v === null ? d : JSON.parse(v) } catch { return d } },
  set (k, v) { try { localStorage.setItem(k, JSON.stringify(v)) } catch {} },
  del (k) { try { localStorage.removeItem(k) } catch {} }
}

// ---------- theme ----------
// Follows the system setting until the learner flips the switch; the choice is then remembered.
const systemDark = matchMedia('(prefers-color-scheme: dark)')
const isDark = () => document.documentElement.dataset.theme
  ? document.documentElement.dataset.theme === 'dark'
  : systemDark.matches
function syncThemeSwitch () {
  $('themeBtn').setAttribute('aria-checked', String(isDark()))
}
const savedTheme = store.get('ob:theme')
if (savedTheme) document.documentElement.dataset.theme = savedTheme
syncThemeSwitch()
systemDark.addEventListener('change', syncThemeSwitch)
$('themeBtn').onclick = () => {
  const next = isDark() ? 'light' : 'dark'
  document.documentElement.dataset.theme = next
  store.set('ob:theme', next)
  syncThemeSwitch()
}

// ---------- prefixes & term display ----------
const DEFAULT_PREFIXES = {
  rdf: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#',
  rdfs: 'http://www.w3.org/2000/01/rdf-schema#',
  owl: 'http://www.w3.org/2002/07/owl#',
  xsd: 'http://www.w3.org/2001/XMLSchema#',
  skos: 'http://www.w3.org/2004/02/skos/core#',
  sh: 'http://www.w3.org/ns/shacl#'
}
let prefixes = { ...DEFAULT_PREFIXES }

function collectPrefixes (...texts) {
  const p = { ...DEFAULT_PREFIXES }
  const re = /(?:@prefix|PREFIX)\s+([\w-]*):\s*<([^>]*)>/gi
  for (const t of texts) for (const m of (t || '').matchAll(re)) p[m[1]] = m[2]
  return p
}

function compactIri (iri) {
  let best = null
  for (const [pfx, ns] of Object.entries(prefixes)) {
    if (iri.startsWith(ns) && (!best || ns.length > best[1].length)) {
      const local = iri.slice(ns.length)
      if (/^[\w-]*$/.test(local)) best = [pfx, ns, local]
    }
  }
  return best ? `${best[0]}:${best[2]}` : `<${iri}>`
}

// Terms come either from Oxigraph objects (termType) or SPARQL JSON (type).
function termInfo (t) {
  if (!t) return { text: '', cls: 'unbound' }
  const type = t.termType || t.type
  if (type === 'NamedNode' || type === 'uri') return { text: compactIri(t.value), cls: 'iri', title: t.value }
  if (type === 'BlankNode' || type === 'bnode') return { text: `_:${t.value}`, cls: 'bnode' }
  const lang = t.language || t['xml:lang']
  const dt = t.datatype?.value ?? t.datatype
  let suffix = ''
  if (lang) suffix = `@${lang}`
  else if (dt && dt !== DEFAULT_PREFIXES.xsd + 'string') suffix = `^^${compactIri(dt)}`
  return { text: t.value, suffix, cls: 'literal' }
}

function termKey (t) {
  const i = termInfo(t)
  return i.cls === 'iri' ? i.title : i.text + (i.suffix || '')
}

const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]))

function termHtml (t) {
  const i = termInfo(t)
  if (i.cls === 'unbound') return '<span class="unbound">—</span>'
  if (i.cls === 'literal') return `<span class="literal">${esc(i.text)}</span>${i.suffix ? `<span class="dt">${esc(i.suffix)}</span>` : ''}`
  return `<span class="${i.cls}"${i.title ? ` title="${esc(i.title)}"` : ''}>${esc(i.text)}</span>`
}

// ---------- editors ----------
let saveTimer = null
const onChange = () => {
  clearTimeout(saveTimer)
  saveTimer = setTimeout(saveDraft, 400)
}
const dataEd = createEditor($('dataEditor'), 'turtle', { onRun: () => run(), onChange })
const shapesEd = createEditor($('shapesEditor'), 'turtle', { onRun: () => validate(), onChange })
const queryEd = createEditor($('queryEditor'), 'sparql', { onRun: () => run(), onChange })

for (const tab of document.querySelectorAll('.tab')) {
  tab.onclick = () => showTab(tab.dataset.tab)
}
function showTab (name) {
  for (const tab of document.querySelectorAll('.tab')) tab.classList.toggle('active', tab.dataset.tab === name)
  $('dataEditor').hidden = name !== 'data'
  $('shapesEditor').hidden = name !== 'shapes'
}

// ---------- lesson navigation ----------
let current = null
const doneSet = new Set(store.get('ob:done', []))

function buildToc () {
  let html = ''
  let section = null
  lessons.forEach((l, i) => {
    if (l.section !== section) {
      if (section !== null) html += '</ol>'
      section = l.section
      html += `<h4>${esc(section)}</h4><ol>`
    }
    const mark = l.check ? (doneSet.has(l.id) ? '<span class="tick" title="Completed">✓</span>' : '<span class="dot" title="Has an exercise">•</span>') : ''
    html += `<li><a href="#/${l.id}" data-id="${l.id}"><span class="num">${i}</span>${esc(l.title)}${mark}</a></li>`
  })
  html += '</ol>'
  $('toc').innerHTML = html
  const total = lessons.filter(l => l.check).length
  const done = lessons.filter(l => l.check && doneSet.has(l.id)).length
  $('progress').innerHTML = `<span class="bar"><span style="width:${total ? (100 * done / total) : 0}%"></span></span>${done}/${total}`
  highlightToc()
}
function highlightToc () {
  for (const a of $('toc').querySelectorAll('a')) a.classList.toggle('current', current && a.dataset.id === current.id)
}

const toggleToc = open => document.body.classList.toggle('toc-open', open)
$('tocBtn').onclick = () => toggleToc(!document.body.classList.contains('toc-open'))
$('scrim').onclick = () => toggleToc(false)
$('toc').addEventListener('click', e => { if (e.target.closest('a')) toggleToc(false) })

function draftKey (l) { return `ob:lesson:${l.id}` }
function saveDraft () {
  if (!current) return
  store.set(draftKey(current), { data: dataEd.value, shapes: shapesEd.value, query: queryEd.value })
}

function loadLesson (id) {
  const idx = Math.max(0, lessons.findIndex(l => l.id === id))
  const l = lessons[idx]
  current = l
  document.title = `${l.title} · Ontology Basics`
  $('crumb').textContent = l.section ? `${l.section} › ${l.title}` : l.title

  $('lessonBody').innerHTML = marked.parse(l.body)
  enhanceContent()

  const draft = store.get(draftKey(l))
  dataEd.value = draft?.data ?? l.data
  shapesEd.value = draft?.shapes ?? (l.shapes || '')
  queryEd.value = draft?.query ?? l.query

  const hasShapes = l.shapes !== null
  $('shapesTab').hidden = !hasShapes
  $('validateBtn').hidden = !hasShapes
  showTab(hasShapes ? (l.tab || 'shapes') : 'data')
  $('reasoning').value = l.reasoning

  $('exercise').hidden = !l.check
  $('checkMsg').textContent = ''
  $('checkMsg').className = 'check-msg'

  const prev = lessons[idx - 1]
  const next = lessons[idx + 1]
  $('prevLink').href = prev ? `#/${prev.id}` : '#'
  $('prevLink').classList.toggle('disabled', !prev)
  $('nextLink').href = next ? `#/${next.id}` : '#'
  $('nextLink').classList.toggle('disabled', !next)
  $('pageNum').textContent = `${idx} / ${lessons.length - 1}`
  $('lesson').scrollTop = 0
  window.scrollTo(0, 0)
  highlightToc()

  $('results').innerHTML = '<p class="faint pad">Run the query to see results.</p>'
  $('resultsMeta').textContent = ''
  $('resultsTitle').textContent = 'Results'
  ready.then(() => {
    if (hasShapes && l.start !== 'query') validate()
    else if (queryEd.value.trim()) run()
    else updateDataStatus()
  })
}

function enhanceContent () {
  for (const code of $('lessonBody').querySelectorAll('pre > code')) {
    const pre = code.parentElement
    const isSparql = code.classList.contains('language-sparql')
    const isTurtle = code.classList.contains('language-turtle-add')
    if (!isSparql && !isTurtle) continue
    const bar = document.createElement('div')
    bar.className = 'code-actions'
    if (isSparql) {
      const b = document.createElement('button')
      b.className = 'btn small'
      b.textContent = '▶ Try this query'
      b.onclick = () => { queryEd.value = code.textContent.trimEnd(); run(); scrollWorkbenchIntoView() }
      bar.append(b)
    } else {
      const b = document.createElement('button')
      b.className = 'btn small'
      b.textContent = '+ Add to data'
      b.title = 'Append this snippet to the Data editor'
      b.onclick = () => {
        dataEd.value = dataEd.value.trimEnd() + '\n\n' + stripDuplicatePrefixes(code.textContent.trimEnd(), dataEd.value) + '\n'
        showTab('data'); run(); scrollWorkbenchIntoView()
      }
      bar.append(b)
    }
    pre.after(bar)
  }
  for (const a of $('lessonBody').querySelectorAll('a[href^="http"]')) { a.target = '_blank'; a.rel = 'noopener' }
}

function stripDuplicatePrefixes (snippet, existing) {
  return snippet.split('\n').filter(line => {
    const m = line.match(/^\s*@prefix\s+([\w-]*):/)
    return !(m && new RegExp(`@prefix\\s+${m[1]}:`).test(existing))
  }).join('\n')
}

function scrollWorkbenchIntoView () {
  if (matchMedia('(max-width: 900px)').matches) $('queryPanel').scrollIntoView({ behavior: 'smooth' })
}

// ---------- running ----------
function queryForm (q) {
  const body = q.replace(/#[^\n]*/g, '').replace(/(PREFIX|BASE)[^\n]*/gi, '')
  const m = body.match(/\b(SELECT|ASK|CONSTRUCT|DESCRIBE)\b/i)
  return m ? m[1].toUpperCase() : 'SELECT'
}

function build (reasoning = $('reasoning').value) {
  prefixes = collectPrefixes(dataEd.value, shapesEd.value, queryEd.value)
  return buildStore(dataEd.value, reasoning)
}

let lastBuild = null
function updateDataStatus (b = null) {
  const el = $('dataStatus')
  try {
    b = b || build()
    lastBuild = b
    const total = b.store.size
    let html = `${total} triple${total === 1 ? '' : 's'}`
    if ($('reasoning').value !== 'none') {
      html += ` · <button class="link-btn" id="showInferred">${b.inferred.length} inferred</button>`
    }
    if (b.clashes.length) html += ` · <span class="warn">⚠ ${b.clashes.length} inconsistenc${b.clashes.length === 1 ? 'y' : 'ies'}</span>`
    el.innerHTML = html
    el.classList.remove('error')
    const si = $('showInferred')
    if (si) si.onclick = () => showInferred()
  } catch (e) {
    el.textContent = 'Data error: ' + cleanError(e)
    el.classList.add('error')
    lastBuild = null
  }
  return lastBuild
}

function cleanError (e) {
  return String(e?.message || e).replace(/^Error:\s*/, '')
}

function showError (where, e) {
  $('resultsTitle').textContent = 'Error'
  $('resultsMeta').textContent = ''
  $('results').innerHTML = `<div class="error-box"><strong>${esc(where)}</strong><pre>${esc(cleanError(e))}</pre></div>`
}

function clashHtml (b) {
  if (!b?.clashes?.length) return ''
  return `<div class="warn-box"><strong>⚠ The data is inconsistent under OWL:</strong><ul>${
    b.clashes.map(c => `<li>${termHtml(c.x)} ${esc(c.msg.replace(/https?:\/\/[^\s,]+/g, m => compactIri(m)))}</li>`).join('')
  }</ul></div>`
}

function run () {
  const b = updateDataStatus()
  if (!b) { showError('Your Turtle data has a syntax error', $('dataStatus').textContent.replace('Data error: ', '')); return }
  const q = queryEd.value
  if (!q.trim()) { $('results').innerHTML = clashHtml(b) + '<p class="faint pad">Write a query, then press Run.</p>'; return }
  const t0 = performance.now()
  try {
    const form = queryForm(q)
    let html = clashHtml(b)
    let meta = ''
    if (form === 'SELECT' || form === 'ASK') {
      const json = JSON.parse(runQuery(b.store, q, 'json'))
      if ('boolean' in json) {
        html += `<div class="ask ${json.boolean ? 'yes' : 'no'}">${json.boolean ? 'true' : 'false'}</div>`
        meta = 'ASK'
      } else {
        html += tableHtml(json.head.vars, json.results.bindings.map(r => json.head.vars.map(v => r[v])))
        const n = json.results.bindings.length
        meta = `${n} row${n === 1 ? '' : 's'}`
      }
    } else {
      const quads = runQuery(b.store, q)
      html += tableHtml(['subject', 'predicate', 'object'], quads.map(x => [x.subject, x.predicate, x.object]))
      meta = `${quads.length} triple${quads.length === 1 ? '' : 's'}`
    }
    $('resultsTitle').textContent = `Results · ${form}`
    $('resultsMeta').textContent = `${meta} · ${Math.round(performance.now() - t0)} ms`
    $('results').innerHTML = html
  } catch (e) {
    showError('Query error', e)
  }
}

function tableHtml (vars, rows) {
  if (!rows.length) return '<p class="faint pad">No results. (Zero rows is an answer too — check your patterns and prefixes.)</p>'
  return `<table class="bindings"><thead><tr>${vars.map(v => `<th>${esc(v)}</th>`).join('')}</tr></thead><tbody>${
    rows.map(r => `<tr>${r.map(t => `<td>${termHtml(t)}</td>`).join('')}</tr>`).join('')
  }</tbody></table>`
}

function showInferred () {
  if (!lastBuild) return
  $('resultsTitle').textContent = 'Inferred triples'
  $('resultsMeta').textContent = `${lastBuild.inferred.length} new triple(s) after ${lastBuild.iterations} round(s) of rules`
  $('results').innerHTML = clashHtml(lastBuild) + tableHtml(['subject', 'predicate', 'object'],
    lastBuild.inferred.map(q => [q.subject, q.predicate, q.object]))
}

async function validate () {
  const b = updateDataStatus()
  if (!b) { showError('Your Turtle data has a syntax error', $('dataStatus').textContent); return null }
  try {
    const report = await validateShacl(dataEd.value, shapesEd.value, b.inferred)
    $('resultsTitle').textContent = 'SHACL validation report'
    $('resultsMeta').textContent = `${report.results.length} result${report.results.length === 1 ? '' : 's'}`
    let html = `<div class="conform ${report.conforms ? 'yes' : 'no'}">${report.conforms ? '✓ Data conforms to the shapes' : '✗ Data does not conform'}</div>`
    if (report.results.length) {
      html += `<table><thead><tr><th>Severity</th><th>Focus node</th><th>Path</th><th>Value</th><th>Message</th><th>Constraint</th></tr></thead><tbody>${
        report.results.map(r => `<tr>
          <td><span class="sev ${esc((r.severity || '').split('#').pop())}">${esc((r.severity || '').split('#').pop())}</span></td>
          <td>${termHtml(r.focusNode)}</td>
          <td>${(r.path || []).map(p => `<span class="iri">${esc(compactIri(p))}</span>`).join(' / ') || '<span class="unbound">—</span>'}</td>
          <td>${r.value ? termHtml(r.value) : '<span class="unbound">—</span>'}</td>
          <td>${esc(r.message)}</td>
          <td class="faint">${esc((r.component || '').split('#').pop().replace('ConstraintComponent', ''))}</td></tr>`).join('')
      }</tbody></table>`
    }
    $('results').innerHTML = html
    return report
  } catch (e) {
    showError('Validation error (check the Shapes tab for Turtle errors)', e)
    return null
  }
}

// ---------- exercises ----------
function normalizeSelect (json, ordered) {
  if ('boolean' in json) return [String(json.boolean)]
  const rows = json.results.bindings.map(r => json.head.vars.map(v => r[v] ? termKey(r[v]) : '').sort().join('\u0001'))
  return ordered ? rows : rows.sort()
}
function resultSignature (storeObj, q) {
  const form = queryForm(q)
  if (form === 'SELECT' || form === 'ASK') {
    return normalizeSelect(JSON.parse(runQuery(storeObj, q, 'json')), /ORDER\s+BY/i.test(q))
  }
  return [...new Set(runQuery(storeObj, q).map(x => [x.subject, x.predicate, x.object].map(termKey).join(' ')))].sort()
}

function setCheck (ok, msg) {
  $('checkMsg').textContent = msg
  $('checkMsg').className = 'check-msg ' + (ok ? 'ok' : 'bad')
  if (ok) {
    doneSet.add(current.id)
    store.set('ob:done', [...doneSet])
    buildToc()
  }
}

$('checkBtn').onclick = async () => {
  const l = current
  try {
    if (l.check === 'query') {
      run()
      const b = build(l.checkReasoning || undefined)
      const mine = resultSignature(b.store, queryEd.value)
      const expected = resultSignature(b.store, l.solution)
      const same = mine.length === expected.length && mine.every((r, i) => r === expected[i])
      if (same) setCheck(true, '✓ Correct! Your results match.')
      else if (mine.length !== expected.length) setCheck(false, `Not yet — you got ${mine.length} result(s), expected ${expected.length}.`)
      else setCheck(false, 'Not yet — same number of results, but different values (or order).')
    } else if (l.check === 'ask') {
      run()
      const b = build(l.checkReasoning || undefined)
      const ok = JSON.parse(runQuery(b.store, l.checkQuery, 'json')).boolean
      setCheck(ok, ok ? '✓ Correct! The data now satisfies the goal.' : 'Not yet — the goal is not met by the current data.')
    } else if (l.check === 'shacl') {
      const report = await validate()
      if (!report) return
      const got = new Set(report.results.map(r => termInfo(r.focusNode).text))
      const want = new Set(l.expectFocus)
      const same = got.size === want.size && [...want].every(x => got.has(x))
      if (same) setCheck(true, want.size ? `✓ Correct! Exactly the right node(s) are flagged: ${[...want].join(', ')}.` : '✓ Correct! The data conforms.')
      else if (!want.size) setCheck(false, 'Not yet — the data should conform (no violations).')
      else setCheck(false, `Not yet — flagged: ${[...got].join(', ') || 'nothing'}. Expected exactly: ${[...want].join(', ')}.`)
    }
  } catch (e) {
    setCheck(false, 'Error: ' + cleanError(e))
  }
}

$('solutionBtn').onclick = () => {
  const l = current
  if (l.solution) queryEd.value = l.solution
  if (l.solutionData) { dataEd.value = l.solutionData; showTab('data') }
  if (l.solutionShapes) { shapesEd.value = l.solutionShapes; showTab('shapes') }
  if (l.shapes !== null && l.check === 'shacl') validate(); else run()
}

$('resetBtn').onclick = () => {
  store.del(draftKey(current))
  loadLesson(current.id)
}
$('runBtn').onclick = () => run()
$('validateBtn').onclick = () => validate()
$('reasoning').onchange = () => { if (queryEd.value.trim()) run(); else updateDataStatus() }

// ---------- rules dialog ----------
$('rulesBtn').onclick = () => {
  const section = (title, rules) => `<h3>${title}</h3>${rules.map(r => `<p><strong>${esc(r.name)}</strong></p><pre><code>${esc(r.sparql)}</code></pre>`).join('')}`
  $('rulesBody').innerHTML = `<p>When reasoning is on, these SPARQL <code>INSERT</code> rules run over your data again and again until nothing new appears. That is all a rule-based reasoner does! “RDFS + OWL RL” is a teaching subset of the official OWL 2 RL rules, not a complete OWL reasoner.</p>` +
    section('RDFS', RULES.rdfs) + section('OWL RL (subset)', RULES.owl)
  $('rulesDialog').showModal()
}
$('rulesClose').onclick = () => $('rulesDialog').close()
$('rulesDialog').addEventListener('click', e => { if (e.target === $('rulesDialog')) $('rulesDialog').close() })

// ---------- boot ----------
const ready = initEngine()
buildToc()
const route = () => loadLesson(decodeURIComponent(location.hash.replace(/^#\/?/, '')))
window.addEventListener('hashchange', route)
route()
ready.catch(e => showError('Could not start the SPARQL engine', e))
