---
title: Restrictions and defined classes
section: OWL
reasoning: owl
check_reasoning: owl
---

# Defining classes by their properties

So far we've *told* the reasoner which class things belong to. With **restrictions**, you define a class by a condition, and the reasoner works out the members itself. The retail ontology has three such **defined classes** (in `retail-defined-classes.ttl`), all loaded on the right.

A restriction is an anonymous class (a blank node) describing "the things whose property *P* satisfies some condition".

## owl:hasValue + owl:intersectionOf: delivered orders

```turtle
retail:DeliveredOrder owl:equivalentClass [
    owl:intersectionOf ( retail:Order
                         [ a owl:Restriction ; owl:onProperty retail:status ;
                           owl:hasValue "DELIVERED" ] ) ] .
```

*A delivered order is exactly an Order whose status is "DELIVERED".* Because it's an **equivalence**, nobody has to tag orders as delivered. The reasoner classifies them:

```sparql
PREFIX retail: <https://example.org/retail/ontology#>

SELECT ?order WHERE { ?order a retail:DeliveredOrder }
```

## owl:unionOf: orders that don't count as revenue

```turtle
retail:NonRevenueOrder owl:equivalentClass [ owl:intersectionOf ( retail:Order
    [ owl:unionOf ( [ owl:onProperty retail:status ; owl:hasValue "CANCELLED" ]
                    [ owl:onProperty retail:status ; owl:hasValue "RETURNED" ] ) ] ) ] .
```

The glossary's revenue rule ("not cancelled or returned") is now **part of the model**, not a `FILTER` buried in every query:

```sparql
PREFIX retail: <https://example.org/retail/ontology#>

SELECT ?order ?status WHERE { ?order a retail:NonRevenueOrder ; retail:status ?status }
```

## owl:someValuesFrom: laptop buyers

```turtle
retail:LaptopBuyer owl:equivalentClass [ owl:intersectionOf ( retail:Customer
    [ owl:onProperty retail:purchased ;
      owl:someValuesFrom [ owl:onProperty retail:inCategory ; owl:hasValue ex:SUB-LAPTOP ] ] ) ] .
```

*A laptop buyer is a customer who purchased **at least one** thing whose category is Laptops.* This builds on the `purchased` property chain from the previous OWL lesson:

```sparql
PREFIX retail: <https://example.org/retail/ontology#>

SELECT ?who WHERE { ?who a retail:LaptopBuyer }
```

> The ontology also has **cardinality** restrictions, such as "every order is placed by exactly one customer" (`owl:qualifiedCardinality 1`). Under the open world those can't flag *missing* data, which is why the retail example also has SHACL shapes. This site runs a *subset* of the **OWL 2 RL** rules: enough to learn the ideas. For complete OWL DL reasoning, use Protégé with the HermiT reasoner.

## Exercise

Define **`retail:ShippedOrder`** in the same style as `retail:DeliveredOrder`: an Order whose `retail:status` has the value `"SHIPPED"`. Then `ex:ORD-0002` should be classified automatically, and no other order.

```turtle data
@prefix retail: <https://example.org/retail/ontology#> .
@prefix ex:     <https://example.org/retail/data/> .
@prefix owl:    <http://www.w3.org/2002/07/owl#> .
@prefix rdfs:   <http://www.w3.org/2000/01/rdf-schema#> .

# ---- From the retail ontology ----
retail:PremiumCustomer rdfs:subClassOf retail:Customer .
retail:placedBy owl:inverseOf retail:placedOrder .
retail:purchased owl:propertyChainAxiom ( retail:placedOrder retail:hasLine retail:forProduct ) .

# ---- Defined classes (retail-defined-classes.ttl) ----
retail:DeliveredOrder a owl:Class ;
    owl:equivalentClass [ a owl:Class ;
        owl:intersectionOf ( retail:Order
                             [ a owl:Restriction ; owl:onProperty retail:status ; owl:hasValue "DELIVERED" ] ) ] .

retail:NonRevenueOrder a owl:Class ;
    owl:equivalentClass [ a owl:Class ;
        owl:intersectionOf ( retail:Order
                             [ a owl:Class ; owl:unionOf (
                                 [ a owl:Restriction ; owl:onProperty retail:status ; owl:hasValue "CANCELLED" ]
                                 [ a owl:Restriction ; owl:onProperty retail:status ; owl:hasValue "RETURNED" ] ) ] ) ] .

retail:LaptopBuyer a owl:Class ;
    owl:equivalentClass [ a owl:Class ;
        owl:intersectionOf ( retail:Customer
                             [ a owl:Restriction ; owl:onProperty retail:purchased ;
                               owl:someValuesFrom [ a owl:Restriction ; owl:onProperty retail:inCategory ;
                                                    owl:hasValue ex:SUB-LAPTOP ] ] ) ] .

# ---- Data ----
ex:C1 a retail:PremiumCustomer .
ex:C2 a retail:Customer .
ex:C3 a retail:PremiumCustomer .
ex:PRD-0001 retail:inCategory ex:SUB-LAPTOP .
ex:PRD-0003 retail:inCategory ex:SUB-CHARGE .
ex:PRD-0004 retail:inCategory ex:SUB-PRINTB .
ex:PRD-0005 retail:inCategory ex:SUB-KNIVES .

ex:ORD-0001 a retail:Order ; retail:status "DELIVERED" ; retail:placedBy ex:C1 ; retail:hasLine ex:ORD-0001-1 , ex:ORD-0001-2 .
ex:ORD-0002 a retail:Order ; retail:status "SHIPPED"   ; retail:placedBy ex:C2 ; retail:hasLine ex:ORD-0002-1 .
ex:ORD-0004 a retail:Order ; retail:status "PLACED"    ; retail:placedBy ex:C3 ; retail:hasLine ex:ORD-0004-1 .
ex:ORD-0005 a retail:Order ; retail:status "CANCELLED" ; retail:placedBy ex:C3 ; retail:hasLine ex:ORD-0005-1 .
ex:ORD-0006 a retail:Order ; retail:status "RETURNED"  ; retail:placedBy ex:C2 ; retail:hasLine ex:ORD-0006-1 .
ex:ORD-0001-1 retail:forProduct ex:PRD-0001 .
ex:ORD-0001-2 retail:forProduct ex:PRD-0003 .
ex:ORD-0002-1 retail:forProduct ex:PRD-0004 .
ex:ORD-0004-1 retail:forProduct ex:PRD-0005 .
ex:ORD-0005-1 retail:forProduct ex:PRD-0004 .
ex:ORD-0006-1 retail:forProduct ex:PRD-0005 .
```

