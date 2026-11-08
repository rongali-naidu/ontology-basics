---
title: Capstone, and what's next
section: Wrap-up
reasoning: owl
check_reasoning: owl
tab: data
start: query
---

# Putting it all together

The data on the right is the whole store again, now with the key parts of the **retail ontology** at the bottom. It uses **everything** from this course:

- **RDFS:** class hierarchies, plus domains and ranges
- **OWL:** the inverse `placedBy`/`placedOrder`, the transitive `subCategoryOf`, the `purchased` property chain, `AllDisjointClasses`, and the defined classes `DeliveredOrder`, `NonRevenueOrder` and `LaptopBuyer`
- **SKOS:** the merchandise hierarchy is a specialisation of `skos:broader`
- **SHACL:** the retail shapes for customers and products (Shapes tab)

Reasoning is on (**RDFS + OWL RL**). Explore with the queries below.

Who bought a laptop? Nobody is *tagged* as a laptop buyer:

```sparql
PREFIX retail: <https://example.org/retail/ontology#>

SELECT ?c ?name WHERE { ?c a retail:LaptopBuyer ; retail:name ?name }
```

Which orders don't count as revenue, and why?

```sparql
PREFIX retail: <https://example.org/retail/ontology#>

SELECT ?order ?status WHERE { ?order a retail:NonRevenueOrder ; retail:status ?status }
```

What did each customer purchase? This uses the property chain:

```sparql
PREFIX retail: <https://example.org/retail/ontology#>

SELECT ?name (GROUP_CONCAT(?product; separator=", ") AS ?purchased)
WHERE { ?c retail:purchased/retail:name ?product ; retail:name ?name }
GROUP BY ?name
```

To check the data quality, switch Reasoning to **RDFS** (as the retail example does) and press **Validate ✓**.

## Final exercise

Compute **revenue per product family** (Electronics, Home & Garden, Media). Return the family's `retail:name` as `?family` and the revenue.

- Revenue is quantity × price paid on order lines.
- Leave out orders that are **`retail:NonRevenueOrder`**. Use the defined class instead of listing statuses!
- Walk from the product's sub-category up to its family.

The three numbers should add up to the store's total revenue, **1878.43**.

## Where to go next

