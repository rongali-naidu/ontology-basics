---
title: Adding, updating, deleting
section: SPARQL basics
---

# SPARQL Update: changing the data

Queries read the graph; **SPARQL Update** changes it. In this playground, running an update **rewrites the Data panel** with the new graph, and the results show exactly which triples were **added (+)** and **removed (−)**. Press **Reset** at any time to get the original data back.

## Add entries: INSERT DATA

New facts, written like Turtle inside `INSERT DATA { … }`. This is the retail example's `12-insert-new-order.ru`, in which Bob orders a mechanical keyboard:

```sparql
PREFIX retail: <https://example.org/retail/ontology#>
PREFIX ex:     <https://example.org/retail/data/>
PREFIX xsd:    <http://www.w3.org/2001/XMLSchema#>

INSERT DATA {
  ex:ORD-0007 a retail:Order ;
      retail:placedBy ex:C2 ;
      retail:orderDate "2026-10-20"^^xsd:date ;
      retail:status "PLACED" ;
      retail:hasLine ex:ORD-0007-1 .
  ex:ORD-0007-1 a retail:OrderLine ;
      retail:forProduct ex:PRD-0006 ;
      retail:quantity 1 ;
      retail:unitPrice 89.00 .
}
```

Inserting a triple that already exists does nothing: a graph is a *set* of triples, so there are no duplicates.

## Remove specific facts: DELETE DATA

```sparql
PREFIX retail: <https://example.org/retail/ontology#>
PREFIX ex:     <https://example.org/retail/data/>

DELETE DATA { ex:C2 retail:email "bob@example.com" }
```

`DATA` means fixed triples: no variables allowed.

## Change a value: DELETE … INSERT … WHERE

There's no `UPDATE … SET` in SPARQL. **Changing a value means deleting the old triple and inserting the new one**, in one operation. This is the retail example's `13-update-status.ru`: every SHIPPED order becomes DELIVERED.

```sparql
PREFIX retail: <https://example.org/retail/ontology#>

DELETE { ?o retail:status "SHIPPED" }
INSERT { ?o retail:status "DELIVERED" }
WHERE  { ?o a retail:Order ; retail:status "SHIPPED" }
```

The `WHERE` finds the matches; then every `DELETE` template is removed and every `INSERT` template is added, for each match.

> ⚠ **The classic mistake:** using only `INSERT` to "change" a value. Properties can have many values, so you end up with *two* statuses, `"PLACED"` and `"SHIPPED"`. Always delete the old value.

## Set a value whether or not one exists ("upsert")

Wrap the old value in `OPTIONAL`, so the update also works when there was no value yet:

```sparql
PREFIX retail: <https://example.org/retail/ontology#>
PREFIX ex:     <https://example.org/retail/data/>

DELETE { ex:C2 retail:email ?old }
INSERT { ex:C2 retail:email "bob.random@example.com" }
WHERE  { OPTIONAL { ex:C2 retail:email ?old } }
```

## Derive new facts: INSERT … WHERE

Like `CONSTRUCT`, but the result is stored. Materialise the `purchased` shortcut:

```sparql
PREFIX retail: <https://example.org/retail/ontology#>

INSERT { ?c retail:purchased ?p }
WHERE  { ?o retail:placedBy ?c ; retail:hasLine/retail:forProduct ?p }
```

## Delete a whole entity: DELETE WHERE

Remove the cancelled order and its lines. `DELETE WHERE` uses the pattern both to match and as the delete template:

```sparql
PREFIX retail: <https://example.org/retail/ontology#>
PREFIX ex:     <https://example.org/retail/data/>

DELETE WHERE { ex:ORD-0005 retail:hasLine ?line . ?line ?lp ?lo . } ;
DELETE WHERE { ex:ORD-0005 ?p ?o }
```

Several operations can be chained with `;`, and they run in order. Remember to delete things that hang off the entity (here, its lines) and links *into* it (`?s ?p ex:ORD-0005`), or you'll leave orphans.

## Named graphs

Updates can target a graph: `INSERT DATA { GRAPH g:orders { … } }`, `DELETE { GRAPH ?g { … } }`, or `WITH g:orders DELETE … WHERE …`. Whole graphs are managed with `CLEAR GRAPH g:orders` (empty it), `DROP GRAPH` (remove it), `COPY`, `MOVE` and `ADD`. Replacing one source system's graph wholesale is a common load pattern: `CLEAR GRAPH g:crm ; INSERT DATA { GRAPH g:crm { … } }`.

