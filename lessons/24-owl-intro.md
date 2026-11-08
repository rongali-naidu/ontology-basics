---
title: OWL and the open world
section: OWL
reasoning: none
---

# From RDFS to OWL

**OWL** (the Web Ontology Language) builds on RDFS and adds much richer meaning: equivalence, inverse and transitive properties, cardinality, disjointness and logical class definitions. An OWL ontology is still just RDF triples, so you query it with SPARQL like everything else.

## The ontology header

An OWL ontology describes itself. This is the start of the retail ontology:

```turtle
<https://example.org/retail/ontology> a owl:Ontology ;
    owl:versionIRI  <https://example.org/retail/ontology/2.0.0> ;
    owl:priorVersion <https://example.org/retail/ontology/1.0.0> ;
    owl:versionInfo "2.0.0" ;
    dcterms:title   "Retail Ordering Ontology"@en .
```

## Two kinds of property

```turtle
retail:placedBy  a owl:ObjectProperty .      # links a thing to a thing  (Order → Customer)
retail:orderDate a owl:DatatypeProperty ;    # links a thing to a value  (Order → date)
                 rdfs:range xsd:date .
```

| Term | Meaning |
|---|---|
| `owl:Class` | a class (OWL's version of `rdfs:Class`) |
| `owl:ObjectProperty` | relates two resources |
| `owl:DatatypeProperty` | relates a resource to a literal |
| `owl:AnnotationProperty` | for documentation only (e.g. `rdfs:label`) |
| `owl:NamedIndividual` | an instance |
| `owl:Ontology` | the ontology itself, with its version and imports |

## The open world assumption

This idea trips up almost everyone coming from databases:

> **Closed world** (databases, SPARQL over the data): *if a fact is not stored, it is false.*
> **Open world** (OWL): *if a fact is not stored, it is simply **unknown**.*

Order `ex:ORD-0004` has no ship date in our data. A database would say "it hasn't shipped". OWL says "we don't *know* its ship date". Maybe it shipped and nobody recorded it yet.

So OWL **can't** tell you "find orders without a ship date" or "every order must have a date", because missing data is never an error in OWL. SPARQL, on the other hand, works over exactly the triples it has, so it *can* answer the first question with `FILTER NOT EXISTS`. The second, a **constraint**, is what SHACL is for.

| Question | Tool |
|---|---|
| "What else follows from what I know?" | OWL / RDFS reasoning |
| "What is in my data right now?" | SPARQL |
| "Is my data complete and well-formed?" | SHACL |

## Exercise

Using SPARQL's closed-world view, list **every order that has no `retail:shipDate`**, with its status. Return `?order ?status`.

```turtle data
@prefix retail:  <https://example.org/retail/ontology#> .
@prefix ex:      <https://example.org/retail/data/> .
@prefix owl:     <http://www.w3.org/2002/07/owl#> .
@prefix rdfs:    <http://www.w3.org/2000/01/rdf-schema#> .
@prefix xsd:     <http://www.w3.org/2001/XMLSchema#> .
@prefix dcterms: <http://purl.org/dc/terms/> .

<https://example.org/retail/ontology> a owl:Ontology ;
    owl:versionIRI  <https://example.org/retail/ontology/2.0.0> ;
    owl:versionInfo "2.0.0" ;
    dcterms:title   "Retail Ordering Ontology"@en .

retail:Order     a owl:Class ; rdfs:label "Order"@en .
retail:Customer  a owl:Class ; rdfs:label "Customer"@en .
retail:placedBy  a owl:ObjectProperty   ; rdfs:domain retail:Order ; rdfs:range retail:Customer .
retail:orderDate a owl:DatatypeProperty ; rdfs:domain retail:Order ; rdfs:range xsd:date .
retail:shipDate  a owl:DatatypeProperty ; rdfs:domain retail:Order ; rdfs:range xsd:date .
retail:status    a owl:DatatypeProperty ; rdfs:domain retail:Order .

ex:ORD-0001 a retail:Order ; retail:placedBy ex:C1 ; retail:orderDate "2026-09-01"^^xsd:date ; retail:shipDate "2026-09-02"^^xsd:date ; retail:status "DELIVERED" .
ex:ORD-0002 a retail:Order ; retail:placedBy ex:C2 ; retail:orderDate "2026-09-05"^^xsd:date ; retail:shipDate "2026-09-07"^^xsd:date ; retail:status "SHIPPED" .
ex:ORD-0004 a retail:Order ; retail:placedBy ex:C3 ; retail:orderDate "2026-10-02"^^xsd:date ; retail:status "PLACED" .
ex:ORD-0005 a retail:Order ; retail:placedBy ex:C3 ; retail:orderDate "2026-10-05"^^xsd:date ; retail:status "CANCELLED" .
```

```sparql query
PREFIX owl: <http://www.w3.org/2002/07/owl#>

SELECT ?term ?kind
WHERE {
  ?term a ?kind .
  VALUES ?kind { owl:Class owl:ObjectProperty owl:DatatypeProperty owl:Ontology }
}
```

```sparql solution
PREFIX retail: <https://example.org/retail/ontology#>

SELECT ?order ?status
WHERE {
  ?order a retail:Order ; retail:status ?status .
  FILTER NOT EXISTS { ?order retail:shipDate ?d }
}
```
