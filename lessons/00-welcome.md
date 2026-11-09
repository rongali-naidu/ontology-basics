---
title: Welcome
section: Start
---

# Learn ontologies by doing

This course teaches the core Semantic Web standards, one small step per page, using **one running example: a small online store**. It has customers, orders, products, brands and a product hierarchy.

| Standard | What it's for |
|---|---|
| **RDF / Turtle** | Writing facts as a graph of *triples* |
| **SPARQL** | Querying that graph |
| **RDFS** | Simple vocabularies: classes, sub-classes, properties |
| **OWL** | Richer meaning: inverse, transitive and equivalent things, and logical class definitions |
| **SKOS** | Taxonomies and glossaries: concepts, broader/narrower terms, synonyms |
| **SHACL** | Validating data against rules ("every product must have a price") |

The course starts with **Ontology concepts**: what an ontology is, its building blocks (classes, properties, restrictions, individuals), how they compare with object-oriented programming and databases, and a translation table for the many words different tools use for the same ideas. Then it goes hands-on with each standard.

Everything runs **in your browser**. Nothing is sent to a server.

## How each page works

The **left side** (this text) explains one idea. The **right side** is your playground:

1. **Data** (top): an RDF graph written in Turtle. Edit it freely! The **Graph** tab next to it draws the same data as nodes and edges (click a node to see its triples), and some lessons add a **Shapes** tab for SHACL.
2. **SPARQL query** (middle): press **▶ Run** or <kbd>Ctrl</kbd>/<kbd>⌘</kbd> + <kbd>Enter</kbd>.
3. **Results** (bottom): a table, a true/false answer, new triples, or a validation report.

Code samples in lessons have a **▶ Try this query** button. Pages with an exercise end with a **Check my answer** button. Your edits are saved in this browser. **Reset** restores the lesson's starting point.

The **Reasoning** menu above the data switches inference on, from RDFS up to a subset of OWL RL. Click **rules** next to it to see exactly which rules run.

## Try it now

The data on the right describes one product in five triples. Press **▶ Run**. The query asks for *every* triple in the graph:

```sparql
SELECT ?s ?p ?o
WHERE { ?s ?p ?o }
```

Now change the price `1299.00` to something else and run again. That's the whole loop: **edit → run → observe**.

Use **☰** (top-left) to jump to any lesson, or **Next →** below to start.

```turtle data
@prefix retail: <https://example.org/retail/ontology#> .
@prefix ex:     <https://example.org/retail/data/> .

ex:PRD-0001 a retail:Product ;
    retail:name  "Laptop Pro 14" ;
    retail:sku   "LAP-PRO-14" ;
    retail:price 1299.00 ;
    retail:brand ex:BRAND-ExampleTech .
```

```sparql query
SELECT ?s ?p ?o
WHERE { ?s ?p ?o }
```
