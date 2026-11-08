---
title: What is an ontology?
section: Ontology concepts
---

# What is an ontology?

> An ontology is a **formal, explicit description of the concepts in a domain**.
> (Noy & McGuinness, *[Ontology Development 101](https://protege.stanford.edu/publications/ontology_development/ontology101.pdf)*, after Gruber)

- **Domain**: the part of the world you care about. Here that's an online store.
- **Concepts**: the kinds of things in it: customers, orders, products, brands.
- **Explicit**: written down, not living in people's heads or scattered through application code.
- **Formal**: in a precise language a machine can process, check and reason over.

## The four building blocks

| Building block | Also called | In the store | Written in |
|---|---|---|---|
| **Classes** | concepts, types | `Customer`, `Order`, `Product` | `owl:Class` |
| **Properties** | slots, roles | `placedBy`, `price`, `email` | `owl:ObjectProperty`, `owl:DatatypeProperty` |
| **Restrictions** | facets, role restrictions | "an order is placed by exactly one customer" | OWL restrictions, SHACL shapes |
| **Individuals** | instances | customer `ex:C1`, order `ex:ORD-0001` | plain RDF triples |

The next lessons take these one at a time. The last concepts lesson collects all the alternative names in one place, because every tool and community uses different words.

## Ontology + instances = knowledge base

The first three blocks describe the domain *in general*: what a customer is and what an order must have. Add **individuals** (actual customers and orders) and you have a **knowledge base**. Viewed as nodes and edges, it's a **knowledge graph**.

You'll often see two names from logic for the two halves:

- **TBox** (terminological box): the ontology, i.e. classes, properties and restrictions. *"Every order is placed by a customer."*
- **ABox** (assertional box): facts about individuals. *"ORD-0001 was placed by C1."*

The retail example keeps them in separate files (`retail-ontology.ttl` is the TBox, `retail-data.ttl` the ABox), but both are just **triples** and can live in one graph. The line between them is fuzzy, too. Are the product families (*Electronics*, *Media*) classes or individuals? The retail ontology decided they're individuals, so they can carry codes and names like any other data.

Run the query on the right. It labels every triple as TBox or ABox, depending on whether its subject is a term of the ontology or a piece of store data.

## Where each standard fits

| Job | Standard | Lesson |
|---|---|---|
| The data model: everything is a triple | **RDF** | Foundations |
| A text format for writing triples | **Turtle** | Foundations |
| Querying the graph | **SPARQL** | SPARQL basics |
| Classes, hierarchies, domain and range | **RDFS** | RDFS |
| Richer meaning: inverse, transitive, restrictions, equivalence | **OWL** | OWL |
| Taxonomies, glossaries, labels | **SKOS** | SKOS |
| Validating data against rules | **SHACL** | SHACL |

## Why build one?

- **A shared vocabulary.** "Revenue", "customer" and "order" mean one agreed thing across teams and systems.
- **Explicit assumptions.** "Cancelled orders don't count as revenue" is written in the model, not buried in a SQL filter.
- **Reuse.** The retail ontology reuses schema.org, SKOS and the Google Product Taxonomy instead of reinventing them.
- **Machines can reason.** A reasoner can derive facts nobody typed in, and spot contradictions.

```turtle data
@prefix retail: <https://example.org/retail/ontology#> .
@prefix ex:     <https://example.org/retail/data/> .
@prefix owl:    <http://www.w3.org/2002/07/owl#> .
@prefix rdfs:   <http://www.w3.org/2000/01/rdf-schema#> .

# ---- TBox: the ontology (describes the domain in general) ----
retail:Customer  a owl:Class .
retail:Order     a owl:Class .
retail:placedBy  a owl:ObjectProperty ; rdfs:domain retail:Order ; rdfs:range retail:Customer .
retail:name      a owl:DatatypeProperty .

# ---- ABox: the instances (facts about particular things) ----
ex:C1       a retail:Customer ; retail:name "Naidu Random1" .
ex:ORD-0001 a retail:Order    ; retail:placedBy ex:C1 .
```

```sparql query
SELECT ?part ?s ?p ?o
WHERE {
  ?s ?p ?o .
  BIND(IF(STRSTARTS(STR(?s), "https://example.org/retail/ontology"),
          "TBox (ontology)", "ABox (instances)") AS ?part)
}
ORDER BY DESC(?part)
```
