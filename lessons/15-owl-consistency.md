---
title: Functional, disjoint, inconsistent
section: OWL
reasoning: owl
check_reasoning: owl
---

# When the reasoner disagrees with you

## owl:FunctionalProperty: at most one value

```turtle
ex:publisher a owl:FunctionalProperty .
```

"A book has at most one publisher." Now look at Dracula in the data: it has **two** publisher IRIs. A database would call that an error. OWL reasons differently (open world, remember?): *if there can be only one publisher, these two names must refer to the **same** publisher.* It infers:

```
ex:constable owl:sameAs ex:archibaldConstable
```

Run the query to see it. This surprises a lot of people: **OWL merges where you might expect it to complain.** That's correct here, but if the two publishers really were different, you'd need SHACL's `sh:maxCount 1` to catch it.

## owl:disjointWith: nothing can be both

```turtle
ex:Book owl:disjointWith ex:Person .
```

Nothing can be both a Book and a Person. If the data, *together with everything inferred*, puts something in both classes, the ontology is **inconsistent**: it contains a contradiction.

Look under the data panel and above the results: there's a **⚠ inconsistency**. Can you find the cause?

Following the chain:

1. `ex:author` has `rdfs:range ex:Person`.
2. Someone wrote `ex:frankenstein ex:author ex:dracula`, which is a typo for `ex:shelley`.
3. So the reasoner infers `ex:dracula a ex:Person`.
4. But `ex:dracula a ex:Book`, and Book and Person are disjoint. 💥

This is how OWL *does* catch errors: through **logical contradictions**, not missing data. Here's a query that finds the clash itself:

```sparql
PREFIX owl: <http://www.w3.org/2002/07/owl#>

SELECT ?x ?c1 ?c2
WHERE { ?c1 owl:disjointWith ?c2 . ?x a ?c1 , ?c2 }
```

## Exercise

Fix the **data** (not the schema!) so that the ontology is consistent again. Keep `owl:disjointWith` and the range. The ⚠ warning should disappear.

```turtle data
@prefix ex:   <http://example.org/library#> .
@prefix owl:  <http://www.w3.org/2002/07/owl#> .
@prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .

# ---- Schema ----
ex:Book   a owl:Class .
ex:Person a owl:Class ; owl:disjointWith ex:Book .
ex:author    a owl:ObjectProperty ; rdfs:range ex:Person .
ex:publisher a owl:ObjectProperty , owl:FunctionalProperty .

# ---- Data ----
ex:frankenstein a ex:Book ; ex:author ex:dracula .
ex:dracula      a ex:Book ; ex:author ex:stoker ;
                ex:publisher ex:constable , ex:archibaldConstable .
ex:shelley ex:name "Mary Shelley" .
```

```sparql query
PREFIX owl: <http://www.w3.org/2002/07/owl#>

SELECT ?a ?b WHERE { ?a owl:sameAs ?b }
```

```sparql check
PREFIX ex:   <http://example.org/library#>
PREFIX owl:  <http://www.w3.org/2002/07/owl#>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
ASK {
  ex:Person owl:disjointWith ex:Book .
  ex:author rdfs:range ex:Person .
  FILTER NOT EXISTS { { ?c1 owl:disjointWith ?c2 } UNION { ?c2 owl:disjointWith ?c1 } ?x a ?c1 , ?c2 }
}
```

```turtle solution-data
@prefix ex:   <http://example.org/library#> .
@prefix owl:  <http://www.w3.org/2002/07/owl#> .
@prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .

# ---- Schema ----
ex:Book   a owl:Class .
ex:Person a owl:Class ; owl:disjointWith ex:Book .
ex:author    a owl:ObjectProperty ; rdfs:range ex:Person .
ex:publisher a owl:ObjectProperty , owl:FunctionalProperty .

# ---- Data ----
ex:frankenstein a ex:Book ; ex:author ex:shelley .
ex:dracula      a ex:Book ; ex:author ex:stoker ;
                ex:publisher ex:constable , ex:archibaldConstable .
ex:shelley ex:name "Mary Shelley" .
```
