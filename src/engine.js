// Engine: in-browser triple store (Oxigraph/WASM), rule-based reasoning, SHACL validation.
import initOxigraph, * as ox from 'oxigraph/web.js'
import { Parser, Writer, DataFactory as N3 } from 'n3'
import rdfDataModel from '@rdfjs/data-model'
import rdfDataset from '@rdfjs/dataset'
import Validator from 'shacl-engine/Validator.js'

let ready = null
export function initEngine () {
  if (!ready) ready = initOxigraph()
  return ready
}

const P = `
PREFIX rdf:  <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
PREFIX owl:  <http://www.w3.org/2002/07/owl#>
`

// Each rule is a SPARQL INSERT ... WHERE. They are applied repeatedly until
// nothing new is produced (a "fixpoint"). Learners can read these in the UI.
export const RULES = {
  rdfs: [
    { name: 'rdfs9 — instances inherit superclasses', sparql: 'INSERT { ?x a ?d } WHERE { ?x a ?c . ?c rdfs:subClassOf ?d }' },
    { name: 'rdfs11 — subClassOf is transitive', sparql: 'INSERT { ?a rdfs:subClassOf ?c } WHERE { ?a rdfs:subClassOf ?b . ?b rdfs:subClassOf ?c }' },
    { name: 'rdfs5 — subPropertyOf is transitive', sparql: 'INSERT { ?p rdfs:subPropertyOf ?r } WHERE { ?p rdfs:subPropertyOf ?q . ?q rdfs:subPropertyOf ?r }' },
    { name: 'rdfs7 — statements inherit super-properties', sparql: 'INSERT { ?x ?q ?y } WHERE { ?p rdfs:subPropertyOf ?q . ?x ?p ?y }' },
    { name: 'rdfs2 — domain types the subject', sparql: 'INSERT { ?x a ?c } WHERE { ?p rdfs:domain ?c . ?x ?p ?y }' },
    { name: 'rdfs3 — range types the object', sparql: 'INSERT { ?y a ?c } WHERE { ?p rdfs:range ?c . ?x ?p ?y . FILTER(!isLiteral(?y)) }' }
  ],
  owl: [
    { name: 'eq-sym — sameAs is symmetric', sparql: 'INSERT { ?y owl:sameAs ?x } WHERE { ?x owl:sameAs ?y }' },
    { name: 'eq-trans — sameAs is transitive', sparql: 'INSERT { ?x owl:sameAs ?z } WHERE { ?x owl:sameAs ?y . ?y owl:sameAs ?z FILTER(?x != ?z) }' },
    { name: 'eq-rep-s — copy statements across sameAs (subject)', sparql: 'INSERT { ?y ?p ?o } WHERE { ?x owl:sameAs ?y . ?x ?p ?o FILTER(?p != owl:sameAs) }' },
    { name: 'eq-rep-o — copy statements across sameAs (object)', sparql: 'INSERT { ?s ?p ?y } WHERE { ?x owl:sameAs ?y . ?s ?p ?x FILTER(?p != owl:sameAs) }' },
    { name: 'prp-inv — inverseOf (both directions)', sparql: 'INSERT { ?y ?q ?x } WHERE { { ?p owl:inverseOf ?q } UNION { ?q owl:inverseOf ?p } ?x ?p ?y FILTER(!isLiteral(?y)) }' },
    { name: 'prp-symp — SymmetricProperty', sparql: 'INSERT { ?y ?p ?x } WHERE { ?p a owl:SymmetricProperty . ?x ?p ?y FILTER(!isLiteral(?y)) }' },
    { name: 'prp-trp — TransitiveProperty', sparql: 'INSERT { ?x ?p ?z } WHERE { ?p a owl:TransitiveProperty . ?x ?p ?y . ?y ?p ?z }' },
    { name: 'prp-fp — FunctionalProperty ⇒ values are the same', sparql: 'INSERT { ?y1 owl:sameAs ?y2 } WHERE { ?p a owl:FunctionalProperty . ?x ?p ?y1 . ?x ?p ?y2 FILTER(?y1 != ?y2 && !isLiteral(?y1) && !isLiteral(?y2)) }' },
    { name: 'prp-ifp — InverseFunctionalProperty ⇒ subjects are the same', sparql: 'INSERT { ?x1 owl:sameAs ?x2 } WHERE { ?p a owl:InverseFunctionalProperty . ?x1 ?p ?y . ?x2 ?p ?y FILTER(?x1 != ?x2) }' },
    { name: 'cax-eqc — equivalentClass ⇒ subclass both ways', sparql: 'INSERT { ?a rdfs:subClassOf ?b . ?b rdfs:subClassOf ?a } WHERE { ?a owl:equivalentClass ?b }' },
    { name: 'prp-eqp — equivalentProperty ⇒ subproperty both ways', sparql: 'INSERT { ?a rdfs:subPropertyOf ?b . ?b rdfs:subPropertyOf ?a } WHERE { ?a owl:equivalentProperty ?b }' },
    { name: 'cls-hv1 — hasValue: members get the value', sparql: 'INSERT { ?x ?p ?v } WHERE { ?c owl:hasValue ?v ; owl:onProperty ?p . ?x a ?c }' },
    { name: 'cls-hv2 — hasValue: having the value ⇒ membership', sparql: 'INSERT { ?x a ?c } WHERE { ?c owl:hasValue ?v ; owl:onProperty ?p . ?x ?p ?v }' },
    { name: 'cls-svf1 — someValuesFrom ⇒ membership', sparql: 'INSERT { ?x a ?c } WHERE { ?c owl:someValuesFrom ?d ; owl:onProperty ?p . ?x ?p ?y . ?y a ?d }' },
    { name: 'cls-svf2 — someValuesFrom owl:Thing ⇒ membership', sparql: 'INSERT { ?x a ?c } WHERE { ?c owl:someValuesFrom owl:Thing ; owl:onProperty ?p . ?x ?p ?y }' },
    { name: 'cls-avf — allValuesFrom types the values', sparql: 'INSERT { ?y a ?d } WHERE { ?c owl:allValuesFrom ?d ; owl:onProperty ?p . ?x a ?c ; ?p ?y FILTER(!isLiteral(?y)) }' },
    { name: 'cls-int2 — intersectionOf ⇒ member of each part', sparql: 'INSERT { ?x a ?ci } WHERE { ?c owl:intersectionOf ?l . ?l rdf:rest*/rdf:first ?ci . ?x a ?c }' },
    { name: 'cls-uni — member of a union part ⇒ member of the union', sparql: 'INSERT { ?x a ?c } WHERE { ?c owl:unionOf ?l . ?l rdf:rest*/rdf:first ?ci . ?x a ?ci }' },
    { name: 'cls-int1 — member of every part ⇒ member of the intersection', sparql: 'INSERT { ?x a ?c } WHERE { ?c owl:intersectionOf ?l . ?l rdf:first ?c1 . ?x a ?c1 . FILTER NOT EXISTS { ?l rdf:rest*/rdf:first ?ci . FILTER NOT EXISTS { ?x a ?ci } } }' },
    { name: 'prp-spo2 — propertyChainAxiom (chain of 2)', sparql: 'INSERT { ?x ?p ?z } WHERE { ?p owl:propertyChainAxiom ?l . ?l rdf:first ?p1 ; rdf:rest ?r1 . ?r1 rdf:first ?p2 ; rdf:rest rdf:nil . ?x ?p1 ?y . ?y ?p2 ?z }' },
    { name: 'prp-spo2 — propertyChainAxiom (chain of 3)', sparql: 'INSERT { ?x ?p ?z } WHERE { ?p owl:propertyChainAxiom ?l . ?l rdf:first ?p1 ; rdf:rest ?r1 . ?r1 rdf:first ?p2 ; rdf:rest ?r2 . ?r2 rdf:first ?p3 ; rdf:rest rdf:nil . ?x ?p1 ?y1 . ?y1 ?p2 ?y2 . ?y2 ?p3 ?z }' }
  ]
}

