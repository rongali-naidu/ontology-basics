# Ontology Basics

**Learn RDF, SPARQL, RDFS, OWL, SKOS and SHACL by doing, right in your browser.**

▶ **Start learning:** https://rongali-naidu.github.io/ontology-basics/

Each page explains one idea on the left. On the right is a live playground:

```
┌────────────────────────┬──────────────────────────────┐
│                        │  Data (Turtle) │ Shapes      │  ← editable, with optional reasoning
│   Lesson               ├──────────────────────────────┤
│                        │  SPARQL query       [▶ Run]  │
│   Exercise             ├──────────────────────────────┤
│   [Check my answer]    │  Results / validation report │
└────────────────────────┴──────────────────────────────┘
```

Everything runs client-side. There is no server and nothing to install.

## Curriculum

The whole course uses one running example: a small **online store** (customers, orders, products, brands, a product hierarchy, reviews). It's taken from the retail example in [semantics-ontology-graphs](https://github.com/rongali-naidu/semantics-ontology-graphs/tree/main/examples/retail), with the same IRIs, ontology, taxonomies, glossary, SHACL shapes and data, so learners can continue straight into the full version.

| # | Section | Lessons |
|---|---|---|
| 0 | Start | Welcome, how the playground works, what runs under the hood |
| 1–6 | Ontology concepts | What an ontology is (TBox/ABox, knowledge base) · classes & hierarchies vs OOP · properties, domain & range · restrictions (facets) in OWL vs SHACL · from ontology to knowledge graph (edges with properties: RDF vs property graphs; the 7 development steps) · same idea, different words (terminology map and false friends) |
| 7–9 | Foundations | Triples & IRIs · Turtle syntax · RDF formats (Turtle, TriG, N-Triples, N-Quads, JSON-LD, RDF/XML) and named graphs |
| 10–20 | SPARQL | SELECT · prefixes & IRIs · subject/predicate/object patterns · join patterns · FILTER/OPTIONAL · ORDER/LIMIT/DISTINCT · aggregates · property paths/UNION/BIND · ASK/CONSTRUCT · SPARQL Update (insert/update/upsert/delete) · SPARQL vs SQL vs Cypher |
| 21–23 | RDFS | Customer/Party hierarchy & schema.org alignment · domain & range · labels and reasoning with paths |
| 24–28 | OWL | Open world · inverse/transitive/property chains · sameAs with a CRM · AllDisjointClasses & inconsistency · defined classes (DeliveredOrder, NonRevenueOrder, LaptopBuyer) |
| 29–30 | SKOS | The business glossary (GMV → revenue) · merchandise hierarchy vs Google Product Taxonomy |
| 31–34 | SHACL | Product shape · value constraints · hierarchy shapes · SHACL vs OWL |
| 35 | Wrap-up | Capstone: revenue per product family & next steps |

## How it works

| Piece | Library |
|---|---|
| Triple store, SPARQL 1.1 query & update, RDF formats | [Oxigraph](https://github.com/oxigraph/oxigraph) compiled to WebAssembly |
| Reasoning | SPARQL `INSERT` rules run to a fixpoint: RDFS plus a teaching subset of OWL 2 RL (inverse, transitive, symmetric, functional, sameAs, equivalence, hasValue/someValuesFrom/allValuesFrom, intersection/union, property chains, disjointness checks); see `src/engine.js` |
| SHACL validation | [shacl-engine](https://github.com/rdf-ext/shacl-engine) |
| Editors | CodeMirror 6 |
| Build | Vite, deployed by GitHub Actions to GitHub Pages |

## Writing a lesson

Lessons are Markdown files in [`lessons/`](lessons/), ordered by file name. Add a file and it appears in the course, with no code changes.

````markdown
---
title: My lesson
section: SPARQL basics
reasoning: none          # none | rdfs | owl   (starting value of the Reasoning menu)
check_reasoning: rdfs    # optional: reasoning used when checking the answer
expect_focus: ex:a ex:b  # SHACL exercise: exactly these focus nodes must be reported
tab: data                # which tab opens first on pages with shapes
start: query             # on pages with shapes, run the query instead of validating on load
---

# Lesson text in Markdown …

```sparql
SELECT * WHERE { ?s ?p ?o }      # ← plain sparql blocks get a "Try this query" button
```

```turtle data
… starting data …
```

```sparql query
… starting query …
```

```sparql solution
… exercise: the learner's results must equal this query's results …
```
````

Other special blocks:

- ` ```turtle shapes `: starting SHACL shapes (adds the Shapes tab)
- ` ```sparql check `: an `ASK` that must be true on the learner's data
- ` ```turtle solution-data ` / ` ```turtle solution-shapes `: loaded by **Show solution**
- ` ```turtle-add `: a snippet with an **Add to data** button

## Run locally

```bash
npm install
npm run dev
```

Build with `npm run build`; the static site is written to `dist/`.

## References

- Natalya F. Noy and Deborah L. McGuinness, [*Ontology Development 101: A Guide to Creating Your First Ontology*](https://protege.stanford.edu/publications/ontology_development/ontology101.pdf), Stanford Knowledge Systems Laboratory, 2001. The ontology concepts section draws on its definitions and seven development steps.
- [semantics-ontology-graphs](https://github.com/rongali-naidu/semantics-ontology-graphs): the retail example used throughout.
- [Oxigraph](https://github.com/oxigraph/oxigraph): the RDF database (Rust, compiled to WebAssembly) that runs the playground.

## License

The retail ontology, taxonomies, glossary and data come from [semantics-ontology-graphs](https://github.com/rongali-naidu/semantics-ontology-graphs).

Apache License 2.0 (see `LICENSE`)
