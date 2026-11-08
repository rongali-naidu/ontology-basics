---
title: Restrictions (facets)
section: Ontology concepts
tab: data
expect_focus: ex:ORD-0009 ex:ORD-0010
---

# Restrictions: what values are allowed

A property says *what* describes a class. A **restriction**, also called a **facet** or **role restriction**, says *what is allowed*:

| Facet | Question it answers | Store example |
|---|---|---|
| **Value type** | what kind of value? | a price is a decimal |
| **Allowed values** | which values? | status is one of PLACED, SHIPPED, DELIVERED, CANCELLED, RETURNED |
| **Allowed classes** | values of which class? | `placedBy` points to a Customer |
| **Cardinality** | how many values? | an order is placed by **exactly one** customer |
| **Value range** | between what bounds? | a rating is from 1 to 5 |

## Two ways to write them, with two meanings

**OWL restrictions** describe what is *true of the world*. The retail ontology says:

```turtle
retail:Order rdfs:subClassOf [
    a owl:Restriction ;
    owl:onProperty retail:placedBy ;
    owl:qualifiedCardinality 1 ;
    owl:onClass retail:Customer ] .
```

Under OWL's **open-world** view, an order with no `placedBy` is *not* an error: its customer is just unknown. OWL restrictions are used for **reasoning** and for finding **contradictions**.

**SHACL shapes** describe what valid *data* must look like. This is the **closed world**: missing means wrong.

```turtle
shape:OrderShape sh:targetClass retail:Order ;
    sh:property [ sh:path retail:placedBy ; sh:class retail:Customer ;
                  sh:minCount 1 ; sh:maxCount 1 ] .
```

| Facet | OWL | SHACL | OOP / database |
|---|---|---|---|
| value type | `rdfs:range xsd:decimal` | `sh:datatype xsd:decimal` | field type, column type |
| allowed classes | `owl:allValuesFrom`, `rdfs:range` | `sh:class` | reference type, foreign key |
| allowed values | `owl:oneOf` | `sh:in` | `enum`, `CHECK (… IN …)` |
| required | `owl:minCardinality 1` *(open world: not enforced)* | `sh:minCount 1` | `NOT NULL`, constructor parameter |
| at most one | `owl:FunctionalProperty`, `owl:maxCardinality 1` | `sh:maxCount 1` | single-valued field vs list |
| range of numbers | datatype restriction `xsd:minInclusive` | `sh:minInclusive` | `CHECK (rating BETWEEN 1 AND 5)` |

**Rule of thumb:** model meaning in OWL; enforce data quality in SHACL. The retail example has both: `retail-ontology.ttl` and `retail-shapes.ttl`.

## Try it

The data tab holds three orders and the **OWL** restriction. Press **Validate ✓**. The **Shapes** tab has a SHACL shape for the "exactly one customer" rule, and `ex:ORD-0010` breaks it. OWL alone never complained about it.

## Exercise

The ontology lists the allowed status values with `owl:oneOf` (look at the data). Turn that into a **SHACL** check: add a property shape to `shape:OrderShape` for `retail:status`, with **`sh:minCount 1`** and **`sh:in ( "PLACED" "SHIPPED" "DELIVERED" "CANCELLED" "RETURNED" )`**.

The report should then flag exactly **`ex:ORD-0009`** (status `"Shipped"`, wrong case) and **`ex:ORD-0010`**.

```turtle shapes
@prefix sh:     <http://www.w3.org/ns/shacl#> .
@prefix retail: <https://example.org/retail/ontology#> .
@prefix shape:  <https://example.org/retail/shapes#> .

shape:OrderShape a sh:NodeShape ;
    sh:targetClass retail:Order ;
    sh:property [ sh:path retail:placedBy ; sh:class retail:Customer ;
                  sh:minCount 1 ; sh:maxCount 1 ;
                  sh:message "An order is placed by exactly one customer." ] .
```

```turtle data
@prefix retail: <https://example.org/retail/ontology#> .
@prefix ex:     <https://example.org/retail/data/> .
@prefix owl:    <http://www.w3.org/2002/07/owl#> .
@prefix rdfs:   <http://www.w3.org/2000/01/rdf-schema#> .
@prefix xsd:    <http://www.w3.org/2001/XMLSchema#> .

# ---- OWL restrictions (from retail-ontology.ttl) ----
retail:Order rdfs:subClassOf [
    a owl:Restriction ;
    owl:onProperty retail:placedBy ;
    owl:qualifiedCardinality "1"^^xsd:nonNegativeInteger ;
    owl:onClass retail:Customer ] .
retail:status a owl:DatatypeProperty , owl:FunctionalProperty ;
    rdfs:range [ a rdfs:Datatype ;
                 owl:oneOf ( "PLACED" "SHIPPED" "DELIVERED" "CANCELLED" "RETURNED" ) ] .

# ---- Data ----
ex:C1 a retail:Customer .
ex:ORD-0001 a retail:Order ; retail:placedBy ex:C1 ; retail:status "DELIVERED" .
ex:ORD-0009 a retail:Order ; retail:placedBy ex:C1 ; retail:status "Shipped" .
ex:ORD-0010 a retail:Order ;                         retail:status "PLACED" .
```

```turtle solution-shapes
@prefix sh:     <http://www.w3.org/ns/shacl#> .
@prefix retail: <https://example.org/retail/ontology#> .
@prefix shape:  <https://example.org/retail/shapes#> .

shape:OrderShape a sh:NodeShape ;
    sh:targetClass retail:Order ;
    sh:property [ sh:path retail:placedBy ; sh:class retail:Customer ;
                  sh:minCount 1 ; sh:maxCount 1 ;
                  sh:message "An order is placed by exactly one customer." ] ;
    sh:property [ sh:path retail:status ; sh:minCount 1 ;
                  sh:in ( "PLACED" "SHIPPED" "DELIVERED" "CANCELLED" "RETURNED" ) ] .
```
