---
title: From ontology to knowledge graph
section: Ontology concepts
---

# From ontology to knowledge graph

An ontology together with the **individuals** it describes is a **knowledge base**. Draw it as nodes and edges and you have a **knowledge graph**. The picture below is a slice of the store's graph:

<svg viewBox="0 0 720 300" role="img" aria-label="A slice of the store knowledge graph" style="width:100%;max-width:720px;height:auto;font:12px var(--mono)">
<defs><marker id="arr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" style="fill:var(--muted)"/></marker></defs>
<g style="stroke:var(--muted);stroke-width:1.3;fill:none" marker-end="url(#arr)">
<line x1="85" y1="134" x2="85" y2="58"/>
<line x1="235" y1="150" x2="142" y2="150"/>
<line x1="365" y1="150" x2="428" y2="150"/>
<line x1="500" y1="166" x2="500" y2="242"/>
<line x1="572" y1="140" x2="628" y2="112"/>
<line x1="572" y1="160" x2="610" y2="188"/>
<line x1="85" y1="166" x2="85" y2="242"/>
</g>
<g style="fill:var(--muted)">
<text x="92" y="100">rdf:type</text>
<text x="150" y="142">retail:placedBy</text>
<text x="372" y="142">retail:hasLine</text>
<text x="508" y="210">retail:forProduct</text>
<text x="578" y="118">quantity</text>
<text x="582" y="186">unitPrice</text>
<text x="92" y="210">retail:name</text>
</g>
<rect x="10" y="22" width="150" height="34" rx="6" style="fill:var(--surface);stroke:var(--accent);stroke-dasharray:4 3"/>
<text x="85" y="44" text-anchor="middle" style="fill:var(--accent)">retail:Customer</text>
<rect x="30" y="134" width="110" height="32" rx="16" style="fill:var(--accent-soft);stroke:var(--accent)"/>
<text x="85" y="155" text-anchor="middle" style="fill:var(--text)">ex:C1</text>
<rect x="235" y="134" width="130" height="32" rx="16" style="fill:var(--accent-soft);stroke:var(--accent)"/>
<text x="300" y="155" text-anchor="middle" style="fill:var(--text)">ex:ORD-0001</text>
<rect x="430" y="134" width="140" height="32" rx="16" style="fill:var(--warn-soft);stroke:var(--warn)"/>
<text x="500" y="155" text-anchor="middle" style="fill:var(--text)">ex:ORD-0001-1</text>
<rect x="440" y="244" width="120" height="32" rx="16" style="fill:var(--accent-soft);stroke:var(--accent)"/>
<text x="500" y="265" text-anchor="middle" style="fill:var(--text)">ex:PRD-0001</text>
<rect x="630" y="92" width="50" height="28" rx="4" style="fill:var(--ok-soft);stroke:var(--ok)"/>
<text x="655" y="111" text-anchor="middle" style="fill:var(--tok-atom)">1</text>
<rect x="612" y="178" width="96" height="28" rx="4" style="fill:var(--ok-soft);stroke:var(--ok)"/>
<text x="660" y="197" text-anchor="middle" style="fill:var(--tok-atom)">1299.00</text>
<rect x="15" y="244" width="140" height="28" rx="4" style="fill:var(--ok-soft);stroke:var(--ok)"/>
<text x="85" y="263" text-anchor="middle" style="fill:var(--tok-string)">"Naidu Random1"</text>
</svg>

Dashed box: a **class**. Blue: **individuals**. Green: **literal values**. Orange: a **relationship turned into a node** (see below).

## Graph words for ontology things

| Ontology | In the graph |
|---|---|
| individual (`ex:C1`) | a **node** |
| class (`retail:Customer`) | also a node! Individuals link to it with an `rdf:type` edge |
| object property assertion (`ex:ORD-0001 retail:placedBy ex:C1`) | an **edge** labelled with the property |
| data property assertion (`ex:C1 retail:name "Naidu Random1"`) | in RDF: an edge to a **literal** node. In property graphs (Neo4j): an attribute stored *on* the node |
| triple | one edge with its two end nodes |

## Edges with properties: RDF vs property graphs

