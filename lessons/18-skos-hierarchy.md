---
title: Broader, narrower, mappings
section: SKOS
reasoning: none
---

# Hierarchies and links between vocabularies

## broader and narrower

SKOS hierarchies use `skos:broader` ("is more specific than") and its inverse `skos:narrower`:

```turtle
ex:SciFi      skos:broader ex:Fiction .
ex:Cyberpunk  skos:broader ex:SciFi .
```

The arrow points **up**: Cyberpunk → SciFi → Fiction. This is *not* `rdfs:subClassOf`, so no instance inference happens. It just says one concept is more general than the other.

`skos:broader` is deliberately **not** transitive. To walk the whole tree, use a property path:

```sparql
PREFIX ex:   <http://example.org/library#>
PREFIX skos: <http://www.w3.org/2004/02/skos/core#>

SELECT ?concept ?label
WHERE { ?concept skos:broader* ex:Fiction ; skos:prefLabel ?label }
```

> **With a reasoner instead:** the SKOS standard itself says `skos:broader` is a sub-property of `skos:broaderTransitive` (which *is* transitive) and that `skos:narrower` is its inverse. Those axioms are at the bottom of the data. Switch Reasoning to **RDFS + OWL RL** and try this. It finds Cyberpunk too, two levels down, although no `narrower` triple is stored:

```sparql
PREFIX ex:   <http://example.org/library#>
PREFIX skos: <http://www.w3.org/2004/02/skos/core#>

SELECT ?c WHERE { ex:Fiction skos:narrowerTransitive ?c }
```

## Related and mappings

- `skos:related`: an associative, non-hierarchical link ("Horror *related to* Gothic").
- **Mapping properties** link concepts across different schemes:

| Property | Meaning |
|---|---|
| `skos:exactMatch` | interchangeable in practice |
| `skos:closeMatch` | similar enough for some uses |
| `skos:broadMatch` / `skos:narrowMatch` | more general / more specific concept in another scheme |
| `skos:relatedMatch` | associated |

These are the *safe* alternative to `owl:sameAs`, which you learned can leak facts. Saying "our *Horror* is a `closeMatch` for the bookshop's *Scary Stories*" makes no logical claim that they are identical.

```sparql
PREFIX skos: <http://www.w3.org/2004/02/skos/core#>

SELECT ?ours ?theirs ?how
WHERE {
  VALUES ?how { skos:exactMatch skos:closeMatch skos:broadMatch skos:narrowMatch }
  ?ours ?how ?theirs .
}
```

## Exercise

Books are tagged with the most **specific** genre. Write a query that returns the **titles of all books whose genre is Fiction or anything below it**, however deep. Return `?title`.

Use a property path, not the reasoner. (Non-fiction must not appear!)

```turtle data
@prefix ex:   <http://example.org/library#> .
@prefix shop: <http://bookshop.example.com/subjects/> .
@prefix skos: <http://www.w3.org/2004/02/skos/core#> .
@prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .
@prefix owl:  <http://www.w3.org/2002/07/owl#> .

# ---- Genre hierarchy ----
ex:Fiction    a skos:Concept ; skos:prefLabel "Fiction"@en .
ex:NonFiction a skos:Concept ; skos:prefLabel "Non-fiction"@en .
ex:SciFi      a skos:Concept ; skos:prefLabel "Science fiction"@en ; skos:broader ex:Fiction .
ex:Cyberpunk  a skos:Concept ; skos:prefLabel "Cyberpunk"@en ;       skos:broader ex:SciFi .
ex:Horror     a skos:Concept ; skos:prefLabel "Horror"@en ;          skos:broader ex:Fiction ;
              skos:related ex:Gothic .
ex:Gothic     a skos:Concept ; skos:prefLabel "Gothic"@en ;          skos:broader ex:Fiction .
ex:History    a skos:Concept ; skos:prefLabel "History"@en ;         skos:broader ex:NonFiction .

# ---- Mappings to a bookshop's subject list ----
ex:Horror  skos:closeMatch shop:ScaryStories .
ex:SciFi   skos:exactMatch shop:ScienceFiction .
ex:Gothic  skos:broadMatch shop:ClassicLiterature .

# ---- Books ----
ex:neuromancer  ex:title "Neuromancer" ;           ex:genre ex:Cyberpunk .
ex:timeMachine  ex:title "The Time Machine" ;      ex:genre ex:SciFi .
ex:dracula      ex:title "Dracula" ;               ex:genre ex:Horror .
ex:udolpho      ex:title "The Mysteries of Udolpho" ; ex:genre ex:Gothic .
ex:gibbon       ex:title "The Decline and Fall of the Roman Empire" ; ex:genre ex:History .

# ---- Axioms from the SKOS standard (used when reasoning is on) ----
skos:broader rdfs:subPropertyOf skos:broaderTransitive .
skos:broaderTransitive a owl:TransitiveProperty .
skos:narrowerTransitive owl:inverseOf skos:broaderTransitive .
skos:narrower owl:inverseOf skos:broader ; rdfs:subPropertyOf skos:narrowerTransitive .
```

```sparql query
PREFIX ex:   <http://example.org/library#>
PREFIX skos: <http://www.w3.org/2004/02/skos/core#>

SELECT ?concept ?label
WHERE { ?concept skos:broader* ex:Fiction ; skos:prefLabel ?label }
```

```sparql solution
PREFIX ex:   <http://example.org/library#>
PREFIX skos: <http://www.w3.org/2004/02/skos/core#>

SELECT ?title
WHERE { ?book ex:genre/skos:broader* ex:Fiction ; ex:title ?title }
```
