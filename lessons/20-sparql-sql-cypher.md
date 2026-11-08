---
title: SPARQL vs SQL vs Cypher
section: SPARQL basics
---

# Connecting the dots: RDF, relational and property graphs

The store in this course exists in three shapes in the retail repo: as **relational tables** (`data-model/oltp/schema.sql`), as a **property graph** (`property-graph/cypher/`) and as **RDF** (`rdf/`, plus the ontology). Same business, three data models, three query languages. This page puts them side by side.

## Three data models

| | RDF graph | Property graph | Relational |
|---|---|---|---|
| Unit of data | **triple** (subject, predicate, object) | **node** and **relationship**, each with key–value properties | **row** in a table |
| Query language | **SPARQL** (W3C) | **Cypher** / openCypher; **GQL** (ISO, 2024) | **SQL** (ISO) |
| Typical engines | Oxigraph, GraphDB, Jena, Stardog, Neptune | Neo4j, Neptune, Memgraph | PostgreSQL, Snowflake, … |
| Identity | **global IRIs**: the same ID works across systems and on the web | internal IDs, local to one database | primary keys, local to one table |
| Schema | optional; it *is* data (the ontology), queryable like any triple | optional; labels and property keys | required up front (`CREATE TABLE`) |
| Properties on relationships | no: make the relationship a node (`retail:OrderLine`) | **yes**: `[:CONTAINS {quantity, unitPrice}]` | yes: columns of a join table |
| Multi-valued attributes | natural: just add another triple | lists as property values | a separate table |
| Hierarchies of any depth | property paths `*` `+` | variable-length paths `*0..` | `WITH RECURSIVE` |
| Meaning and reasoning | **RDFS/OWL** inference, standard vocabularies | none standard (done in application code) | none standard (views, procedures) |
| Validation | **SHACL** | constraints (uniqueness, existence) | `NOT NULL`, `CHECK`, foreign keys |
| Combining sources | merge graphs; IRIs line up; `owl:sameAs` | import and remap IDs | ETL into a shared schema |
| Sweet spot | integrating data across systems, shared meaning, open standards | traversal-heavy apps (recommendations, fraud, networks) | transactions, reporting, BI at scale |

## One fact, three shapes

*"Order ORD-0001 contains 1 × Laptop Pro 14 at 1299.00"*

**SQL**: a row in a join table (`order_line`, from `oltp/schema.sql`):

```
order_line_id | order_id | product_code | quantity | unit_price
ORD-0001-1    | ORD-0001 | PRD-0001     | 1        | 1299.00
```

**Cypher**: an edge with properties (from `01-create-retail-graph.cypher`):

```
(ORD_0001)-[:CONTAINS {quantity: 1, unitPrice: 1299.00}]->(PRD_0001)
```

**RDF**: an order-line node with triples:

```turtle
ex:ORD-0001 retail:hasLine ex:ORD-0001-1 .
ex:ORD-0001-1 retail:forProduct ex:PRD-0001 ; retail:quantity 1 ; retail:unitPrice 1299.00 .
```

## The same question, three languages

**Revenue per customer.** All three give Naidu 1498.97, Bob 199.98, Carol 179.48.

```
-- SQL (OLTP tables)
SELECT c.customer_name, SUM(l.quantity * l.unit_price) AS revenue
FROM customer c
JOIN sales_order o ON o.customer_id = c.customer_id
JOIN order_line  l ON l.order_id = o.order_id
WHERE o.order_status NOT IN ('CANCELLED', 'RETURNED')
GROUP BY c.customer_name;
```

```
// Cypher (adapted from Q3 in property-graph/cypher/02-queries.cypher)
MATCH (c:Customer)-[:PLACED]->(o:Order)-[l:CONTAINS]->(:Product)
WHERE NOT o.status IN ['CANCELLED', 'RETURNED']
RETURN c.name AS customer, sum(l.quantity * l.unitPrice) AS revenue;
```

```sparql
PREFIX retail: <https://example.org/retail/ontology#>

SELECT ?customer (SUM(?q * ?p) AS ?revenue)
WHERE {
  ?o retail:placedBy/retail:name ?customer ; retail:status ?s ; retail:hasLine ?l .
  ?l retail:quantity ?q ; retail:unitPrice ?p .
  FILTER(?s NOT IN ("CANCELLED", "RETURNED"))
}
GROUP BY ?customer
```

**Products under Electronics, at any depth.** This is where graphs shine:

```
-- SQL: a recursive common table expression
WITH RECURSIVE tree(code) AS (
  SELECT 'FAM-ELEC'
  UNION ALL
  SELECT c.code FROM category_tree c JOIN tree t ON c.parent_code = t.code
)
SELECT p.product_name FROM product p JOIN tree t ON p.subcategory_code = t.code;
```

