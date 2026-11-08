---
title: RDF formats and named graphs
section: Foundations
format: trig
---

# One graph, many formats

RDF is a **data model** (triples), not a file format. The same triples can be written in several **serialisations**. Here's one product, three triples, in each of them.

**Turtle**: compact and readable, with prefixes, `;` and `,` (what you've been using):

```turtle
@prefix retail: <https://example.org/retail/ontology#> .
@prefix ex:     <https://example.org/retail/data/> .

ex:PRD-0001 a retail:Product ;
    retail:name  "Laptop Pro 14" ;
    retail:price 1299.00 .
```

**N-Triples**: one complete triple per line, with no prefixes and no shortcuts. It's verbose, but trivially easy to process line by line, split, sort, diff or stream:

```
<https://example.org/retail/data/PRD-0001> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <https://example.org/retail/ontology#Product> .
<https://example.org/retail/data/PRD-0001> <https://example.org/retail/ontology#name> "Laptop Pro 14" .
<https://example.org/retail/data/PRD-0001> <https://example.org/retail/ontology#price> "1299.00"^^<http://www.w3.org/2001/XMLSchema#decimal> .
```

**JSON-LD**: RDF as ordinary JSON. The `@context` maps JSON keys to IRIs, so web developers can use it as plain JSON. It's also what search engines read from web pages (schema.org markup):

```json
{
  "@context": {
    "retail": "https://example.org/retail/ontology#",
    "ex": "https://example.org/retail/data/",
    "price": { "@id": "retail:price", "@type": "http://www.w3.org/2001/XMLSchema#decimal" }
  },
  "@id": "ex:PRD-0001",
  "@type": "retail:Product",
  "retail:name": "Laptop Pro 14",
  "price": "1299.00"
}
```

**RDF/XML**: the original (2004) format. It's verbose and hard to read, but you'll still meet it in older ontologies and OWL tools:

```xml
<rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"
         xmlns:retail="https://example.org/retail/ontology#">
  <retail:Product rdf:about="https://example.org/retail/data/PRD-0001">
    <retail:name>Laptop Pro 14</retail:name>
    <retail:price rdf:datatype="http://www.w3.org/2001/XMLSchema#decimal">1299.00</retail:price>
  </retail:Product>
</rdf:RDF>
```

## Triples vs quads: named graphs

A **named graph** is a set of triples with its own IRI. It's useful for keeping track of *where data came from* (catalog system, CRM, order system), for versions, or for access control. A triple plus its graph name is a **quad**.

**TriG** is Turtle with graph blocks, and **N-Quads** is N-Triples with a fourth column:

```turtle
@prefix g: <https://example.org/retail/graph/> .

g:catalog {
    ex:PRD-0001 a retail:Product ; retail:name "Laptop Pro 14" ; retail:price 1299.00 .
}
```

```
<https://example.org/retail/data/PRD-0001> <https://example.org/retail/ontology#name> "Laptop Pro 14" <https://example.org/retail/graph/catalog> .
```

## How they compare

| Format | Named graphs? | Readable | Prefixes | Typical use | Extension |
|---|---|---|---|---|---|
| **Turtle** | no | ★★★ | yes | hand-written data and ontologies | `.ttl` |
| **TriG** | **yes** | ★★★ | yes | Turtle with several graphs | `.trig` |
| **N-Triples** | no | ★ | no | bulk loads, streaming, diffs | `.nt` |
| **N-Quads** | **yes** | ★ | no | bulk loads with graphs, dumps | `.nq` |
| **JSON-LD** | yes | ★★ | via `@context` | web APIs, schema.org in web pages | `.jsonld` |
| **RDF/XML** | no | ★ | XML namespaces | legacy OWL files, older tools | `.rdf`, `.owl` |

The retail example ships its data in all six: `rdf/retail-data.ttl`, `.trig`, `.nt`, `.nq`, `.jsonld` and `.rdf`.

> **Try it:** the **Format** menu above the data converts the data panel live. Pick *N-Quads* or *JSON-LD* to see this lesson's data in that format, then switch back to *TriG*. (Converting drops comments. Triple-only formats like Turtle can't hold named graphs, so those triples are left out.)