- **The full retail example:** [semantics-ontology-graphs/examples/retail](https://github.com/rongali-naidu/semantics-ontology-graphs/tree/main/examples/retail). It has the complete ontology, taxonomies, glossary and shapes from this course, plus the SQL warehouse, R2RML mapping, a semantic model and a context graph that links business words to columns and lineage.
- **Protégé** (protege.stanford.edu): the classic free editor for OWL ontologies, with full DL reasoners.
- **W3C specs:** [RDF 1.1 Primer](https://www.w3.org/TR/rdf11-primer/), [SPARQL 1.1 Query](https://www.w3.org/TR/sparql11-query/), [OWL 2 Primer](https://www.w3.org/TR/owl2-primer/), [SKOS Primer](https://www.w3.org/TR/skos-primer/), [SHACL](https://www.w3.org/TR/shacl/).
- **Real data to query:** the [Wikidata Query Service](https://query.wikidata.org/) is the largest public SPARQL endpoint.
- **Triple stores:** Oxigraph (which powers this site), Apache Jena Fuseki, GraphDB, Stardog, Amazon Neptune.
- **Vocabularies to reuse:** schema.org (which the retail ontology aligns to), Dublin Core, FOAF, PROV-O. Reuse before you invent!

## References

- Natalya F. Noy and Deborah L. McGuinness, [*Ontology Development 101: A Guide to Creating Your First Ontology*](https://protege.stanford.edu/publications/ontology_development/ontology101.pdf), Stanford Knowledge Systems Laboratory, 2001. The source of the ontology-concepts section's definitions and seven development steps.
- [semantics-ontology-graphs: retail example](https://github.com/rongali-naidu/semantics-ontology-graphs/tree/main/examples/retail): the store, ontology, taxonomies, glossary, shapes, SQL and Cypher versions used throughout.
- W3C: [RDF 1.1 Concepts](https://www.w3.org/TR/rdf11-concepts/), [Turtle](https://www.w3.org/TR/turtle/), [TriG](https://www.w3.org/TR/trig/), [JSON-LD 1.1](https://www.w3.org/TR/json-ld11/), [SPARQL 1.1 Query](https://www.w3.org/TR/sparql11-query/), [SPARQL 1.1 Update](https://www.w3.org/TR/sparql11-update/), [RDF Schema](https://www.w3.org/TR/rdf-schema/), [OWL 2 Primer](https://www.w3.org/TR/owl2-primer/), [OWL 2 RL rules](https://www.w3.org/TR/owl2-profiles/#OWL_2_RL), [SKOS Reference](https://www.w3.org/TR/skos-reference/), [SHACL](https://www.w3.org/TR/shacl/).
- [Oxigraph](https://github.com/oxigraph/oxigraph), the RDF database running this playground, and [openCypher](https://opencypher.org) for the property-graph comparison.

Thanks for learning. Now model something you care about. 🎓

```turtle shapes
@prefix sh:     <http://www.w3.org/ns/shacl#> .
@prefix xsd:    <http://www.w3.org/2001/XMLSchema#> .
@prefix retail: <https://example.org/retail/ontology#> .
@prefix shape:  <https://example.org/retail/shapes#> .

shape:CustomerShape a sh:NodeShape ;
    sh:targetClass retail:Customer ;          # also hits PremiumCustomer
    sh:property [ sh:path retail:name ; sh:datatype xsd:string ; sh:minCount 1 ; sh:maxCount 1 ] ;
    sh:property [ sh:path retail:email ; sh:datatype xsd:string ; sh:minCount 1 ; sh:maxCount 1 ;
                  sh:pattern "^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$" ;
                  sh:message "Customer needs exactly one well-formed email." ] ;
    sh:property [ sh:path retail:hasAddress ; sh:class retail:Address ; sh:minCount 1 ] .

shape:PremiumCustomerShape a sh:NodeShape ;
    sh:targetClass retail:PremiumCustomer ;
    sh:property [ sh:path retail:memberSince ; sh:datatype xsd:date ; sh:minCount 1 ; sh:maxCount 1 ] .

shape:ProductShape a sh:NodeShape ;
    sh:targetClass retail:Product ;
    sh:property [ sh:path retail:name ; sh:datatype xsd:string ; sh:minCount 1 ] ;
    sh:property [ sh:path retail:sku  ; sh:datatype xsd:string ; sh:minCount 1 ; sh:maxCount 1 ] ;
    sh:property [ sh:path retail:price ; sh:datatype xsd:decimal ; sh:minCount 1 ; sh:maxCount 1 ; sh:minExclusive 0 ] ;
    sh:property [ sh:path retail:brand ; sh:class retail:Brand ; sh:minCount 1 ; sh:maxCount 1 ] ;
    sh:property [ sh:path retail:inCategory ; sh:class retail:SubCategory ; sh:minCount 1 ; sh:maxCount 1 ;
                  sh:message "A product is assigned to exactly one sub-category (the lowest level)." ] .
```

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

# =====================================================================
# Key parts of the retail ontology (retail-ontology.ttl, retail-defined-classes.ttl)
# =====================================================================
@prefix rdf:    <http://www.w3.org/1999/02/22-rdf-syntax-ns#> .
@prefix rdfs:   <http://www.w3.org/2000/01/rdf-schema#> .
@prefix owl:    <http://www.w3.org/2002/07/owl#> .
@prefix skos:   <http://www.w3.org/2004/02/skos/core#> .
@prefix schema: <https://schema.org/> .

retail:Customer        rdfs:subClassOf retail:Party , schema:Person .
retail:PremiumCustomer rdfs:subClassOf retail:Customer .
retail:Product         owl:equivalentClass schema:Product .
retail:Category        rdfs:subClassOf skos:Concept .
retail:ProductFamily   rdfs:subClassOf retail:Category .
retail:ProductCategory rdfs:subClassOf retail:Category .
retail:SubCategory     rdfs:subClassOf retail:Category .
[] a owl:AllDisjointClasses ;
   owl:members ( retail:Party retail:Brand retail:Channel retail:Product retail:Category
                 retail:Order retail:OrderLine retail:Address retail:State retail:Country retail:Review ) .

retail:placedBy   a owl:ObjectProperty , owl:FunctionalProperty ;
                  rdfs:domain retail:Order ; rdfs:range retail:Customer ; owl:inverseOf retail:placedOrder .
retail:hasLine    a owl:ObjectProperty , owl:InverseFunctionalProperty ; rdfs:domain retail:Order ; rdfs:range retail:OrderLine .
retail:forProduct a owl:ObjectProperty , owl:FunctionalProperty ; rdfs:domain retail:OrderLine ; rdfs:range retail:Product .
retail:inCategory a owl:ObjectProperty , owl:FunctionalProperty ; rdfs:domain retail:Product ; rdfs:range retail:SubCategory .
retail:subCategoryOf a owl:ObjectProperty , owl:TransitiveProperty ; rdfs:subPropertyOf skos:broader .
retail:purchased  a owl:ObjectProperty ; rdfs:domain retail:Customer ; rdfs:range retail:Product ;
                  owl:propertyChainAxiom ( retail:placedOrder retail:hasLine retail:forProduct ) .

retail:DeliveredOrder owl:equivalentClass [ owl:intersectionOf ( retail:Order
    [ a owl:Restriction ; owl:onProperty retail:status ; owl:hasValue "DELIVERED" ] ) ] .
retail:NonRevenueOrder owl:equivalentClass [ owl:intersectionOf ( retail:Order
    [ owl:unionOf ( [ a owl:Restriction ; owl:onProperty retail:status ; owl:hasValue "CANCELLED" ]
                    [ a owl:Restriction ; owl:onProperty retail:status ; owl:hasValue "RETURNED" ] ) ] ) ] .
retail:LaptopBuyer owl:equivalentClass [ owl:intersectionOf ( retail:Customer
    [ a owl:Restriction ; owl:onProperty retail:purchased ;
      owl:someValuesFrom [ a owl:Restriction ; owl:onProperty retail:inCategory ; owl:hasValue ex:SUB-LAPTOP ] ] ) ] .
```

```sparql query
PREFIX retail: <https://example.org/retail/ontology#>

SELECT ?c ?name WHERE { ?c a retail:LaptopBuyer ; retail:name ?name }
```

```sparql solution
PREFIX retail: <https://example.org/retail/ontology#>

SELECT ?family (SUM(?qty * ?price) AS ?revenue)
WHERE {
  ?order a retail:Order ; retail:hasLine ?line .
  FILTER NOT EXISTS { ?order a retail:NonRevenueOrder }
  ?line retail:quantity ?qty ; retail:unitPrice ?price ;
        retail:forProduct/retail:inCategory/retail:subCategoryOf* ?f .
  ?f a retail:ProductFamily ; retail:name ?family .
}
GROUP BY ?family
```