```
// Cypher: variable-length path (adapted from Q2 in the repo)
MATCH (:Category {name: 'Electronics'})<-[:SUBCATEGORY_OF*0..]-(:Category)<-[:IN_CATEGORY]-(p:Product)
RETURN p.name;
```

```sparql
PREFIX retail: <https://example.org/retail/ontology#>
PREFIX ex:     <https://example.org/retail/data/>

SELECT ?name
WHERE { ?p retail:inCategory/retail:subCategoryOf* ex:FAM-ELEC ; retail:name ?name }
```

(The real OLTP schema has three fixed tables for the three levels, so its SQL would join them directly. The recursive version above is how you'd handle a hierarchy of *unknown* depth, like the Google taxonomy.)

## Cheat sheet

| Task | SPARQL | SQL | Cypher |
|---|---|---|---|
| pick columns | `SELECT ?a ?b` | `SELECT a, b` | `RETURN a, b` |
| match / from | `WHERE { ?s ?p ?o }` | `FROM t` | `MATCH (n)-[r]->(m)` |
| join | shared variable | `JOIN … ON` | shared node in the pattern |
| left join | `OPTIONAL { … }` | `LEFT JOIN` | `OPTIONAL MATCH` |
| anti-join | `FILTER NOT EXISTS { … }` / `MINUS` | `NOT EXISTS (…)` | `WHERE NOT (n)-->()` |
| filter | `FILTER(?x > 5)` | `WHERE x > 5` | `WHERE x > 5` |
| aggregate | `COUNT`, `SUM` + `GROUP BY` | same | implicit grouping by the non-aggregated keys |
| filter groups | `HAVING` | `HAVING` | `WITH … WHERE` |
| sort / page | `ORDER BY` `LIMIT` `OFFSET` | `ORDER BY` `LIMIT` `OFFSET` | `ORDER BY` `LIMIT` `SKIP` |
| distinct | `SELECT DISTINCT` | `SELECT DISTINCT` | `RETURN DISTINCT` |
| union | `{ … } UNION { … }` | `UNION` | `UNION` |
| any-depth path | `p*`, `p+` | `WITH RECURSIVE` | `-[:P*]->` |
| missing value | unbound variable | `NULL` | `null` |
| computed column | `BIND(… AS ?x)` | `expr AS x` | `expr AS x` |
| build a new graph | `CONSTRUCT` | `CREATE VIEW` / `CREATE TABLE AS` | `CREATE` / `MERGE` |
| insert | `INSERT DATA { … }` | `INSERT INTO … VALUES` | `CREATE (…)` |
| update | `DELETE { … } INSERT { … } WHERE { … }` | `UPDATE … SET` | `SET n.prop = …` |
| upsert | `DELETE/INSERT` + `OPTIONAL` | `MERGE` / `ON CONFLICT` | `MERGE` |
| delete | `DELETE WHERE { … }` | `DELETE FROM` | `DETACH DELETE n` |
| query another source | `SERVICE <endpoint> { … }` | foreign tables / DB links | (vendor-specific) |
| schema discovery | `SELECT DISTINCT ?p WHERE { ?s ?p ?o }` | `information_schema` | `CALL db.labels()` |

## The key mental shifts

- **From SQL:** there are no tables to join, just patterns over one big graph. Columns become predicates, foreign keys become edges, and a `NULL` becomes a triple that isn't there. Adding a new attribute needs no `ALTER TABLE`.
- **From Cypher:** a SPARQL triple pattern is a single edge, `?s ?p ?o`, and node properties are edges too (to literal values). An edge can't carry properties, so use an intermediate node. IRIs are global, so two graphs that use the same IRI join automatically.

## Exercise

Translate this SQL into SPARQL. It lists customers who wrote **at least two reviews**:

```
SELECT c.customer_name, COUNT(*) AS reviews
FROM product_review r
JOIN customer c ON c.customer_id = r.customer_id
GROUP BY c.customer_name
HAVING COUNT(*) >= 2;
```

Return `?name` and the count. (Only Naidu Random1 qualifies.)

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

SELECT ?review ?name
WHERE { ?review retail:writtenBy/retail:name ?name }
```

```sparql solution
PREFIX retail: <https://example.org/retail/ontology#>

SELECT ?name (COUNT(?r) AS ?reviews)
WHERE { ?r a retail:Review ; retail:writtenBy/retail:name ?name }
GROUP BY ?name
HAVING (COUNT(?r) >= 2)
```
