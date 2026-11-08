---
title: Functional, disjoint, inconsistent
section: OWL
reasoning: owl
check_reasoning: owl
---

# When the reasoner disagrees with you

## owl:FunctionalProperty: at most one value

```turtle
retail:placedBy a owl:FunctionalProperty .
```

"An order is placed by at most one customer." Now look at `ex:ORD-0007` in the data: it has **two** `placedBy` values, the shop's `ex:C1` and the CRM's `crm:CRM-1001`. A database would call that an error. OWL reasons differently (open world, remember?): *if there can be only one customer, these two names must refer to the **same** customer.* It infers:

```
ex:C1 owl:sameAs crm:CRM-1001
```

Run the query to see it. This surprises a lot of people: **OWL merges where you might expect it to complain.** That's correct here, but if `ORD-0007` had wrongly listed two *different* customers, OWL would merge them too! To catch that kind of error you need SHACL's `sh:maxCount 1`.

## owl:AllDisjointClasses: nothing can be in two of these

The retail ontology lists the classes that can never overlap:

```turtle
[] a owl:AllDisjointClasses ;
   owl:members ( retail:Party retail:Brand retail:Product retail:Order retail:Review … ) .
```

Nothing can be both a Party and a Product. If the data, *together with everything inferred*, puts something in two of these classes, the ontology is **inconsistent**: it contains a contradiction.

Look under the data panel and above the results: there's a **⚠ inconsistency**. Can you find the cause?

Following the chain:

1. `retail:writtenBy` has `rdfs:range retail:Customer`.
2. Review `ex:R5` says `retail:writtenBy ex:PRD-0002`, a product IRI typed by mistake instead of the customer `ex:C1`.
3. So the reasoner infers `ex:PRD-0002 a retail:Customer`, and therefore `a retail:Party`.
4. But `ex:PRD-0002 a retail:Product`, and Party and Product are disjoint. 💥

This is how OWL *does* catch errors: through **logical contradictions**, not missing data. Here's a query that finds the clash itself:

```sparql
PREFIX owl: <http://www.w3.org/2002/07/owl#>
PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>

SELECT DISTINCT ?x ?c1 ?c2
WHERE {
  ?d a owl:AllDisjointClasses ; owl:members ?list .
  ?list rdf:rest*/rdf:first ?c1 . ?list rdf:rest*/rdf:first ?c2 .
  FILTER(STR(?c1) < STR(?c2))
  ?x a ?c1 , ?c2 .
}
```

## Exercise

Fix the **data** (not the schema!) so the ontology is consistent again: the review was really written by **`ex:C1`**. Keep `owl:AllDisjointClasses` and the range. The ⚠ warning should disappear.

```turtle data
@prefix retail: <https://example.org/retail/ontology#> .
@prefix ex:     <https://example.org/retail/data/> .
@prefix crm:    <https://example.org/crm/contact/> .
@prefix owl:    <http://www.w3.org/2002/07/owl#> .
@prefix rdfs:   <http://www.w3.org/2000/01/rdf-schema#> .

# ---- Schema (from the retail ontology) ----
retail:Customer  rdfs:subClassOf retail:Party .
retail:placedBy  a owl:ObjectProperty , owl:FunctionalProperty ; rdfs:range retail:Customer .
retail:writtenBy a owl:ObjectProperty , owl:FunctionalProperty ; rdfs:range retail:Customer .
retail:reviewOf  a owl:ObjectProperty , owl:FunctionalProperty ; rdfs:range retail:Product .
[] a owl:AllDisjointClasses ;
   owl:members ( retail:Party retail:Brand retail:Product retail:Order retail:Review ) .

# ---- Data ----
ex:C1       a retail:Customer ; retail:name "Naidu Random1" .
ex:PRD-0002 a retail:Product  ; retail:name "Wireless Earbuds X" .
ex:ORD-0007 a retail:Order ; retail:placedBy ex:C1 , crm:CRM-1001 .
ex:R5       a retail:Review ; retail:reviewOf ex:PRD-0002 ;
            retail:writtenBy ex:PRD-0002 ;          # mistake!
            retail:rating 4 .
```

```sparql query
PREFIX owl: <http://www.w3.org/2002/07/owl#>

SELECT ?a ?b WHERE { ?a owl:sameAs ?b }
```

```sparql check
PREFIX retail: <https://example.org/retail/ontology#>
PREFIX ex:     <https://example.org/retail/data/>
PREFIX owl:    <http://www.w3.org/2002/07/owl#>
PREFIX rdf:    <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
PREFIX rdfs:   <http://www.w3.org/2000/01/rdf-schema#>
ASK {
  ?d a owl:AllDisjointClasses .
  retail:writtenBy rdfs:range retail:Customer .
  ex:R5 retail:writtenBy ex:C1 .
  FILTER NOT EXISTS {
    ?dd a owl:AllDisjointClasses ; owl:members ?l .
    ?l rdf:rest*/rdf:first ?c1 . ?l rdf:rest*/rdf:first ?c2 .
    FILTER(?c1 != ?c2) ?x a ?c1 , ?c2 .
  }
}
```

```turtle solution-data
@prefix retail: <https://example.org/retail/ontology#> .
@prefix ex:     <https://example.org/retail/data/> .
@prefix crm:    <https://example.org/crm/contact/> .
@prefix owl:    <http://www.w3.org/2002/07/owl#> .
@prefix rdfs:   <http://www.w3.org/2000/01/rdf-schema#> .

# ---- Schema (from the retail ontology) ----
retail:Customer  rdfs:subClassOf retail:Party .
retail:placedBy  a owl:ObjectProperty , owl:FunctionalProperty ; rdfs:range retail:Customer .
retail:writtenBy a owl:ObjectProperty , owl:FunctionalProperty ; rdfs:range retail:Customer .
retail:reviewOf  a owl:ObjectProperty , owl:FunctionalProperty ; rdfs:range retail:Product .
[] a owl:AllDisjointClasses ;
   owl:members ( retail:Party retail:Brand retail:Product retail:Order retail:Review ) .

# ---- Data ----
ex:C1       a retail:Customer ; retail:name "Naidu Random1" .
ex:PRD-0002 a retail:Product  ; retail:name "Wireless Earbuds X" .
ex:ORD-0007 a retail:Order ; retail:placedBy ex:C1 , crm:CRM-1001 .
ex:R5       a retail:Review ; retail:reviewOf ex:PRD-0002 ;
            retail:writtenBy ex:C1 ;
            retail:rating 4 .
```
