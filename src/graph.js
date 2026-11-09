// Draws the current RDF data as a node-link diagram with Cytoscape.js.
import cytoscape from 'cytoscape'
import fcose from 'cytoscape-fcose'

cytoscape.use(fcose)

const RDF = 'http://www.w3.org/1999/02/22-rdf-syntax-ns#'
const RDF_TYPE = RDF + 'type'
const RDF_FIRST = RDF + 'first'
const RDF_REST = RDF + 'rest'
const RDF_NIL = RDF + 'nil'
const CLASS_TYPES = new Set([
  'http://www.w3.org/2002/07/owl#Class',
  'http://www.w3.org/2000/01/rdf-schema#Class'
])
const SCHEMA_PREDICATES = new Set([
  'http://www.w3.org/2000/01/rdf-schema#subClassOf',
  'http://www.w3.org/2002/07/owl#equivalentClass',
  'http://www.w3.org/2002/07/owl#disjointWith'
])
const MAX_ELEMENTS = 900

const termId = t => `${t.termType}:${t.value}`
// Node width from its label (monospace), so nodes keep their size even when labels are hidden at low zoom.
const textWidth = (label, size = 11) => Math.max(28, Math.round(label.length * size * 0.62) + 16)

function cssVar (name) {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim() || '#888'
}

/**
 * quads: all quads (asserted + inferred) as Oxigraph terms
 * inferredKeys: Set of `${s} ${p} ${o}` strings for inferred triples
 * opts: { showLiterals, showTypes, showInferred, label(term) -> string, onSelect(term) }
 */
