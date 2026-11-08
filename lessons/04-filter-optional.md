---
title: FILTER and OPTIONAL
section: SPARQL basics
---

# Narrowing down and filling gaps

## FILTER keeps rows that pass a test

```sparql
PREFIX retail: <https://example.org/retail/ontology#>

SELECT ?name ?price
WHERE {
  ?p a retail:Product ; retail:name ?name ; retail:price ?price .
  FILTER(?price < 100)
}
```

Useful things inside `FILTER`:

| Expression | Meaning |
|---|---|
| `?x > 5 && ?x <= 10` | comparisons with *and*; `\|\|` is *or*, `!` is *not* |
| `?a != ?b` | not equal |
| `?s IN ("CANCELLED", "RETURNED")` | one of a list (`NOT IN` too) |
| `CONTAINS(?name, "Laptop")` | text contains |
| `REGEX(?name, "^usb", "i")` | regular expression (`"i"` = ignore case) |
| `?d >= "2026-10-01"^^xsd:date` | dates compare too |
| `BOUND(?x)` | does the variable have a value? |

## OPTIONAL: "if it exists"

In a normal pattern, **every** triple must match. Orders that haven't been delivered vanish here:

```sparql
PREFIX retail: <https://example.org/retail/ontology#>

SELECT ?order ?status ?delivered
WHERE { ?order retail:status ?status ; retail:deliveryDate ?delivered . }
```

Wrap the uncertain part in `OPTIONAL { … }` to keep the row and leave the variable empty:

```sparql
PREFIX retail: <https://example.org/retail/ontology#>

SELECT ?order ?status ?delivered
WHERE {
  ?order a retail:Order ; retail:status ?status .
  OPTIONAL { ?order retail:deliveryDate ?delivered }
}
```

## FILTER NOT EXISTS: "this doesn't exist"

Customers **without** a premium membership date:

```sparql
PREFIX retail: <https://example.org/retail/ontology#>

SELECT ?name
WHERE {
  ?c retail:email ?e ; retail:name ?name .
  FILTER NOT EXISTS { ?c retail:memberSince ?since }
}
```

## Exercise

List the **order, status and delivery date** of every order that is **not `"CANCELLED"`**. Include orders that have **no delivery date** yet. Return `?order ?status ?delivered`.

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
PREFIX retail: <https://example.org/retail/ontology#>

SELECT ?order ?status ?delivered
WHERE {
  ?order a retail:Order ; retail:status ?status .

}
```

```sparql solution
PREFIX retail: <https://example.org/retail/ontology#>

SELECT ?order ?status ?delivered
WHERE {
  ?order a retail:Order ; retail:status ?status .
  OPTIONAL { ?order retail:deliveryDate ?delivered }
  FILTER(?status != "CANCELLED")
}
```
