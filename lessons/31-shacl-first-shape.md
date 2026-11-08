---
title: Your first shape
section: SHACL
expect_focus: ex:PRD-0007 ex:PRD-0008 ex:PRD-0009
---

# SHACL: rules your data must follow

RDFS and OWL *infer*. **SHACL** (Shapes Constraint Language) *checks*. As the retail shapes file puts it:

> *OWL describes what is TRUE about the world (open-world: missing data is just unknown). SHACL describes what valid DATA must look like (closed-world checks).*

The playground now has a **Shapes** tab next to **Data**, and a **Validate ✓** button. Shapes are written in Turtle too.

## Anatomy of a shape

This is the start of the retail example's product shape:

```turtle
shape:ProductShape
    a sh:NodeShape ;
    sh:targetClass retail:Product ;       # which nodes to check: every Product
    sh:property [                         # a constraint on one property
        sh:path     retail:sku ;
        sh:datatype xsd:string ;
        sh:minCount 1 ;                   # at least one SKU
        sh:maxCount 1                     # at most one
    ] .
```

- A **node shape** picks its **focus nodes** with a target (`sh:targetClass`, `sh:targetNode`, `sh:targetSubjectsOf`, `sh:targetObjectsOf`).
- Each **property shape** describes the values reached by `sh:path`, using **constraints** like `sh:minCount`.
- Validating produces a **report**: one result per problem, with the focus node, path, offending value and message.

Look at the report in the results panel: `ex:PRD-0007` has no SKU. Open the **Data** tab, give it one (e.g. `retail:sku "MSE-01"`), and press **Validate ✓** again.

> **Severity:** results are `sh:Violation` by default. Add `sh:severity sh:Warning` (or `sh:Info`) to a shape for softer checks.

## Exercise

Every product must also have **exactly one `retail:price`**, of datatype **`xsd:decimal`**, and **greater than 0** (`sh:minExclusive 0`). Add a second `sh:property` block to `shape:ProductShape`, then validate.

To pass, the report must flag **exactly** `ex:PRD-0007` (no SKU), `ex:PRD-0008` (negative price) and `ex:PRD-0009` (no price). Leave the data as it is.

```turtle shapes
@prefix sh:     <http://www.w3.org/ns/shacl#> .
@prefix xsd:    <http://www.w3.org/2001/XMLSchema#> .
@prefix retail: <https://example.org/retail/ontology#> .
@prefix shape:  <https://example.org/retail/shapes#> .

shape:ProductShape
    a sh:NodeShape ;
    sh:targetClass retail:Product ;
    sh:property [
        sh:path     retail:sku ;
        sh:datatype xsd:string ;
        sh:minCount 1 ;
        sh:maxCount 1 ;
        sh:message  "A product needs exactly one SKU."
    ] .
```

```turtle data
@prefix retail: <https://example.org/retail/ontology#> .
@prefix ex:     <https://example.org/retail/data/> .

ex:PRD-0001 a retail:Product ; retail:name "Laptop Pro 14"  ; retail:sku "LAP-PRO-14" ; retail:price 1299.00 .
ex:PRD-0003 a retail:Product ; retail:name "USB-C Charger"  ; retail:sku "CHG-65W"    ; retail:price 29.99 .
ex:PRD-0007 a retail:Product ; retail:name "Wireless Mouse" ;                           retail:price 24.99 .
ex:PRD-0008 a retail:Product ; retail:name "Laptop Sleeve"  ; retail:sku "SLV-14"     ; retail:price -5.00 .
ex:PRD-0009 a retail:Product ; retail:name "HDMI Cable"     ; retail:sku "HDMI-2M" .

ex:BRAND-ExampleTech retail:name "ExampleTech" .   # not a Product, so not checked
```

```turtle solution-shapes
@prefix sh:     <http://www.w3.org/ns/shacl#> .
@prefix xsd:    <http://www.w3.org/2001/XMLSchema#> .
@prefix retail: <https://example.org/retail/ontology#> .
@prefix shape:  <https://example.org/retail/shapes#> .

shape:ProductShape
    a sh:NodeShape ;
    sh:targetClass retail:Product ;
    sh:property [
        sh:path     retail:sku ;
        sh:datatype xsd:string ;
        sh:minCount 1 ;
        sh:maxCount 1 ;
        sh:message  "A product needs exactly one SKU."
    ] ;
    sh:property [
        sh:path     retail:price ;
        sh:datatype xsd:decimal ;
        sh:minCount 1 ;
        sh:maxCount 1 ;
        sh:minExclusive 0 ;
        sh:message  "A product needs exactly one positive decimal price."
    ] .
```