You might want an edge to carry information of its own: *"order ORD-0001 contains product PRD-0001, **quantity 1, at 1299.00**"*. Whether an edge *can* carry properties depends on which of the two main kinds of graph you use.

**Labeled property graphs** (Neo4j, Amazon Neptune with openCypher, Memgraph, TigerGraph, and the ISO **GQL** standard) **do allow properties on edges**. Nodes and relationships both hold key–value properties, so the order line can simply be the edge:

```
(:Order {id: "ORD-0001"})-[:CONTAINS {quantity: 1, unitPrice: 1299.00}]->(:Product {id: "PRD-0001"})
```

**RDF graphs** (what this course uses) **do not.** A triple is just subject, predicate and object. There's nowhere to attach `quantity` to the `ex:ORD-0001 → ex:PRD-0001` edge itself.

The standard RDF solution is to **turn the relationship into a node**. This is called an *n-ary relation*, or *reification*. That's exactly what `retail:OrderLine` is. The retail ontology describes it as "one product + quantity + price within an order. **Reifies the Order–Product relationship so it can carry attributes.**" In the picture it's the orange node:

```turtle
ex:ORD-0001   retail:hasLine ex:ORD-0001-1 .
ex:ORD-0001-1 retail:forProduct ex:PRD-0001 ; retail:quantity 1 ; retail:unitPrice 1299.00 .
```

| Want | RDF / OWL | Property graph (Neo4j) | Relational DB |
|---|---|---|---|
| a relationship with attributes | an intermediate node (`retail:OrderLine`) | properties directly on the relationship | a join table with extra columns |

The difference is smaller than it looks:

- **Even in Neo4j you often promote the edge to a node.** That happens once the relationship needs relationships of its own: an order line that a return, a shipment or a review points at. Edges can't be the endpoint of other edges in a property graph either.
- **RDF 1.2** (with "RDF-star") adds *triple terms*, `<< ex:ORD-0001 retail:contains ex:PRD-0001 >> retail:quantity 1`, for statements about a statement. Support is still uneven across tools, so the intermediate node remains the common, portable pattern.
- What RDF gives you in exchange: global IRIs, standard ontologies and reasoning (OWL), standard validation (SHACL) and a W3C query language (SPARQL).

**See both side by side:** the retail repo's [`property-graph/`](https://github.com/rongali-naidu/semantics-ontology-graphs/tree/main/examples/retail/property-graph) folder builds this same store as a property graph (Cypher, GQL, Gremlin and SQL/PGQ). There the order line is exactly the edge above, `(order)-[:CONTAINS {quantity, unitPrice}]->(product)`, where the RDF version uses the `retail:OrderLine` node.

**Restrictions apply to the edges too:**
- property characteristics constrain them, e.g. `retail:placedBy` is *functional*: each order has at most one.
- SHACL shapes on the relationship node constrain its "edge properties", e.g. an order line's quantity must be at least 1.

## How an ontology is built, step by step

Noy & McGuinness's *Ontology Development 101* gives seven steps. Here's how each one maps to the standards in this course and to the files in the retail example:

| # | Step | Standard / tool | In the retail example |
|---|---|---|---|
| 1 | Determine the **domain and scope**; write **competency questions** the ontology must answer ("What is revenue per product family?") | SPARQL queries, used later as tests | `sparql/*.rq`, `check_*.py` |
| 2 | Consider **reusing** existing ontologies | schema.org, SKOS, PROV-O, Google taxonomy | `rdfs:subClassOf schema:Person`, `skos:exactMatch` |
| 3 | Enumerate the **important terms** | a glossary in SKOS | `glossary/retail-glossary.ttl` |
| 4 | Define the **classes** and the **class hierarchy** | `owl:Class`, `rdfs:subClassOf` | `ontology/retail-ontology.ttl` |
| 5 | Define the **properties** (slots) | `owl:ObjectProperty`, `owl:DatatypeProperty`, domain/range | `ontology/retail-ontology.ttl` |
| 6 | Define the **facets** (restrictions) | OWL restrictions; SHACL shapes | `retail-ontology.ttl`, `retail-shapes.ttl` |
| 7 | Create **instances** | Turtle by hand, or mapped from databases | `rdf/retail-data.ttl`, `mapping/retail-r2rml.ttl` |