// Consistency checks (OWL "clashes"). Each SELECT returns ?x and a message.
const CLASHES = [
  `SELECT ?x ?msg WHERE { { ?a owl:disjointWith ?b } UNION { ?b owl:disjointWith ?a }
     ?x a ?a , ?b . FILTER(STR(?a) < STR(?b))
     BIND(CONCAT("is a member of two disjoint classes: ", STR(?a), " and ", STR(?b)) AS ?msg) }`,
  `SELECT ?x ?msg WHERE { ?x owl:sameAs ?y . { ?x owl:differentFrom ?y } UNION { ?y owl:differentFrom ?x }
     BIND(CONCAT("is declared both sameAs and differentFrom ", STR(?y)) AS ?msg) }`,
  `SELECT DISTINCT ?x ?msg WHERE { ?d a owl:AllDisjointClasses ; owl:members ?l .
     ?l rdf:rest*/rdf:first ?a . ?l rdf:rest*/rdf:first ?b . FILTER(STR(?a) < STR(?b))
     ?x a ?a , ?b .
     BIND(CONCAT("is a member of two disjoint classes: ", STR(?a), " and ", STR(?b)) AS ?msg) }`,
  `SELECT ?x ?msg WHERE { ?x a owl:Nothing BIND("is a member of owl:Nothing (an unsatisfiable class)" AS ?msg) }`
]