```sparql query
PREFIX retail: <https://example.org/retail/ontology#>

SELECT ?order WHERE { ?order a retail:DeliveredOrder }
```

```sparql check
PREFIX retail: <https://example.org/retail/ontology#>
PREFIX ex:     <https://example.org/retail/data/>
ASK {
  ex:ORD-0002 a retail:ShippedOrder .
  FILTER NOT EXISTS { ?o a retail:ShippedOrder FILTER(?o != ex:ORD-0002) }
}
```

```turtle solution-data
@prefix retail: <https://example.org/retail/ontology#> .
@prefix ex:     <https://example.org/retail/data/> .
@prefix owl:    <http://www.w3.org/2002/07/owl#> .
@prefix rdfs:   <http://www.w3.org/2000/01/rdf-schema#> .

# ---- From the retail ontology ----
retail:PremiumCustomer rdfs:subClassOf retail:Customer .
retail:placedBy owl:inverseOf retail:placedOrder .
retail:purchased owl:propertyChainAxiom ( retail:placedOrder retail:hasLine retail:forProduct ) .

# ---- Defined classes (retail-defined-classes.ttl) ----
retail:DeliveredOrder a owl:Class ;
    owl:equivalentClass [ a owl:Class ;
        owl:intersectionOf ( retail:Order
                             [ a owl:Restriction ; owl:onProperty retail:status ; owl:hasValue "DELIVERED" ] ) ] .

retail:ShippedOrder a owl:Class ;
    owl:equivalentClass [ a owl:Class ;
        owl:intersectionOf ( retail:Order
                             [ a owl:Restriction ; owl:onProperty retail:status ; owl:hasValue "SHIPPED" ] ) ] .

retail:NonRevenueOrder a owl:Class ;
    owl:equivalentClass [ a owl:Class ;
        owl:intersectionOf ( retail:Order
                             [ a owl:Class ; owl:unionOf (
                                 [ a owl:Restriction ; owl:onProperty retail:status ; owl:hasValue "CANCELLED" ]
                                 [ a owl:Restriction ; owl:onProperty retail:status ; owl:hasValue "RETURNED" ] ) ] ) ] .

retail:LaptopBuyer a owl:Class ;
    owl:equivalentClass [ a owl:Class ;
        owl:intersectionOf ( retail:Customer
                             [ a owl:Restriction ; owl:onProperty retail:purchased ;
                               owl:someValuesFrom [ a owl:Restriction ; owl:onProperty retail:inCategory ;
                                                    owl:hasValue ex:SUB-LAPTOP ] ] ) ] .

# ---- Data ----
ex:C1 a retail:PremiumCustomer .
ex:C2 a retail:Customer .
ex:C3 a retail:PremiumCustomer .
ex:PRD-0001 retail:inCategory ex:SUB-LAPTOP .
ex:PRD-0003 retail:inCategory ex:SUB-CHARGE .
ex:PRD-0004 retail:inCategory ex:SUB-PRINTB .
ex:PRD-0005 retail:inCategory ex:SUB-KNIVES .

ex:ORD-0001 a retail:Order ; retail:status "DELIVERED" ; retail:placedBy ex:C1 ; retail:hasLine ex:ORD-0001-1 , ex:ORD-0001-2 .
ex:ORD-0002 a retail:Order ; retail:status "SHIPPED"   ; retail:placedBy ex:C2 ; retail:hasLine ex:ORD-0002-1 .
ex:ORD-0004 a retail:Order ; retail:status "PLACED"    ; retail:placedBy ex:C3 ; retail:hasLine ex:ORD-0004-1 .
ex:ORD-0005 a retail:Order ; retail:status "CANCELLED" ; retail:placedBy ex:C3 ; retail:hasLine ex:ORD-0005-1 .
ex:ORD-0006 a retail:Order ; retail:status "RETURNED"  ; retail:placedBy ex:C2 ; retail:hasLine ex:ORD-0006-1 .
ex:ORD-0001-1 retail:forProduct ex:PRD-0001 .
ex:ORD-0001-2 retail:forProduct ex:PRD-0003 .
ex:ORD-0002-1 retail:forProduct ex:PRD-0004 .
ex:ORD-0004-1 retail:forProduct ex:PRD-0005 .
ex:ORD-0005-1 retail:forProduct ex:PRD-0004 .
ex:ORD-0006-1 retail:forProduct ex:PRD-0005 .
```