export function renderGraph (container, quads, inferredKeys, opts) {
  const key = q => `${q.subject.toString()} ${q.predicate.toString()} ${q.object.toString()} ${q.graph.toString()}`
  const nodes = new Map()
  const edges = []
  const classIds = new Set()

  for (const q of quads) {
    if (q.predicate.value === RDF_TYPE) classIds.add(termId(q.object))
    if (q.predicate.value === RDF_TYPE && CLASS_TYPES.has(q.object.value)) classIds.add(termId(q.subject))
    if (SCHEMA_PREDICATES.has(q.predicate.value)) { classIds.add(termId(q.subject)); classIds.add(termId(q.object)) }
  }

  // RDF lists (blank-node chains of rdf:first / rdf:rest) are drawn as one node: ( a b c )
  const first = new Map(); const rest = new Map()
  for (const q of quads) {
    if (q.subject.termType !== 'BlankNode') continue
    if (q.predicate.value === RDF_FIRST) first.set(q.subject.value, q.object)
    if (q.predicate.value === RDF_REST) rest.set(q.subject.value, q.object)
  }
  const listCells = new Set(first.keys())
  const listItems = head => {
    const items = []; let cur = head; const seen = new Set()
    while (cur && cur.termType === 'BlankNode' && first.has(cur.value) && !seen.has(cur.value)) {
      seen.add(cur.value); items.push(first.get(cur.value)); cur = rest.get(cur.value)
    }
    return items
  }

  const addNode = (t, kind) => {
    const id = termId(t)
    if (!nodes.has(id)) { const label = opts.label(t); nodes.set(id, { data: { id, label, kind, term: t, w: textWidth(label) } }) }
    return id
  }

  const addList = head => {
    const id = termId(head)
    if (nodes.has(id)) return id
    const items = listItems(head)
    const label = '( ' + items.map(i => i.termType === 'BlankNode' ? '[…]' : opts.label(i)).join(' ') + ' )'
    nodes.set(id, { data: { id, label, kind: 'list', term: head, w: textWidth(label, 10) } })
    items.forEach(i => {   // nested anonymous classes/restrictions get an edge so their structure stays visible
      if (i.termType === 'BlankNode') {
        const t = addNode(i, 'blank')
        edges.push({ data: { id: `e${edges.length}`, source: id, target: t, label: 'item', inferred: false, isType: false } })
      }
    })
    return id
  }

  for (const q of quads) {
    if (listCells.has(q.subject.value) && q.subject.termType === 'BlankNode' && (q.predicate.value === RDF_FIRST || q.predicate.value === RDF_REST)) continue
    const inferred = inferredKeys.has(key(q))
    if (inferred && !opts.showInferred) continue
    const isType = q.predicate.value === RDF_TYPE
    if (isType && !opts.showTypes) continue
    if (q.object.termType === 'Literal' && !opts.showLiterals) continue
    if (isType && CLASS_TYPES.has(q.object.value)) continue   // "X a owl:Class" is shown by the class styling

    const s = addNode(q.subject, classIds.has(termId(q.subject)) ? 'class' : q.subject.termType === 'BlankNode' ? 'blank' : 'individual')
    let o
    if (q.object.termType === 'Literal') {
      o = `lit:${edges.length}`
      const text = q.object.value.length > 28 ? q.object.value.slice(0, 27) + '…' : q.object.value
      nodes.set(o, { data: { id: o, label: text, kind: 'literal', term: q.object, w: textWidth(text, 10) } })
    } else if (q.object.termType === 'BlankNode' && listCells.has(q.object.value)) {
      o = addList(q.object)
    } else if (q.object.value === RDF_NIL) {
      continue
    } else {
      o = addNode(q.object, classIds.has(termId(q.object)) ? 'class' : q.object.termType === 'BlankNode' ? 'blank' : 'individual')
    }
    edges.push({ data: { id: `e${edges.length}`, source: s, target: o, label: opts.label(q.predicate), inferred, isType } })
  }

  const elements = [...nodes.values(), ...edges]
  if (elements.length > MAX_ELEMENTS) {
    return { tooBig: elements.length }
  }

  const c = {
    text: cssVar('--text'), muted: cssVar('--muted'), faint: cssVar('--faint'),
    surface: cssVar('--surface'), accent: cssVar('--accent'), accentSoft: cssVar('--accent-soft'),
    ok: cssVar('--ok'), okSoft: cssVar('--ok-soft'), warn: cssVar('--warn'), warnSoft: cssVar('--warn-soft'),
    string: cssVar('--tok-string')
  }

  const cy = cytoscape({
    container,
    elements,
    minZoom: 0.05,
    maxZoom: 3,
    style: [
      { selector: 'node', style: {
        label: 'data(label)', 'font-family': 'JetBrains Mono, monospace', 'font-size': 11, color: c.text,
        'text-valign': 'center', 'text-halign': 'center', 'text-wrap': 'none',
        width: 'data(w)', height: 26, shape: 'round-rectangle',
        'background-color': c.accentSoft, 'border-width': 1.5, 'border-color': c.accent,
        'min-zoomed-font-size': 4 } },
      { selector: 'node[kind = "class"]', style: {
        'background-color': c.surface, 'border-style': 'dashed', color: c.accent, 'font-weight': 600 } },
      { selector: 'node[kind = "blank"]', style: {
        'background-color': c.warnSoft, 'border-color': c.warn, shape: 'ellipse' } },
      { selector: 'node[kind = "list"]', style: {
        'background-color': c.warnSoft, 'border-color': c.warn, 'border-style': 'dotted', 'font-size': 10 } },
      { selector: 'node[kind = "literal"]', style: {
        'background-color': c.okSoft, 'border-color': c.ok, color: c.string, height: 22, 'font-size': 10, shape: 'rectangle' } },
      { selector: 'node:selected', style: { 'border-width': 3 } },
      { selector: 'edge', style: {
        width: 1.3, 'line-color': c.muted, 'target-arrow-color': c.muted, 'target-arrow-shape': 'triangle',
        'arrow-scale': 0.9, 'curve-style': 'bezier', label: 'data(label)', 'font-size': 9,
        'font-family': 'JetBrains Mono, monospace', color: c.muted, 'text-rotation': 'autorotate',
        'text-background-color': c.surface, 'text-background-opacity': 0.85, 'text-background-padding': '2px',
        'min-zoomed-font-size': 4 } },
      { selector: 'edge[?isType]', style: { 'line-color': c.faint, 'target-arrow-color': c.faint, color: c.faint } },
      { selector: 'edge[?inferred]', style: { 'line-style': 'dashed', 'line-color': c.warn, 'target-arrow-color': c.warn, color: c.warn } }
    ],
    layout: { name: 'null' }
  })
  // Lay out only once the (just un-hidden) container has its real size, then fit to it.
  requestAnimationFrame(() => {
    cy.resize()
    const W = cy.width(), H = cy.height()
    cy.layout({
      name: 'fcose', quality: 'default', animate: false, randomize: true, fit: false,
      nodeDimensionsIncludeLabels: true, packComponents: true,
      idealEdgeLength: 70, nodeRepulsion: 6000, edgeElasticity: 0.45, gravity: 0.3,
      nodeSeparation: 60, tilingPaddingVertical: 12, tilingPaddingHorizontal: 12
    }).run()
    // Stretch the result to the panel's shape (layouts come out roughly square) …
    const bb = cy.elements().boundingBox()
    if (bb.w > 0 && bb.h > 0 && W > 0 && H > 0) {
      const ratio = (W / H) / (bb.w / bb.h)
      const sx = ratio > 1 ? Math.min(ratio, 2.5) : 1
      const sy = ratio < 1 ? Math.min(1 / ratio, 2.5) : 1
      if (sx !== 1 || sy !== 1) cy.nodes().positions(n => ({ x: n.position('x') * sx, y: n.position('y') * sy }))
    }
    // … then fit, but never so far out that labels become unreadable. "fit" shows everything.
    cy.fit(undefined, 20)
    const READABLE = 0.55
    if (cy.zoom() < READABLE) { cy.zoom(READABLE); cy.center() }
  })
  cy.on('tap', 'node', evt => opts.onSelect?.(evt.target.data('term'), evt.target.data('kind')))
  return { cy, nodes: nodes.size, edges: edges.length }
}