function rulesFor (level) {
  if (level === 'rdfs') return RULES.rdfs
  if (level === 'owl') return [...RULES.rdfs, ...RULES.owl]
  return []
}

function quadKey (q) {
  return `${q.subject.toString()} ${q.predicate.toString()} ${q.object.toString()} ${q.graph.toString()}`
}

// RDF serialisation formats the playground can read and write.
export const FORMATS = {
  turtle:   { label: 'Turtle',    mime: 'text/turtle',           n3: 'Turtle',    quads: false, lang: 'turtle' },
  trig:     { label: 'TriG',      mime: 'application/trig',      n3: 'TriG',      quads: true,  lang: 'turtle' },
  ntriples: { label: 'N-Triples', mime: 'application/n-triples', n3: 'N-Triples', quads: false, lang: 'turtle' },
  nquads:   { label: 'N-Quads',   mime: 'application/n-quads',   n3: 'N-Quads',   quads: true,  lang: 'turtle' },
  jsonld:   { label: 'JSON-LD',   mime: 'application/ld+json',   n3: null,        quads: true,  lang: 'json' },
  rdfxml:   { label: 'RDF/XML',   mime: 'application/rdf+xml',   n3: null,        quads: false, lang: 'xml' }
}

const BASE = 'http://example.org/'
const RDF_TYPE = 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type'

function loadInto (store, text, format) {
  store.load(text, { format: (FORMATS[format] || FORMATS.turtle).mime, base_iri: BASE })
}

function toN3 (t) {
  switch (t.termType) {
    case 'NamedNode': return N3.namedNode(t.value)
    case 'BlankNode': return N3.blankNode(t.value)
    case 'Literal': return t.language ? N3.literal(t.value, t.language) : N3.literal(t.value, N3.namedNode(t.datatype.value))
    default: return N3.defaultGraph()
  }
}

/** Serialise quads (Oxigraph terms) to a format. Triple-only formats get the default graph only. */
export function serialize (quads, format, prefixes = {}) {
  const f = FORMATS[format] || FORMATS.turtle
  const named = quads.filter(q => q.graph.termType !== 'DefaultGraph')
  const key = q => `${q.graph.value}\u0000${q.subject.value}\u0000${q.predicate.value === RDF_TYPE ? '' : q.predicate.value}\u0000${q.object.value}`
  const usable = (f.quads ? quads : quads.filter(q => q.graph.termType === 'DefaultGraph'))
    .slice().sort((a, b) => key(a) < key(b) ? -1 : key(a) > key(b) ? 1 : 0)   // group by graph and subject, rdf:type first
  const note = !f.quads && named.length ? `${named.length} triple(s) in named graphs left out: ${f.label} has no named graphs` : ''
  let text
  if (f.n3) {
    const usedPrefixes = {}
    const all = usable.map(q => [q.subject, q.predicate, q.object, q.graph].map(t => t.value).join(' ') + ' ' + (q.object.datatype?.value || '')).join(' ')
    if (f.n3 === 'Turtle' || f.n3 === 'TriG') for (const [p, ns] of Object.entries(prefixes)) if (all.includes(ns)) usedPrefixes[p] = ns
    const w = new Writer({ format: f.n3, prefixes: usedPrefixes })
    for (const q of usable) w.addQuad(toN3(q.subject), toN3(q.predicate), toN3(q.object), toN3(q.graph))
    w.end((err, out) => { if (err) throw err; text = out })
  } else {
    const st = new ox.Store(usable)
    text = st.dump(f.quads ? { format: f.mime } : { format: f.mime, from_graph_name: ox.defaultGraph() })
    if (format === 'jsonld') { try { text = JSON.stringify(JSON.parse(text), null, 2) } catch {} }
  }
  return { text, note }
}

