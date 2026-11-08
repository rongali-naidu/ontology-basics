---
title: Checking links between nodes
section: SHACL
expect_focus: ex:SUB-TABLET ex:PRD-0010 ex:PRD-0011
---

# Shapes that follow links

Real data is a graph, so constraints often care about **what a link points to**. The retail shapes use this to keep the merchandise hierarchy balanced.

## sh:class: the value must be an instance of a class

```turtle
shape:SubCategoryShape a sh:NodeShape ;
    sh:targetClass retail:SubCategory ;
    sh:property [ sh:path retail:subCategoryOf ;
                  sh:class retail:ProductCategory ; sh:minCount 1 ; sh:maxCount 1 ;
                  sh:message "A sub-category's parent must be one category." ] .
```

*A sub-category's parent must sit exactly one level up.* The value must have `rdf:type retail:ProductCategory`, either directly or through `rdfs:subClassOf` triples in the data graph. That's the only "reasoning" SHACL does by itself.

Validate now: `ex:SUB-TABLET` hangs directly under the family *Electronics*, skipping a level, and is flagged.

## sh:node: the value must conform to another shape

Shapes can reuse each other:

```turtle
shape:OrderShape sh:property [ sh:path retail:placedBy ; sh:node shape:CustomerShape ] .
```

## Logic and paths

- `sh:or`, `sh:and`, `sh:not` and `sh:xone` combine shapes.
- `sh:path` accepts paths too: `( retail:hasLine retail:forProduct )` follows two steps, `[ sh:inversePath retail:placedBy ]` goes backwards (customer → their orders), and `[ sh:zeroOrMorePath skos:broader ]` walks a hierarchy.
- `sh:closed true` rejects any property the shape doesn't mention.

## Exercise

Add the retail example's rule for products: every `retail:Product` is assigned to **exactly one** category (`retail:inCategory`), and it must be a **`retail:SubCategory`**, the lowest level.

The report should then flag exactly **`ex:SUB-TABLET`** (skips a level), **`ex:PRD-0010`** (assigned to a *category*, not a sub-category) and **`ex:PRD-0011`** (two sub-categories).

```turtle shapes
@prefix sh:     <http://www.w3.org/ns/shacl#> .
@prefix retail: <https://example.org/retail/ontology#> .
@prefix shape:  <https://example.org/retail/shapes#> .

shape:SubCategoryShape a sh:NodeShape ;
    sh:targetClass retail:SubCategory ;
    sh:property [ sh:path retail:subCategoryOf ;
                  sh:class retail:ProductCategory ; sh:minCount 1 ; sh:maxCount 1 ;
                  sh:message "A sub-category's parent must be one category." ] .
```

```turtle data
@prefix retail: <https://example.org/retail/ontology#> .
@prefix ex:     <https://example.org/retail/data/> .

ex:FAM-ELEC   a retail:ProductFamily .
ex:CAT-COMP   a retail:ProductCategory ; retail:subCategoryOf ex:FAM-ELEC .
ex:SUB-LAPTOP a retail:SubCategory     ; retail:subCategoryOf ex:CAT-COMP .
ex:SUB-KEYBD  a retail:SubCategory     ; retail:subCategoryOf ex:CAT-COMP .
ex:SUB-TABLET a retail:SubCategory     ; retail:subCategoryOf ex:FAM-ELEC .    # skips a level

ex:PRD-0001 a retail:Product ; retail:name "Laptop Pro 14"       ; retail:inCategory ex:SUB-LAPTOP .
ex:PRD-0006 a retail:Product ; retail:name "Mechanical Keyboard" ; retail:inCategory ex:SUB-KEYBD .
ex:PRD-0010 a retail:Product ; retail:name "Desktop Tower"       ; retail:inCategory ex:CAT-COMP .
ex:PRD-0011 a retail:Product ; retail:name "Laptop + Keyboard Bundle" ;
            retail:inCategory ex:SUB-LAPTOP , ex:SUB-KEYBD .
```

```turtle solution-shapes
@prefix sh:     <http://www.w3.org/ns/shacl#> .
@prefix retail: <https://example.org/retail/ontology#> .
@prefix shape:  <https://example.org/retail/shapes#> .

shape:SubCategoryShape a sh:NodeShape ;
    sh:targetClass retail:SubCategory ;
    sh:property [ sh:path retail:subCategoryOf ;
                  sh:class retail:ProductCategory ; sh:minCount 1 ; sh:maxCount 1 ;
                  sh:message "A sub-category's parent must be one category." ] .

shape:ProductShape a sh:NodeShape ;
    sh:targetClass retail:Product ;
    sh:property [ sh:path retail:inCategory ;
                  sh:class retail:SubCategory ; sh:minCount 1 ; sh:maxCount 1 ;
                  sh:message "A product is assigned to exactly one sub-category (the lowest level)." ] .
```
