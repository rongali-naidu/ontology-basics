---
title: SHACL and OWL together
section: SHACL
tab: data
expect_focus:
---

# Inference vs validation

You've now seen both sides. Here's the same intention, *"an order is placed by one customer"*, written both ways:

```turtle
# OWL: inference
retail:placedBy rdfs:range retail:Customer ; a owl:FunctionalProperty .

# SHACL: a constraint
shape:OrderShape sh:property [ sh:path retail:placedBy ;
    sh:class retail:Customer ; sh:minCount 1 ; sh:maxCount 1 ] .
```

| | OWL / RDFS | SHACL |
|---|---|---|
| World view | open: missing = unknown | closed: missing = violation |
| `ex:x retail:placedBy ex:y`, and `ex:y` has no type | **infers** `ex:y a retail:Customer` | **reports** a violation |
| Order with no customer | fine, the customer is just unknown | violation (`sh:minCount 1`) |
| Order with two customers | **merges** them (`sameAs`) | violation (`sh:maxCount 1`) |
| Status `"Shipped"` instead of `"SHIPPED"` | `owl:oneOf` can't flag it | violation (`sh:in`) |
| Result | more triples | a validation report |
| Good for | integrating data, classification, query convenience | data quality, forms, APIs, pipelines |

They work well **together**: reason first to add the facts that follow logically, then validate the result. This playground does exactly that. With Reasoning on, the inferred triples are included in SHACL validation. The retail example validates the same way: `pyshacl -s retail-shapes.ttl -e retail-ontology.ttl -i rdfs`.

## Try it

1. Press **Validate ✓**. `ex:C4` has no type, so `sh:class retail:Customer` fails. `ex:ORD-0008` has no customer and a badly spelled status.
2. Switch Reasoning to **RDFS** and validate again. The `range` axiom *infers* that C4 is a Customer, so that violation disappears. ORD-0008's problems are still reported: no inference can invent a missing value or fix a typo.

> **Watch out:** reasoning can also *create* violations. Under OWL RL, transitive `retail:subCategoryOf` gives `SUB-LAPTOP` **two** parents (Computers *and* Electronics), which breaks the hierarchy shape's `sh:maxCount 1`. That's one reason the retail example validates with RDFS inference only.

## Exercise

Make the data **conform**: the report should be empty. You may use reasoning, edit the data, or both, but don't change the shapes. Ask yourself which fix is *right*: should C4 get its type from inference, or be stated explicitly?

```turtle shapes
@prefix sh:     <http://www.w3.org/ns/shacl#> .
@prefix retail: <https://example.org/retail/ontology#> .
@prefix shape:  <https://example.org/retail/shapes#> .

shape:OrderShape a sh:NodeShape ;
    sh:targetClass retail:Order ;
    sh:property [ sh:path retail:placedBy ; sh:class retail:Customer ; sh:minCount 1 ; sh:maxCount 1 ] ;
    sh:property [ sh:path retail:status ; sh:minCount 1 ;
                  sh:in ( "PLACED" "SHIPPED" "DELIVERED" "CANCELLED" "RETURNED" ) ] .
```

```turtle data
@prefix retail: <https://example.org/retail/ontology#> .
@prefix ex:     <https://example.org/retail/data/> .
@prefix rdfs:   <http://www.w3.org/2000/01/rdf-schema#> .

# ---- Ontology ----
retail:placedBy rdfs:range retail:Customer .

# ---- Data ----
ex:ORD-0001 a retail:Order ; retail:placedBy ex:C1 ; retail:status "DELIVERED" .
ex:ORD-0007 a retail:Order ; retail:placedBy ex:C4 ; retail:status "PLACED" .
ex:ORD-0008 a retail:Order ;                         retail:status "Shipped" .

ex:C1 a retail:Customer ; retail:name "Naidu Random1" .
ex:C4 retail:name "Dana Random4" .
```

```turtle solution-data
@prefix retail: <https://example.org/retail/ontology#> .
@prefix ex:     <https://example.org/retail/data/> .
@prefix rdfs:   <http://www.w3.org/2000/01/rdf-schema#> .

# ---- Ontology ----
retail:placedBy rdfs:range retail:Customer .

# ---- Data ----
ex:ORD-0001 a retail:Order ; retail:placedBy ex:C1 ; retail:status "DELIVERED" .
ex:ORD-0007 a retail:Order ; retail:placedBy ex:C4 ; retail:status "PLACED" .
ex:ORD-0008 a retail:Order ; retail:placedBy ex:C1 ; retail:status "SHIPPED" .

ex:C1 a retail:Customer ; retail:name "Naidu Random1" .
ex:C4 a retail:Customer ; retail:name "Dana Random4" .
```
