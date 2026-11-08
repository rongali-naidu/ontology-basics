---
title: ASK and CONSTRUCT
section: SPARQL basics
---

# Other query forms

`SELECT` returns a table. SPARQL has two other forms you'll use often.

## ASK: yes or no

`ASK` returns `true` if the pattern matches at least once:

```sparql
PREFIX retail: <https://example.org/retail/ontology#>

# Did anyone pay less than the list price?
ASK {
  ?line retail:forProduct ?p ; retail:unitPrice ?paid .
  ?p retail:price ?list .
  FILTER(?paid < ?list)
}
```

`ASK` is how the **Check my answer** button tests some of your exercises.

## CONSTRUCT: build new triples

`CONSTRUCT` uses the matches to build a **new graph** from a template. That makes it great for reshaping data or publishing it in another vocabulary, such as schema.org:

```sparql
PREFIX retail: <https://example.org/retail/ontology#>
PREFIX schema: <https://schema.org/>

CONSTRUCT {
  ?p a schema:Product ;
     schema:name ?name ;
     schema:sku ?sku .
}
WHERE {
  ?p a retail:Product ; retail:name ?name ; retail:sku ?sku .
}
```

The results panel shows the triples that would be created. They aren't added to your data.

> **Coming up:** CONSTRUCT is also the basis of *rules*. A reasoner is basically "run CONSTRUCT rules until nothing new appears". Click **rules** above the data panel to see the ones this site uses.

## DESCRIBE

`DESCRIBE ex:C1` asks the engine for "everything useful about" a resource. What gets returned depends on the engine, so it's handy for exploring but not for precise work.

## Exercise

The ontology has a shortcut property `retail:purchased` that links a customer **directly** to the products they bought, skipping the order and the line. The data doesn't contain it yet.

Write a `CONSTRUCT` query that builds **`?customer retail:purchased ?product`** for every customer who placed an order that has a line for that product.

(In the OWL section you'll see how the ontology derives this automatically.)

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

CONSTRUCT {

}
WHERE {

}
```

```sparql solution
PREFIX retail: <https://example.org/retail/ontology#>

CONSTRUCT { ?customer retail:purchased ?product }
WHERE {
  ?order retail:placedBy ?customer ;
         retail:hasLine/retail:forProduct ?product .
}
```