Then you validate with SHACL, reason with OWL, query with SPARQL, and **iterate**. Ontology development is never "done in one pass".

## Exercise: grow the knowledge graph

Step 7 is creating instances. The ontology on the right defines `retail:Review` and its properties. Add a new review **`ex:R5`**: an instance of `retail:Review`, **written by** `ex:C2`, a **review of** `ex:PRD-0006`, with **rating** `4`.

Then run the query: your review appears in the graph next to the others.

```turtle data
@prefix retail: <https://example.org/retail/ontology#> .
@prefix ex:     <https://example.org/retail/data/> .
@prefix owl:    <http://www.w3.org/2002/07/owl#> .
@prefix rdfs:   <http://www.w3.org/2000/01/rdf-schema#> .
@prefix xsd:    <http://www.w3.org/2001/XMLSchema#> .

# ---- Ontology (TBox) ----
retail:Review    a owl:Class .
retail:writtenBy a owl:ObjectProperty   ; rdfs:domain retail:Review ; rdfs:range retail:Customer .
retail:reviewOf  a owl:ObjectProperty   ; rdfs:domain retail:Review ; rdfs:range retail:Product .
retail:rating    a owl:DatatypeProperty ; rdfs:domain retail:Review ; rdfs:range xsd:integer .

# ---- Instances (ABox) ----
ex:C1 a retail:Customer ; retail:name "Naidu Random1" .
ex:C2 a retail:Customer ; retail:name "Bob Random2" .
ex:PRD-0001 a retail:Product ; retail:name "Laptop Pro 14" .
ex:PRD-0006 a retail:Product ; retail:name "Mechanical Keyboard" .
ex:R1 a retail:Review ; retail:writtenBy ex:C1 ; retail:reviewOf ex:PRD-0001 ; retail:rating 5 .

# Add ex:R5 below this line

```

```sparql query
PREFIX retail: <https://example.org/retail/ontology#>

SELECT ?review ?customer ?product ?rating
WHERE {
  ?review a retail:Review ;
          retail:writtenBy/retail:name ?customer ;
          retail:reviewOf/retail:name ?product ;
          retail:rating ?rating .
}
```

```sparql check
PREFIX retail: <https://example.org/retail/ontology#>
PREFIX ex:     <https://example.org/retail/data/>
ASK { ex:R5 a retail:Review ; retail:writtenBy ex:C2 ; retail:reviewOf ex:PRD-0006 ; retail:rating ?r FILTER(?r = 4) }
```

```turtle solution-data
@prefix retail: <https://example.org/retail/ontology#> .
@prefix ex:     <https://example.org/retail/data/> .
@prefix owl:    <http://www.w3.org/2002/07/owl#> .
@prefix rdfs:   <http://www.w3.org/2000/01/rdf-schema#> .
@prefix xsd:    <http://www.w3.org/2001/XMLSchema#> .

# ---- Ontology (TBox) ----
retail:Review    a owl:Class .
retail:writtenBy a owl:ObjectProperty   ; rdfs:domain retail:Review ; rdfs:range retail:Customer .
retail:reviewOf  a owl:ObjectProperty   ; rdfs:domain retail:Review ; rdfs:range retail:Product .
retail:rating    a owl:DatatypeProperty ; rdfs:domain retail:Review ; rdfs:range xsd:integer .

# ---- Instances (ABox) ----
ex:C1 a retail:Customer ; retail:name "Naidu Random1" .
ex:C2 a retail:Customer ; retail:name "Bob Random2" .
ex:PRD-0001 a retail:Product ; retail:name "Laptop Pro 14" .
ex:PRD-0006 a retail:Product ; retail:name "Mechanical Keyboard" .
ex:R1 a retail:Review ; retail:writtenBy ex:C1 ; retail:reviewOf ex:PRD-0001 ; retail:rating 5 .

ex:R5 a retail:Review ;
    retail:writtenBy ex:C2 ;
    retail:reviewOf  ex:PRD-0006 ;
    retail:rating    4 .
```
