---
title: Inverse, transitive, chains
section: OWL
reasoning: owl
check_reasoning: owl
---

# Property characteristics

OWL lets you describe *how a property behaves*. Each characteristic is a rule the reasoner applies. Reasoning on this page is set to **RDFS + OWL RL**.

## owl:inverseOf

```turtle
retail:placedBy owl:inverseOf retail:placedOrder .
```

The data only says *order → placedBy → customer*. The inverse gives you *customer → placedOrder → order* for free, so you can query in either direction:

```sparql
PREFIX retail: <https://example.org/retail/ontology#>

SELECT ?customer ?order WHERE { ?customer retail:placedOrder ?order }
```

## owl:TransitiveProperty

If A is under B and B is under C, then A is under C:

```turtle
retail:subCategoryOf a owl:TransitiveProperty .
ex:SUB-LAPTOP retail:subCategoryOf ex:CAT-COMP .
ex:CAT-COMP   retail:subCategoryOf ex:FAM-ELEC .
```

```sparql
PREFIX retail: <https://example.org/retail/ontology#>
PREFIX ex:     <https://example.org/retail/data/>

SELECT ?ancestor WHERE { ex:SUB-LAPTOP retail:subCategoryOf ?ancestor }
```

Only one `subCategoryOf` triple is stored for Laptops, but you get both Computers and Electronics.

## owl:propertyChainAxiom: shortcuts through the graph

Remember the `CONSTRUCT` you wrote for `retail:purchased`? The ontology states it once, as a **chain**:

```turtle
retail:purchased owl:propertyChainAxiom
    ( retail:placedOrder retail:hasLine retail:forProduct ) .
```

*If a customer placed an order that has a line for a product, the customer purchased that product.* Notice it relies on `placedOrder`, which itself comes from the inverse.

```sparql
PREFIX retail: <https://example.org/retail/ontology#>

SELECT ?customer ?product WHERE { ?customer retail:purchased ?product }
```

Other characteristics include `owl:SymmetricProperty`, `owl:AsymmetricProperty`, `owl:ReflexiveProperty` and `owl:FunctionalProperty`, which you'll meet soon.

> Switch Reasoning to **Off** and run the queries again to see which answers depended on inference.

## Exercise

Add **one triple** declaring `retail:hasSubCategory` as the **inverse** of `retail:subCategoryOf`. Then the reasoner can work out that `ex:FAM-ELEC retail:hasSubCategory ex:SUB-LAPTOP`. That takes two steps, transitivity *and* inverse, even though no such triple is stored.

(`retail:hasSubCategory` isn't in the original ontology; you're extending it.)

```turtle data
@prefix retail: <https://example.org/retail/ontology#> .
@prefix ex:     <https://example.org/retail/data/> .
@prefix owl:    <http://www.w3.org/2002/07/owl#> .

# ---- Schema ----
retail:placedBy    a owl:ObjectProperty ; owl:inverseOf retail:placedOrder .
retail:placedOrder a owl:ObjectProperty .
retail:subCategoryOf  a owl:ObjectProperty , owl:TransitiveProperty .
retail:hasSubCategory a owl:ObjectProperty .
retail:purchased   a owl:ObjectProperty ;
    owl:propertyChainAxiom ( retail:placedOrder retail:hasLine retail:forProduct ) .

# ---- Data ----
ex:SUB-LAPTOP retail:subCategoryOf ex:CAT-COMP .
ex:SUB-KEYBD  retail:subCategoryOf ex:CAT-COMP .
ex:CAT-COMP   retail:subCategoryOf ex:FAM-ELEC .
ex:SUB-HEADPH retail:subCategoryOf ex:CAT-AUDIO .
ex:CAT-AUDIO  retail:subCategoryOf ex:FAM-ELEC .

ex:ORD-0001 retail:placedBy ex:C1 ; retail:hasLine ex:ORD-0001-1 , ex:ORD-0001-2 .
ex:ORD-0002 retail:placedBy ex:C2 ; retail:hasLine ex:ORD-0002-1 .
ex:ORD-0001-1 retail:forProduct ex:PRD-0001 .
ex:ORD-0001-2 retail:forProduct ex:PRD-0003 .
ex:ORD-0002-1 retail:forProduct ex:PRD-0004 .
```

```sparql query
PREFIX retail: <https://example.org/retail/ontology#>

SELECT ?parent ?child
WHERE { ?parent retail:hasSubCategory ?child }
```

```sparql check
PREFIX retail: <https://example.org/retail/ontology#>
PREFIX ex:     <https://example.org/retail/data/>
PREFIX owl:    <http://www.w3.org/2002/07/owl#>
ASK {
  { retail:hasSubCategory owl:inverseOf retail:subCategoryOf } UNION { retail:subCategoryOf owl:inverseOf retail:hasSubCategory }
  ex:FAM-ELEC retail:hasSubCategory ex:SUB-LAPTOP .
}
```

```turtle solution-data
@prefix retail: <https://example.org/retail/ontology#> .
@prefix ex:     <https://example.org/retail/data/> .
@prefix owl:    <http://www.w3.org/2002/07/owl#> .

# ---- Schema ----
retail:placedBy    a owl:ObjectProperty ; owl:inverseOf retail:placedOrder .
retail:placedOrder a owl:ObjectProperty .
retail:subCategoryOf  a owl:ObjectProperty , owl:TransitiveProperty .
retail:hasSubCategory a owl:ObjectProperty ; owl:inverseOf retail:subCategoryOf .
retail:purchased   a owl:ObjectProperty ;
    owl:propertyChainAxiom ( retail:placedOrder retail:hasLine retail:forProduct ) .

# ---- Data ----
ex:SUB-LAPTOP retail:subCategoryOf ex:CAT-COMP .
ex:SUB-KEYBD  retail:subCategoryOf ex:CAT-COMP .
ex:CAT-COMP   retail:subCategoryOf ex:FAM-ELEC .
ex:SUB-HEADPH retail:subCategoryOf ex:CAT-AUDIO .
ex:CAT-AUDIO  retail:subCategoryOf ex:FAM-ELEC .

ex:ORD-0001 retail:placedBy ex:C1 ; retail:hasLine ex:ORD-0001-1 , ex:ORD-0001-2 .
ex:ORD-0002 retail:placedBy ex:C2 ; retail:hasLine ex:ORD-0002-1 .
ex:ORD-0001-1 retail:forProduct ex:PRD-0001 .
ex:ORD-0001-2 retail:forProduct ex:PRD-0003 .
ex:ORD-0002-1 retail:forProduct ex:PRD-0004 .
```