## Patterns at a glance

| Task | SPARQL Update | SQL |
|---|---|---|
| add a record | `INSERT DATA { … }` | `INSERT INTO … VALUES …` |
| remove known facts | `DELETE DATA { … }` | `DELETE … WHERE id = …` |
| change a value | `DELETE { old } INSERT { new } WHERE { … }` | `UPDATE … SET … WHERE …` |
| set or replace | `DELETE … INSERT … WHERE { OPTIONAL { … } }` | `UPSERT` / `MERGE` |
| derive & store | `INSERT { … } WHERE { … }` | `INSERT INTO … SELECT …` |
| delete matching | `DELETE WHERE { … }` | `DELETE FROM … WHERE …` |
| empty a dataset | `CLEAR GRAPH g:…` | `TRUNCATE TABLE …` |
| drop a dataset | `DROP GRAPH g:…` | `DROP TABLE …` |

## Exercise

Order **`ex:ORD-0004`** has just shipped. In **one** update:

- change its `retail:status` from `"PLACED"` to **`"SHIPPED"`** (it must have only one status afterwards), and
- add a `retail:shipDate` of **`"2026-10-04"^^xsd:date`**.

Run it, look at the +/− table, then press **Check my answer**.

```turtle data
@prefix retail: <https://example.org/retail/ontology#> .
@prefix ex:     <https://example.org/retail/data/> .
@prefix xsd:    <http://www.w3.org/2001/XMLSchema#> .

ex:C1 a retail:PremiumCustomer ; retail:name "Naidu Random1" ; retail:email "naidu@example.com" .
ex:C2 a retail:Customer        ; retail:name "Bob Random2"   ; retail:email "bob@example.com" .
ex:C3 a retail:PremiumCustomer ; retail:name "Carol Random3" ; retail:email "carol@example.com" .
ex:PRD-0004 retail:name "Knowledge Graphs 101" .
ex:PRD-0005 retail:name "Chef Knife 8in" .
ex:PRD-0006 retail:name "Mechanical Keyboard" .

ex:ORD-0002 a retail:Order ; retail:placedBy ex:C2 ; retail:status "SHIPPED" ;
    retail:orderDate "2026-09-05"^^xsd:date ; retail:shipDate "2026-09-07"^^xsd:date .
ex:ORD-0004 a retail:Order ; retail:placedBy ex:C3 ; retail:status "PLACED" ;
    retail:orderDate "2026-10-02"^^xsd:date ; retail:hasLine ex:ORD-0004-1 , ex:ORD-0004-2 .
ex:ORD-0005 a retail:Order ; retail:placedBy ex:C3 ; retail:status "CANCELLED" ;
    retail:orderDate "2026-10-05"^^xsd:date ; retail:hasLine ex:ORD-0005-1 .

ex:ORD-0004-1 retail:forProduct ex:PRD-0005 ; retail:quantity 1 ; retail:unitPrice 79.50 .
ex:ORD-0004-2 retail:forProduct ex:PRD-0004 ; retail:quantity 2 ; retail:unitPrice 49.99 .
ex:ORD-0005-1 retail:forProduct ex:PRD-0004 ; retail:quantity 1 ; retail:unitPrice 49.99 .
```

```sparql query
PREFIX retail: <https://example.org/retail/ontology#>

SELECT ?order ?status ?shipped
WHERE {
  ?order a retail:Order ; retail:status ?status .
  OPTIONAL { ?order retail:shipDate ?shipped }
}
ORDER BY ?order
```

```sparql check
PREFIX retail: <https://example.org/retail/ontology#>
PREFIX ex:     <https://example.org/retail/data/>
PREFIX xsd:    <http://www.w3.org/2001/XMLSchema#>
ASK {
  ex:ORD-0004 retail:status "SHIPPED" ; retail:shipDate "2026-10-04"^^xsd:date .
  FILTER NOT EXISTS { ex:ORD-0004 retail:status ?s FILTER(?s != "SHIPPED") }
}
```

```sparql solution
PREFIX retail: <https://example.org/retail/ontology#>
PREFIX ex:     <https://example.org/retail/data/>
PREFIX xsd:    <http://www.w3.org/2001/XMLSchema#>

DELETE { ex:ORD-0004 retail:status ?old }
INSERT { ex:ORD-0004 retail:status "SHIPPED" ;
                     retail:shipDate "2026-10-04"^^xsd:date }
WHERE  { ex:ORD-0004 retail:status ?old }
```
