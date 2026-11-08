---
title: OWL and the open world
section: OWL
reasoning: none
---

# From RDFS to OWL

**OWL** (the Web Ontology Language) builds on RDFS and adds much richer meaning: equivalence, inverse and transitive properties, cardinality, disjointness and logical class definitions. An OWL ontology is still just RDF triples, so you query it with SPARQL like everything else.

## The basic OWL vocabulary

```turtle
ex:Book      a owl:Class .
ex:Person    a owl:Class .
ex:author    a owl:ObjectProperty ;     # links a thing to a thing
             rdfs:domain ex:Book ; rdfs:range ex:Person .
ex:title     a owl:DatatypeProperty ;   # links a thing to a literal value
             rdfs:range xsd:string .
ex:shelley   a owl:NamedIndividual , ex:Person .
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

Bob has no email in our data. A database would say "Bob has no email". OWL says "we don't *know* Bob's email". Maybe he has one and nobody wrote it down.

So OWL **can't** tell you "find everyone without an email" or "every book must have an author", because missing data is never an error in OWL. SPARQL, on the other hand, works over exactly the triples it has, so it *can* answer the first question with `FILTER NOT EXISTS`. The second, a **constraint**, is what SHACL is for.

| Question | Tool |
|---|---|
| "What else follows from what I know?" | OWL / RDFS reasoning |
| "What is in my data right now?" | SPARQL |
| "Is my data complete and well-formed?" | SHACL |

## Exercise

Using SPARQL's closed-world view, list the **names of all members who have no `ex:email`**. Return `?name`.

```turtle data
@prefix ex:   <http://example.org/library#> .
@prefix owl:  <http://www.w3.org/2002/07/owl#> .
@prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .
@prefix xsd:  <http://www.w3.org/2001/XMLSchema#> .

ex:library a owl:Ontology ;
    rdfs:label "Tiny library ontology" ;
    owl:versionInfo "1.0" .

ex:Member a owl:Class ; rdfs:label "Library member" .
ex:name   a owl:DatatypeProperty ; rdfs:domain ex:Member ; rdfs:range xsd:string .
ex:email  a owl:DatatypeProperty ; rdfs:domain ex:Member ; rdfs:range xsd:string .

ex:alice a owl:NamedIndividual , ex:Member ; ex:name "Alice" ; ex:email "alice@example.org" .
ex:bob   a owl:NamedIndividual , ex:Member ; ex:name "Bob" .
ex:chen  a owl:NamedIndividual , ex:Member ; ex:name "Chen" ; ex:email "chen@example.org" .
ex:dana  a owl:NamedIndividual , ex:Member ; ex:name "Dana" .
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
PREFIX ex: <http://example.org/library#>

SELECT ?name
WHERE {
  ?m a ex:Member ; ex:name ?name .
  FILTER NOT EXISTS { ?m ex:email ?e }
}
```
