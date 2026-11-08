---
title: Welcome
section: Start
---

# Learn ontologies by doing

This course teaches the core Semantic Web standards, one small step per page:

| Standard | What it's for |
|---|---|
| **RDF / Turtle** | Writing facts as a graph of *triples* |
| **SPARQL** | Querying that graph |
| **RDFS** | Simple vocabularies: classes, sub-classes, properties |
| **OWL** | Richer meaning: inverse, transitive and equivalent things, and logical restrictions |
| **SKOS** | Thesauri and taxonomies: concepts, broader/narrower terms, labels |
| **SHACL** | Validating data against rules ("every book must have a title") |

Everything runs **in your browser**. Nothing is sent to a server.

## How each page works

The **left side** (this text) explains one idea. The **right side** is your playground:

1. **Data** (top): an RDF graph written in Turtle. Edit it freely! Some lessons add a **Shapes** tab for SHACL.
2. **SPARQL query** (middle): press **▶ Run** or <kbd>Ctrl</kbd>/<kbd>⌘</kbd> + <kbd>Enter</kbd>.
3. **Results** (bottom): a table, a true/false answer, new triples, or a validation report.

Code samples in lessons have a **▶ Try this query** button. Pages with an exercise end with a **Check my answer** button. Your edits are saved in this browser. **Reset** restores the lesson's starting point.

The **Reasoning** menu above the data switches inference on, from RDFS up to a subset of OWL RL. Click **rules** next to it to see exactly which rules run.

## Try it now

The data on the right describes one book in three triples. Press **▶ Run**. The query asks for *every* triple in the graph:

```sparql
SELECT ?s ?p ?o
WHERE { ?s ?p ?o }
```

Now change `"Frankenstein"` in the data to another title and run it again. That's the whole loop: **edit → run → observe**.

Use **☰** (top-left) to jump to any lesson, or **Next →** below to start.

```turtle data
@prefix ex: <http://example.org/library#> .

ex:frankenstein a ex:Book ;
    ex:title  "Frankenstein" ;
    ex:author ex:shelley .
```

```sparql query
SELECT ?s ?p ?o
WHERE { ?s ?p ?o }
```
