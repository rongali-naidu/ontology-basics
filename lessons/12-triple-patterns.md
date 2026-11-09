---
title: Subject, predicate, object patterns
section: SPARQL basics
---

# A variable in any position

A triple pattern has three positions, and **any of them can be a variable**. Which positions you fix and which you leave open decides what question you're asking. Here are all eight combinations, using the store. Press **Try** on each one.

| Pattern | Question | SQL feel |
|---|---|---|
| `?s ?p ?o` | everything | `SELECT *` from every table |
| `ex:C1 ?p ?o` | what do we know about C1? (outgoing) | one row, all columns |
| `?s ?p ex:C1` | what points **to** C1? (incoming) | every FK that references C1 |
| `?s retail:placedBy ?o` | all uses of one property | two columns of one table |
| `ex:ORD-0001 retail:status ?o` | look up a value | `SELECT status WHERE id = …` |
| `?s retail:status "SHIPPED"` | find things by value | `WHERE status = 'SHIPPED'` |
| `ex:ORD-0001 ?p ex:C1` | **how** are two things connected? | *(no easy SQL equivalent)* |
| `ex:ORD-0001 retail:placedBy ex:C1` | is this fact true? | `EXISTS` |

### Describe a thing: subject fixed

```sparql
PREFIX ex: <https://example.org/retail/data/>

SELECT ?p ?o WHERE { ex:C1 ?p ?o }
```

### Who points to it: object fixed

The orders C1 placed and the reviews C1 wrote:

```sparql
PREFIX ex: <https://example.org/retail/data/>

SELECT ?s ?p WHERE { ?s ?p ex:C1 }
```

### All uses of one property: predicate fixed

```sparql
PREFIX retail: <https://example.org/retail/ontology#>

SELECT ?order ?customer WHERE { ?order retail:placedBy ?customer }
```

### Find by value

```sparql
PREFIX retail: <https://example.org/retail/ontology#>

SELECT ?order WHERE { ?order retail:status "SHIPPED" }
```

### How are two things connected? Predicate open

```sparql
PREFIX ex: <https://example.org/retail/data/>

SELECT ?how WHERE { ex:ORD-0001 ?how ex:C1 }
```

### Is this fact true? Nothing open

```sparql
PREFIX retail: <https://example.org/retail/ontology#>
PREFIX ex:     <https://example.org/retail/data/>

ASK { ex:ORD-0001 retail:placedBy ex:C1 }
```

## Returning whole triples

With the predicate fixed, `?p` has nothing to bind to. `SELECT ?s ?p ?o WHERE { ?s retail:name ?o }` leaves the `?p` column empty. There are three ways to get **complete triples** that match a condition.

**Keep the predicate as a variable and restrict it.** Use `VALUES` for one or more allowed predicates:

```sparql
PREFIX retail: <https://example.org/retail/ontology#>

SELECT ?s ?p ?o
WHERE {
  VALUES ?p { retail:name retail:price }
  ?s ?p ?o .
}
```

**Fix the predicate and put it back into the result with `BIND`:**

```sparql
PREFIX retail: <https://example.org/retail/ontology#>

SELECT ?s ?p ?o
WHERE {
  ?s retail:name ?o .
  BIND(retail:name AS ?p)
}
```

**Ask for triples, not rows, with `CONSTRUCT`.** The result *is* a set of triples:

```sparql
PREFIX retail: <https://example.org/retail/ontology#>

CONSTRUCT { ?s retail:name ?o }
WHERE     { ?s retail:name ?o }
```

**Every triple about the things that match a condition:** find the subjects first, then take all their triples. Here that's everything about products under 100:

```sparql
PREFIX retail: <https://example.org/retail/ontology#>

SELECT ?s ?p ?o
WHERE {
  ?s a retail:Product ; retail:price ?price .
  FILTER(?price < 100)
  ?s ?p ?o .
}
ORDER BY ?s
```

The condition can test any position. `FILTER(isLiteral(?o))`, `FILTER(?p != rdf:type)` and `FILTER(STRSTARTS(STR(?p), "https://example.org/retail/"))` are all common.

## Exploring an unknown graph

A **variable predicate** is how you discover what's in a graph you've never seen. In SQL this would mean reading the database catalog; in SPARQL the schema is just more data.

Which properties are used, and how often?

```sparql
SELECT ?property (COUNT(*) AS ?uses)
WHERE { ?s ?property ?o }
GROUP BY ?property
ORDER BY DESC(?uses)
```

Which classes have instances, and how many?

```sparql
SELECT ?class (COUNT(?s) AS ?instances)
WHERE { ?s a ?class }
GROUP BY ?class
ORDER BY DESC(?instances)
```

Which properties does each class use? That's the "columns" of each "table":

```sparql
SELECT DISTINCT ?class ?property
WHERE { ?s a ?class ; ?property ?o }
ORDER BY ?class ?property
```

## Exercise

Find **everything that points to the product `ex:PRD-0002`** (Wireless Earbuds X): incoming links only. Return `?s ?p`. You should find the two order lines that sold it and the review written about it.

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
PREFIX ex: <https://example.org/retail/data/>

SELECT ?p ?o WHERE { ex:PRD-0002 ?p ?o }
```

```sparql solution
PREFIX ex: <https://example.org/retail/data/>

SELECT ?s ?p WHERE { ?s ?p ex:PRD-0002 }
```
