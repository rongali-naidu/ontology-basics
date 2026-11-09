---
title: Prefixes and IRIs in queries
section: SPARQL basics
---

# Prefixes and IRIs in queries

Every name in a SPARQL query is an **IRI**. Prefixes are just a shorthand for writing them. Most "my query returns nothing" problems come from getting an IRI slightly wrong, so this page is worth knowing well.

## 1. A query declares its own prefixes

The `@prefix` lines in your data **do not** carry over into queries. The query on the right uses `retail:`, `ex:` and `xsd:` without declaring them, so it fails. Look at the error in the results panel: the playground spots the missing prefixes and offers **Add them and run**. Try it.

```sparql
PREFIX retail: <https://example.org/retail/ontology#>
PREFIX ex:     <https://example.org/retail/data/>
PREFIX xsd:    <http://www.w3.org/2001/XMLSchema#>

SELECT ?order ?date
WHERE {
  ?order retail:placedBy ex:C1 ;
         retail:orderDate ?date .
}
```

**Turtle and SPARQL write prefixes differently.** Mixing them up is the most common first error:

| | Turtle (data) | SPARQL (queries) |
|---|---|---|
| syntax | `@prefix ex: <…> .` | `PREFIX ex: <…>` |
| `@` | yes | no |
| final dot | yes | no |

(Turtle 1.1 also accepts the SPARQL style, `PREFIX ex: <…>`, so that form works in both.)

Notice **`xsd:`** in the exercise below. You need it even though no data property is called `xsd:…`, because typed values like dates are written `"2026-09-15"^^xsd:date`.

## 2. You can skip prefixes and write full IRIs

```sparql
SELECT ?name
WHERE {
  ?p a <https://example.org/retail/ontology#Product> ;
     <https://example.org/retail/ontology#name> ?name .
}
```

It's longer, but it always works. That's handy when copying a single IRI from somewhere.

## 3. The prefix *name* doesn't matter, the IRI does

A prefix is a local nickname. This query calls the ontology `r:` and the data `d:`, and still matches data written with `retail:` and `ex:`:

```sparql
PREFIX r: <https://example.org/retail/ontology#>
PREFIX d: <https://example.org/retail/data/>

SELECT ?product WHERE { ?line r:forProduct ?product . ?order r:hasLine ?line ; r:placedBy d:C1 }
```

There's also the **empty prefix**, `PREFIX : <…>`, which lets you write `:Product`. And `a` never needs a prefix: it's built-in shorthand for `rdf:type`.

## 4. ⚠ A nearly-right IRI fails silently

This returns **zero rows, and no error**:

```sparql
PREFIX retail: <http://example.org/retail/ontology#>

SELECT ?p WHERE { ?p a retail:Product }
```

Can you spot why? It's `http` instead of `https`. Other classic mismatches are `#` vs `/` at the end, a missing trailing `/`, and capitalisation (`Product` vs `product`). To the database these are completely different names.

**When a query returns nothing, look at the real IRIs first:**

```sparql
SELECT DISTINCT ?type WHERE { ?s a ?type }
```

The playground also points out names in your query that don't occur anywhere in the data.

## Prefixes you'll see everywhere

| Prefix | IRI | Vocabulary |
|---|---|---|
| `rdf:` | `http://www.w3.org/1999/02/22-rdf-syntax-ns#` | RDF core (`rdf:type`) |
| `rdfs:` | `http://www.w3.org/2000/01/rdf-schema#` | RDF Schema |
| `owl:` | `http://www.w3.org/2002/07/owl#` | OWL |
| `xsd:` | `http://www.w3.org/2001/XMLSchema#` | datatypes |
| `skos:` | `http://www.w3.org/2004/02/skos/core#` | SKOS |
| `sh:` | `http://www.w3.org/ns/shacl#` | SHACL |
| `schema:` | `https://schema.org/` | schema.org (note: `https`) |
| `dcterms:` | `http://purl.org/dc/terms/` | Dublin Core metadata |
| `prov:` | `http://www.w3.org/ns/prov#` | provenance |

