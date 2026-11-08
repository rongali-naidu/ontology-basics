---
title: Broader, narrower, mappings
section: SKOS
reasoning: none
---

# Hierarchies and links between taxonomies

The store has **two** product taxonomies, and on the right you can see parts of both:

- its own **merchandise hierarchy**: balanced, exactly three levels (family › category › sub-category), with codes like `FAM-ELEC`;
- the **Google Product Taxonomy**, which Google Shopping requires: ragged (Laptops is 3 levels deep, Headphones 5), with numeric IDs.

## broader and narrower

SKOS hierarchies use `skos:broader` ("is more specific than") and its inverse `skos:narrower`:

```turtle
ex:GPT-328 skos:prefLabel "Laptops"@en ;   skos:broader ex:GPT-278 .
ex:GPT-278 skos:prefLabel "Computers"@en ; skos:broader ex:GPT-222 .
```

The arrow points **up**: Laptops → Computers → Electronics. This is *not* `rdfs:subClassOf`, so no instance inference happens. It just says one concept is more general than the other.

`skos:broader` is deliberately **not** transitive. To walk the whole tree, use a property path. This lists the full Google path above Headphones:

```sparql
PREFIX skos: <http://www.w3.org/2004/02/skos/core#>
PREFIX ex:   <https://example.org/retail/data/>

SELECT ?ancestor ?label
WHERE { ex:GPT-543626 skos:broader+ ?ancestor . ?ancestor skos:prefLabel ?label }
```

## Your own hierarchy *is* SKOS too

The retail ontology defines its hierarchy property as a specialisation of SKOS:

```turtle
retail:subCategoryOf rdfs:subPropertyOf skos:broader .
```

So any SKOS tool understands the merchandise hierarchy. Switch Reasoning to **RDFS** and try:

```sparql
PREFIX skos: <http://www.w3.org/2004/02/skos/core#>
PREFIX ex:   <https://example.org/retail/data/>

SELECT ?child WHERE { ?child skos:broader ex:FAM-ELEC }
```

## Mapping between schemes

`skos:exactMatch` aligns each of the store's sub-categories with a Google category:

| Property | Meaning |
|---|---|
| `skos:exactMatch` | interchangeable in practice |
| `skos:closeMatch` | similar enough for some uses |
| `skos:broadMatch` / `skos:narrowMatch` | more general / more specific concept in another scheme |
| `skos:relatedMatch` | associated |

These are the *safe* alternative to `owl:sameAs`, which you learned can leak facts. `exactMatch` makes no logical claim that the two concepts are identical things.

## Exercise

For every **product**, return its **name** and the **`skos:prefLabel` of the Google category** its sub-category is mapped to. Return `?product ?google`.

*Hint:* product → `retail:inCategory` → `skos:exactMatch` → `skos:prefLabel`. One property path does it.