export function parseQuads (text, format) {
  const st = new ox.Store()
  loadInto(st, text, format)
  return st.match()
}

/** Run a SPARQL Update against the data (no reasoning). Returns the quads before and after. */
export function applyUpdate (text, format, update) {
  const st = new ox.Store()
  loadInto(st, text, format)
  const before = st.match()
  st.update(update, { base_iri: BASE })
  return { before, after: st.match() }
}

export function diffQuads (before, after) {
  const b = new Set(before.map(quadKey))
  const a = new Set(after.map(quadKey))
  return { added: after.filter(q => !b.has(quadKey(q))), removed: before.filter(q => !a.has(quadKey(q))) }
}

/**
 * Build a store from Turtle and optionally apply reasoning.
 * Returns { store, asserted, inferred: Quad[], clashes: [{x,msg}] }
 */
export function buildStore (text, reasoning = 'none', format = 'turtle') {
  const store = new ox.Store()
  loadInto(store, text, format)
  const asserted = new Set(store.match().map(quadKey))
  const rules = rulesFor(reasoning)
  let iterations = 0
  if (rules.length) {
    let before = -1
    while (store.size !== before && iterations < 30) {
      before = store.size
      for (const r of rules) store.update(P + r.sparql)
      iterations++
    }
  }
  const inferred = rules.length ? store.match().filter(q => !asserted.has(quadKey(q))) : []
  const clashes = []
  if (reasoning === 'owl') {
    for (const c of CLASHES) {
      for (const row of store.query(P + c)) clashes.push({ x: row.get('x'), msg: row.get('msg').value })
    }
  }
  return { store, inferred, clashes, iterations }
}

export function runQuery (store, sparql, format) {
  const opts = { base_iri: BASE }
  if (format) opts.results_format = format
  return store.query(sparql, opts)
}

export { BASE }

function parseToDataset (turtle) {
  const ds = rdfDataset.dataset()
  const quads = new Parser({ baseIRI: BASE }).parse(turtle)
  for (const q of quads) {
    ds.add(rdfDataModel.quad(
      convert(q.subject), convert(q.predicate), convert(q.object)
    ))
  }
  return ds
}

function convert (t) {
  switch (t.termType) {
    case 'NamedNode': return rdfDataModel.namedNode(t.value)
    case 'BlankNode': return rdfDataModel.blankNode(t.value)
    case 'Literal': return rdfDataModel.literal(t.value, t.language || rdfDataModel.namedNode(t.datatype.value))
    default: return rdfDataModel.defaultGraph()
  }
}

/** Validate data (Turtle, plus optional extra quads from reasoning) against shapes (Turtle). */
/** Validate data quads (Oxigraph terms, inferred ones included) against shapes written in Turtle. */
export async function validateShacl (quads, shapesTurtle) {
  const data = rdfDataset.dataset()
  for (const q of quads) data.add(rdfDataModel.quad(convert(q.subject), convert(q.predicate), convert(q.object)))
  const shapes = parseToDataset(shapesTurtle)
  // SHACL resolves sh:class / sh:targetClass through rdfs:subClassOf in the *data* graph,
  // but shacl-engine looks in the shapes graph. Copy the hierarchy across so both agree.
  const subClassOf = rdfDataModel.namedNode('http://www.w3.org/2000/01/rdf-schema#subClassOf')
  for (const q of data.match(null, subClassOf, null)) shapes.add(q)
  const validator = new Validator(shapes, { factory: rdfDataModel })
  const report = await validator.validate({ dataset: data })
  return {
    conforms: report.conforms,
    results: report.results.map(r => ({
      focusNode: r.focusNode?.term && { termType: r.focusNode.term.termType, value: r.focusNode.term.value },
      path: r.path?.map(step => step.predicates?.map(p => p.value)).flat().filter(Boolean),
      value: r.value?.term,
      severity: r.severity?.value,
      component: r.constraintComponent?.value,
      message: (r.message || []).map(m => m.value).join(' ')
    }))
  }
}