Look up any prefix at [prefix.cc](https://prefix.cc).

## Exercise

Fix the query on the right so it runs: it needs **three** prefixes. It should return the orders placed by `ex:C1` **on or after 15 September 2026**. You should get one order, `ex:ORD-0003`.

```turtle data
@prefix retail: <https://example.org/retail/ontology#> .
@prefix ex:     <https://example.org/retail/data/> .
@prefix xsd:    <http://www.w3.org/2001/XMLSchema#> .

# ---- Brands ----
ex:BRAND-ExampleTech  a retail:Brand ; retail:name "ExampleTech" .
ex:BRAND-ExamplePress a retail:Brand ; retail:name "ExamplePress" .
ex:BRAND-ExampleHome  a retail:Brand ; retail:name "ExampleHome" .

# ---- Merchandise hierarchy: family > category > sub-category ----
ex:FAM-ELEC   a retail:ProductFamily   ; retail:name "Electronics" .
ex:FAM-HOME   a retail:ProductFamily   ; retail:name "Home & Garden" .
ex:FAM-MEDIA  a retail:ProductFamily   ; retail:name "Media" .
ex:CAT-COMP   a retail:ProductCategory ; retail:name "Computers"      ; retail:subCategoryOf ex:FAM-ELEC .
ex:CAT-AUDIO  a retail:ProductCategory ; retail:name "Audio"          ; retail:subCategoryOf ex:FAM-ELEC .
ex:CAT-ACC    a retail:ProductCategory ; retail:name "Accessories"    ; retail:subCategoryOf ex:FAM-ELEC .
ex:CAT-KITCH  a retail:ProductCategory ; retail:name "Kitchen"        ; retail:subCategoryOf ex:FAM-HOME .
ex:CAT-BOOKS  a retail:ProductCategory ; retail:name "Books"          ; retail:subCategoryOf ex:FAM-MEDIA .
ex:SUB-LAPTOP a retail:SubCategory     ; retail:name "Laptops"        ; retail:subCategoryOf ex:CAT-COMP .
ex:SUB-KEYBD  a retail:SubCategory     ; retail:name "Keyboards"      ; retail:subCategoryOf ex:CAT-COMP .
ex:SUB-HEADPH a retail:SubCategory     ; retail:name "Headphones"     ; retail:subCategoryOf ex:CAT-AUDIO .
ex:SUB-CHARGE a retail:SubCategory     ; retail:name "Chargers"       ; retail:subCategoryOf ex:CAT-ACC .
ex:SUB-KNIVES a retail:SubCategory     ; retail:name "Kitchen Knives" ; retail:subCategoryOf ex:CAT-KITCH .
ex:SUB-PRINTB a retail:SubCategory     ; retail:name "Print Books"    ; retail:subCategoryOf ex:CAT-BOOKS .

# ---- Products ----
ex:PRD-0001 a retail:Product ; retail:name "Laptop Pro 14"        ; retail:sku "LAP-PRO-14" ; retail:price 1299.00 ; retail:brand ex:BRAND-ExampleTech  ; retail:inCategory ex:SUB-LAPTOP .
ex:PRD-0002 a retail:Product ; retail:name "Wireless Earbuds X"   ; retail:sku "EAR-X"      ; retail:price 149.99  ; retail:brand ex:BRAND-ExampleTech  ; retail:inCategory ex:SUB-HEADPH .
ex:PRD-0003 a retail:Product ; retail:name "USB-C Charger 65W"    ; retail:sku "CHG-65W"    ; retail:price 29.99   ; retail:brand ex:BRAND-ExampleTech  ; retail:inCategory ex:SUB-CHARGE .
ex:PRD-0004 a retail:Product ; retail:name "Knowledge Graphs 101" ; retail:sku "BK-KG101"   ; retail:price 49.99   ; retail:brand ex:BRAND-ExamplePress ; retail:inCategory ex:SUB-PRINTB .
ex:PRD-0005 a retail:Product ; retail:name "Chef Knife 8in"       ; retail:sku "KNF-8"      ; retail:price 79.50   ; retail:brand ex:BRAND-ExampleHome  ; retail:inCategory ex:SUB-KNIVES .
ex:PRD-0006 a retail:Product ; retail:name "Mechanical Keyboard"  ; retail:sku "KBD-MECH"   ; retail:price 89.00   ; retail:brand ex:BRAND-ExampleTech  ; retail:inCategory ex:SUB-KEYBD .

# ---- Customers, addresses, geography ----
ex:C1 a retail:PremiumCustomer ; retail:name "Naidu Random1" ; retail:email "naidu@example.com" ; retail:memberSince "2024-03-15"^^xsd:date ; retail:hasAddress ex:A1 .
ex:C2 a retail:Customer        ; retail:name "Bob Random2"   ; retail:email "bob@example.com"   ; retail:hasAddress ex:A2 .
ex:C3 a retail:PremiumCustomer ; retail:name "Carol Random3" ; retail:email "carol@example.com" ; retail:memberSince "2025-11-01"^^xsd:date ; retail:hasAddress ex:A3 .
ex:A1 a retail:Address ; retail:city "Sampleton" ; retail:postalCode "00001" ; retail:inState ex:US-CA .
ex:A2 a retail:Address ; retail:city "Demoville" ; retail:postalCode "00002" ; retail:inState ex:US-TX .
ex:A3 a retail:Address ; retail:city "Testburg"  ; retail:postalCode "00003" ; retail:inState ex:US-NY .
ex:US-CA a retail:State ; retail:name "California" ; retail:inCountry ex:US .
ex:US-TX a retail:State ; retail:name "Texas"      ; retail:inCountry ex:US .
ex:US-NY a retail:State ; retail:name "New York"   ; retail:inCountry ex:US .
ex:US    a retail:Country ; retail:name "United States of America" ; retail:salesRegion "AMER" .

# ---- Channels ----
ex:CH-WEB-US a retail:Channel ; retail:name "Example Web Store"  ; retail:channelType "Web" .
ex:CH-APP-US a retail:Channel ; retail:name "Example Mobile App" ; retail:channelType "App" .

# ---- Orders and order lines (revenue excludes CANCELLED and RETURNED) ----
ex:ORD-0001 a retail:Order ; retail:placedBy ex:C1 ; retail:orderDate "2026-09-01"^^xsd:date ; retail:shipDate "2026-09-02"^^xsd:date ; retail:deliveryDate "2026-09-04"^^xsd:date ; retail:status "DELIVERED" ; retail:paymentMethod "CARD"      ; retail:viaChannel ex:CH-WEB-US ; retail:hasLine ex:ORD-0001-1 , ex:ORD-0001-2 .
ex:ORD-0002 a retail:Order ; retail:placedBy ex:C2 ; retail:orderDate "2026-09-05"^^xsd:date ; retail:shipDate "2026-09-07"^^xsd:date ;                                            retail:status "SHIPPED"   ; retail:paymentMethod "PAYPAL"    ; retail:viaChannel ex:CH-APP-US ; retail:hasLine ex:ORD-0002-1 , ex:ORD-0002-2 .
ex:ORD-0003 a retail:Order ; retail:placedBy ex:C1 ; retail:orderDate "2026-09-20"^^xsd:date ; retail:shipDate "2026-09-21"^^xsd:date ; retail:deliveryDate "2026-09-23"^^xsd:date ; retail:status "DELIVERED" ; retail:paymentMethod "CARD"      ; retail:viaChannel ex:CH-WEB-US ; retail:hasLine ex:ORD-0003-1 .
ex:ORD-0004 a retail:Order ; retail:placedBy ex:C3 ; retail:orderDate "2026-10-02"^^xsd:date ;                                                                                    retail:status "PLACED"    ; retail:paymentMethod "GIFT_CARD" ; retail:viaChannel ex:CH-WEB-US ; retail:hasLine ex:ORD-0004-1 , ex:ORD-0004-2 .
ex:ORD-0005 a retail:Order ; retail:placedBy ex:C3 ; retail:orderDate "2026-10-05"^^xsd:date ;                                                                                    retail:status "CANCELLED" ; retail:paymentMethod "CARD"      ; retail:viaChannel ex:CH-APP-US ; retail:hasLine ex:ORD-0005-1 .
ex:ORD-0006 a retail:Order ; retail:placedBy ex:C2 ; retail:orderDate "2026-09-10"^^xsd:date ; retail:shipDate "2026-09-11"^^xsd:date ; retail:deliveryDate "2026-09-14"^^xsd:date ; retail:status "RETURNED"  ; retail:paymentMethod "PAYPAL"    ; retail:viaChannel ex:CH-WEB-US ; retail:hasLine ex:ORD-0006-1 .

ex:ORD-0001-1 a retail:OrderLine ; retail:forProduct ex:PRD-0001 ; retail:quantity 1 ; retail:unitPrice 1299.00 .
ex:ORD-0001-2 a retail:OrderLine ; retail:forProduct ex:PRD-0003 ; retail:quantity 2 ; retail:unitPrice 29.99 .
ex:ORD-0002-1 a retail:OrderLine ; retail:forProduct ex:PRD-0004 ; retail:quantity 1 ; retail:unitPrice 49.99 .
ex:ORD-0002-2 a retail:OrderLine ; retail:forProduct ex:PRD-0002 ; retail:quantity 1 ; retail:unitPrice 149.99 .
ex:ORD-0003-1 a retail:OrderLine ; retail:forProduct ex:PRD-0002 ; retail:quantity 1 ; retail:unitPrice 139.99 .   # paid below list price
ex:ORD-0004-1 a retail:OrderLine ; retail:forProduct ex:PRD-0005 ; retail:quantity 1 ; retail:unitPrice 79.50 .
ex:ORD-0004-2 a retail:OrderLine ; retail:forProduct ex:PRD-0004 ; retail:quantity 2 ; retail:unitPrice 49.99 .
ex:ORD-0005-1 a retail:OrderLine ; retail:forProduct ex:PRD-0004 ; retail:quantity 1 ; retail:unitPrice 49.99 .
ex:ORD-0006-1 a retail:OrderLine ; retail:forProduct ex:PRD-0005 ; retail:quantity 1 ; retail:unitPrice 79.50 .

# ---- Reviews ----
ex:R1 a retail:Review ; retail:writtenBy ex:C1 ; retail:reviewOf ex:PRD-0001 ; retail:rating 5 ; retail:reviewText "Fast and light." .
ex:R2 a retail:Review ; retail:writtenBy ex:C2 ; retail:reviewOf ex:PRD-0004 ; retail:rating 4 ; retail:reviewText "Great intro to graphs." .
ex:R3 a retail:Review ; retail:writtenBy ex:C1 ; retail:reviewOf ex:PRD-0002 ; retail:rating 3 ; retail:reviewText "Good sound, weak battery." .
ex:R4 a retail:Review ; retail:writtenBy ex:C3 ; retail:reviewOf ex:PRD-0004 ; retail:rating 5 ; retail:reviewText "Clear and practical." .
```

```sparql query
SELECT ?order ?date
WHERE {
  ?order retail:placedBy ex:C1 ;
         retail:orderDate ?date .
  FILTER(?date >= "2026-09-15"^^xsd:date)
}
```

```sparql solution
PREFIX retail: <https://example.org/retail/ontology#>
PREFIX ex:     <https://example.org/retail/data/>
PREFIX xsd:    <http://www.w3.org/2001/XMLSchema#>

SELECT ?order ?date
WHERE {
  ?order retail:placedBy ex:C1 ;
         retail:orderDate ?date .
  FILTER(?date >= "2026-09-15"^^xsd:date)
}
```