## Querying named graphs

The data on the right is **TriG**, split like the retail example's `retail-data.trig`: `g:catalog`, `g:customers` and `g:orders`, plus a few facts about the graphs themselves in the **default graph**.

⚠ A plain query only sees the **default graph**. This returns only the graph descriptions, not the products:

```sparql
SELECT ?s ?p ?o WHERE { ?s ?p ?o }
```

Use **`GRAPH`** to look inside named graphs. `?g` tells you which graph each triple is in:

```sparql
PREFIX retail: <https://example.org/retail/ontology#>

SELECT ?g ?product ?name
WHERE { GRAPH ?g { ?product a retail:Product ; retail:name ?name } }
```

Or name a specific graph:

```sparql
PREFIX g:      <https://example.org/retail/graph/>
PREFIX retail: <https://example.org/retail/ontology#>

SELECT ?order ?status
WHERE { GRAPH g:orders { ?order retail:status ?status } }
```

Many triple stores can be configured to treat the default graph as the **union** of all named graphs, so plain queries see everything. The retail example's README explains how for GraphDB, Oxigraph and Jena. This playground keeps the standard behaviour. Reasoning here also only applies to the default graph.

## Exercise

Orders are in `g:orders`, customer names in `g:customers`. Write a query that returns **every order with the name of the customer who placed it**: a join across two graphs. Return `?order ?name`.

```turtle data
@prefix retail:  <https://example.org/retail/ontology#> .
@prefix ex:      <https://example.org/retail/data/> .
@prefix g:       <https://example.org/retail/graph/> .
@prefix dcterms: <http://purl.org/dc/terms/> .
@prefix xsd:     <http://www.w3.org/2001/XMLSchema#> .

# ---- Default graph: facts about the named graphs ----
g:catalog   dcterms:source "Product information system" .
g:customers dcterms:source "Customer accounts" .
g:orders    dcterms:source "Order system" .

g:catalog {
    ex:BRAND-ExampleTech a retail:Brand ; retail:name "ExampleTech" .
    ex:PRD-0001 a retail:Product ; retail:name "Laptop Pro 14"     ; retail:price 1299.00 ; retail:brand ex:BRAND-ExampleTech .
    ex:PRD-0002 a retail:Product ; retail:name "Wireless Earbuds X" ; retail:price 149.99 ; retail:brand ex:BRAND-ExampleTech .
}

g:customers {
    ex:C1 a retail:PremiumCustomer ; retail:name "Naidu Random1" ; retail:email "naidu@example.com" .
    ex:C2 a retail:Customer        ; retail:name "Bob Random2"   ; retail:email "bob@example.com" .
}

g:orders {
    ex:ORD-0001 a retail:Order ; retail:placedBy ex:C1 ; retail:status "DELIVERED" ;
        retail:orderDate "2026-09-01"^^xsd:date ; retail:hasLine ex:ORD-0001-1 .
    ex:ORD-0001-1 a retail:OrderLine ; retail:forProduct ex:PRD-0001 ; retail:quantity 1 ; retail:unitPrice 1299.00 .
    ex:ORD-0002 a retail:Order ; retail:placedBy ex:C2 ; retail:status "SHIPPED" ;
        retail:orderDate "2026-09-05"^^xsd:date ; retail:hasLine ex:ORD-0002-1 .
    ex:ORD-0002-1 a retail:OrderLine ; retail:forProduct ex:PRD-0002 ; retail:quantity 1 ; retail:unitPrice 149.99 .
}
```

```sparql query
# How many triples are in each named graph? (from the retail example's 11-named-graphs.rq)
SELECT ?g (COUNT(*) AS ?triples)
WHERE { GRAPH ?g { ?s ?p ?o } }
GROUP BY ?g
ORDER BY ?g
```

```sparql solution
PREFIX g:      <https://example.org/retail/graph/>
PREFIX retail: <https://example.org/retail/ontology#>

SELECT ?order ?name
WHERE {
  GRAPH g:orders    { ?order retail:placedBy ?c }
  GRAPH g:customers { ?c retail:name ?name }
}
```
