---
title: What is an ontology?
section: Ontology concepts
---

# What is an ontology?

## From philosophy…

The word comes from Greek: *on, ontos* ("being, that which is") + *-logia* ("study"). In philosophy, **ontology** is the branch of metaphysics that studies the nature of being: *what exists*, and what kinds of things there are.

## …to technology

In the early 1990s, AI and knowledge-engineering researchers borrowed the word for something more practical:

**An ontology is a formal, machine-readable specification of a shared conceptual model of a domain.**

- **Domain**: the part of the world you care about. Here that's an online store.
- **Conceptual model**: the kinds of things in it (customers, orders, products) and how they relate.
- **Shared**: an agreement. The web shop, the warehouse and the analysts all mean the same thing by "order".
- **Formal and machine-readable**: written down explicitly, in a precise language (RDFS/OWL) that software can process, check and reason over, rather than living in people's heads or scattered through application code.

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

| Job | Standard | Lesson | Reference |
|---|---|---|---|
| The data model: everything is a triple | **RDF** | [Foundations](#/07-triples) | [RDF 1.1 Primer](https://www.w3.org/TR/rdf11-primer/) |
| A text format for writing triples | **Turtle** | [Foundations](#/08-turtle) | [Turtle spec](https://www.w3.org/TR/turtle/) |
| Querying and updating the graph | **SPARQL** | [SPARQL basics](#/10-select) | [SPARQL 1.1 Query](https://www.w3.org/TR/sparql11-query/) · [Update](https://www.w3.org/TR/sparql11-update/) |
| Classes, hierarchies, domain and range | **RDFS** | [RDFS](#/21-rdfs-classes) | [RDF Schema 1.1](https://www.w3.org/TR/rdf-schema/) |
| Richer meaning: inverse, transitive, restrictions, equivalence | **OWL** | [OWL](#/24-owl-intro) | [OWL 2 Primer](https://www.w3.org/TR/owl2-primer/) |
| Taxonomies, glossaries, labels | **SKOS** | [SKOS](#/29-skos-concepts) | [SKOS Primer](https://www.w3.org/TR/skos-primer/) |
| Validating data against rules | **SHACL** | [SHACL](#/31-shacl-first-shape) | [SHACL spec](https://www.w3.org/TR/shacl/) |

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
