---
title: Labels, and reasoning with paths
section: RDFS
reasoning: none
---

# Documenting a vocabulary, and querying it without a reasoner

## Labels and definitions

A good vocabulary is readable by **people** too. Every class and property in the retail ontology carries annotations:

| Property | Use |
|---|---|
| `rdfs:label` | a human-readable name, often in several languages |
| `skos:definition` / `rdfs:comment` | a description or definition |
| `rdfs:seeAlso` | a link to more information |
| `rdfs:isDefinedBy` | the vocabulary a term belongs to |

```sparql
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
PREFIX skos: <http://www.w3.org/2004/02/skos/core#>

SELECT ?term ?label ?definition
WHERE {
  ?term rdfs:label ?label .
  OPTIONAL { ?term skos:definition ?definition }
  FILTER(LANG(?label) = "en")
}
```

Change `"en"` to `"es"` to get the Spanish labels. (The original ontology is English-only; the Spanish ones were added for this lesson.)

## Reasoning with property paths

Many databases don't run a reasoner. You can still get *subclass* inference by writing it into the query with a property path:

```sparql
PREFIX retail: <https://example.org/retail/ontology#>
PREFIX rdfs:   <http://www.w3.org/2000/01/rdf-schema#>

SELECT ?thing ?name
WHERE { ?thing a/rdfs:subClassOf* retail:Category ; retail:name ?name }
```

Read `a/rdfs:subClassOf*` as: *"has a type, which is the class itself or any number of `subClassOf` steps below it."* The `*` includes **zero** steps, so things typed directly as `retail:Category` would match too.

Reasoning is **Off** on this page, and the query still finds every family, category and sub-category.

| Approach | Pros | Cons |
|---|---|---|
| **Reasoner** (materialise triples) | Simple queries; consistent everywhere | Extra storage; must re-run after changes |
| **Query rewriting** (paths) | No extra data; always up to date | Every query must remember to do it |

## Exercise

With reasoning **off**, list every **`retail:Party`** (premium customers included) with its **`retail:name`**. Return `?party ?name`.

```turtle data
@prefix retail: <https://example.org/retail/ontology#> .
@prefix ex:     <https://example.org/retail/data/> .
@prefix rdfs:   <http://www.w3.org/2000/01/rdf-schema#> .
@prefix owl:    <http://www.w3.org/2002/07/owl#> .
@prefix skos:   <http://www.w3.org/2004/02/skos/core#> .

# ---- Schema, with labels ----
retail:Party a owl:Class ;
    rdfs:label "Party"@en , "Parte"@es ;
    skos:definition "Any person or organization that takes part in a retail transaction."@en .
retail:Customer a owl:Class ; rdfs:subClassOf retail:Party ;
    rdfs:label "Customer"@en , "Cliente"@es ;
    skos:definition "A person with an account who can place orders and write reviews."@en .
retail:PremiumCustomer a owl:Class ; rdfs:subClassOf retail:Customer ;
    rdfs:label "Premium customer"@en , "Cliente prémium"@es ;
    skos:definition "A customer with a paid membership (free shipping, etc.)."@en .
retail:Category a owl:Class ; rdfs:subClassOf skos:Concept ;
    rdfs:label "Merchandise category"@en , "Categoría de mercancía"@es .
retail:ProductFamily a owl:Class ; rdfs:subClassOf retail:Category ;
    rdfs:label "Product family"@en , "Familia de productos"@es .
retail:ProductCategory a owl:Class ; rdfs:subClassOf retail:Category ;
    rdfs:label "Product category"@en , "Categoría de producto"@es .
retail:SubCategory a owl:Class ; rdfs:subClassOf retail:Category ;
    rdfs:label "Sub-category"@en , "Subcategoría"@es .

# ---- Instances ----
ex:C1 a retail:PremiumCustomer ; retail:name "Naidu Random1" .
ex:C2 a retail:Customer        ; retail:name "Bob Random2" .
ex:C3 a retail:PremiumCustomer ; retail:name "Carol Random3" .

ex:FAM-ELEC   a retail:ProductFamily   ; retail:name "Electronics" .
ex:FAM-MEDIA  a retail:ProductFamily   ; retail:name "Media" .
ex:CAT-COMP   a retail:ProductCategory ; retail:name "Computers" .
ex:CAT-BOOKS  a retail:ProductCategory ; retail:name "Books" .
ex:SUB-LAPTOP a retail:SubCategory     ; retail:name "Laptops" .
ex:SUB-PRINTB a retail:SubCategory     ; retail:name "Print Books" .
```

```sparql query
PREFIX retail: <https://example.org/retail/ontology#>
PREFIX rdfs:   <http://www.w3.org/2000/01/rdf-schema#>

SELECT ?thing ?name
WHERE { ?thing a/rdfs:subClassOf* retail:Category ; retail:name ?name }
```

```sparql solution
PREFIX retail: <https://example.org/retail/ontology#>
PREFIX rdfs:   <http://www.w3.org/2000/01/rdf-schema#>

SELECT ?party ?name
WHERE { ?party a/rdfs:subClassOf* retail:Party ; retail:name ?name }
```