```turtle data
@prefix retail: <https://example.org/retail/ontology#> .
@prefix ex:     <https://example.org/retail/data/> .
@prefix skos:   <http://www.w3.org/2004/02/skos/core#> .
@prefix rdfs:   <http://www.w3.org/2000/01/rdf-schema#> .

retail:subCategoryOf rdfs:subPropertyOf skos:broader .

# ---- The store's merchandise hierarchy (balanced, 3 levels) ----
ex:MerchandiseHierarchy a skos:ConceptScheme ; skos:hasTopConcept ex:FAM-ELEC , ex:FAM-HOME , ex:FAM-MEDIA .
ex:FAM-ELEC   skos:prefLabel "Electronics"@en ;    skos:notation "FAM-ELEC" .
ex:FAM-HOME   skos:prefLabel "Home & Garden"@en ;  skos:notation "FAM-HOME" .
ex:FAM-MEDIA  skos:prefLabel "Media"@en ;          skos:notation "FAM-MEDIA" .
ex:CAT-COMP   skos:prefLabel "Computers"@en ;      retail:subCategoryOf ex:FAM-ELEC .
ex:CAT-AUDIO  skos:prefLabel "Audio"@en ;          retail:subCategoryOf ex:FAM-ELEC .
ex:CAT-ACC    skos:prefLabel "Accessories"@en ;    retail:subCategoryOf ex:FAM-ELEC .
ex:CAT-KITCH  skos:prefLabel "Kitchen"@en ;        retail:subCategoryOf ex:FAM-HOME .
ex:CAT-BOOKS  skos:prefLabel "Books"@en ;          retail:subCategoryOf ex:FAM-MEDIA .
ex:SUB-LAPTOP skos:prefLabel "Laptops"@en ;        retail:subCategoryOf ex:CAT-COMP  ; skos:exactMatch ex:GPT-328 .
ex:SUB-KEYBD  skos:prefLabel "Keyboards"@en ;      retail:subCategoryOf ex:CAT-COMP  ; skos:exactMatch ex:GPT-303 .
ex:SUB-HEADPH skos:prefLabel "Headphones"@en ;     retail:subCategoryOf ex:CAT-AUDIO ; skos:exactMatch ex:GPT-543626 .
ex:SUB-CHARGE skos:prefLabel "Chargers"@en ;       retail:subCategoryOf ex:CAT-ACC   ; skos:exactMatch ex:GPT-505295 .
ex:SUB-KNIVES skos:prefLabel "Kitchen Knives"@en ; retail:subCategoryOf ex:CAT-KITCH ; skos:exactMatch ex:GPT-665 .
ex:SUB-PRINTB skos:prefLabel "Print Books"@en ;    retail:subCategoryOf ex:CAT-BOOKS ; skos:exactMatch ex:GPT-543543 .

# ---- Google Product Taxonomy (ragged, 3-5 levels) ----
ex:GoogleProductTaxonomy a skos:ConceptScheme ; skos:hasTopConcept ex:GPT-222 , ex:GPT-536 , ex:GPT-783 .
ex:GPT-222    skos:prefLabel "Electronics"@en ;               skos:notation "222" .
ex:GPT-223    skos:prefLabel "Audio"@en ;                     skos:notation "223"    ; skos:broader ex:GPT-222 .
ex:GPT-2165   skos:prefLabel "Audio Components"@en ;          skos:notation "2165"   ; skos:broader ex:GPT-223 .
ex:GPT-505771 skos:prefLabel "Headphones & Headsets"@en ;     skos:notation "505771" ; skos:broader ex:GPT-2165 .
ex:GPT-543626 skos:prefLabel "Headphones"@en ;                skos:notation "543626" ; skos:broader ex:GPT-505771 .
ex:GPT-278    skos:prefLabel "Computers"@en ;                 skos:notation "278"    ; skos:broader ex:GPT-222 .
ex:GPT-328    skos:prefLabel "Laptops"@en ;                   skos:notation "328"    ; skos:broader ex:GPT-278 .
ex:GPT-2082   skos:prefLabel "Electronics Accessories"@en ;   skos:notation "2082"   ; skos:broader ex:GPT-222 .
ex:GPT-285    skos:prefLabel "Computer Components"@en ;       skos:notation "285"    ; skos:broader ex:GPT-2082 .
ex:GPT-1928   skos:prefLabel "Input Devices"@en ;             skos:notation "1928"   ; skos:broader ex:GPT-285 .
ex:GPT-303    skos:prefLabel "Keyboards"@en ;                 skos:notation "303"    ; skos:broader ex:GPT-1928 .
ex:GPT-275    skos:prefLabel "Power"@en ;                     skos:notation "275"    ; skos:broader ex:GPT-2082 .
ex:GPT-505295 skos:prefLabel "Power Adapters & Chargers"@en ; skos:notation "505295" ; skos:broader ex:GPT-275 .
ex:GPT-536    skos:prefLabel "Home & Garden"@en ;             skos:notation "536" .
ex:GPT-638    skos:prefLabel "Kitchen & Dining"@en ;          skos:notation "638"    ; skos:broader ex:GPT-536 .
ex:GPT-668    skos:prefLabel "Kitchen Tools & Utensils"@en ;  skos:notation "668"    ; skos:broader ex:GPT-638 .
ex:GPT-665    skos:prefLabel "Kitchen Knives"@en ;            skos:notation "665"    ; skos:broader ex:GPT-668 .
ex:GPT-783    skos:prefLabel "Media"@en ;                     skos:notation "783" .
ex:GPT-784    skos:prefLabel "Books"@en ;                     skos:notation "784"    ; skos:broader ex:GPT-783 .
ex:GPT-543543 skos:prefLabel "Print Books"@en ;               skos:notation "543543" ; skos:broader ex:GPT-784 .

# ---- Products ----
ex:PRD-0001 retail:name "Laptop Pro 14"        ; retail:inCategory ex:SUB-LAPTOP .
ex:PRD-0002 retail:name "Wireless Earbuds X"   ; retail:inCategory ex:SUB-HEADPH .
ex:PRD-0003 retail:name "USB-C Charger 65W"    ; retail:inCategory ex:SUB-CHARGE .
ex:PRD-0004 retail:name "Knowledge Graphs 101" ; retail:inCategory ex:SUB-PRINTB .
ex:PRD-0005 retail:name "Chef Knife 8in"       ; retail:inCategory ex:SUB-KNIVES .
ex:PRD-0006 retail:name "Mechanical Keyboard"  ; retail:inCategory ex:SUB-KEYBD .
```

```sparql query
PREFIX skos: <http://www.w3.org/2004/02/skos/core#>

SELECT ?ours ?google ?googleId
WHERE {
  ?s skos:exactMatch ?g .
  ?s skos:prefLabel ?ours .
  ?g skos:prefLabel ?google ; skos:notation ?googleId .
}
```

```sparql solution
PREFIX retail: <https://example.org/retail/ontology#>
PREFIX skos:   <http://www.w3.org/2004/02/skos/core#>

SELECT ?product ?google
WHERE {
  ?p retail:name ?product ;
     retail:inCategory/skos:exactMatch/skos:prefLabel ?google .
}
```
