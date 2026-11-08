---
title: Triples and IRIs
section: Foundations
---

# Everything is a triple

RDF (Resource Description Framework) describes the world with **triples**. Each triple is one statement made of three parts:

| subject | predicate | object |
|---|---|---|
| order ORD-0001 | was placed by | customer C1 |
| customer C1 | has the name | "Naidu Random1" |

Triples that share a subject or object join up into a **graph**. Here `ex:C1` links the two facts:

```
ex:ORD-0001 ──retail:placedBy──▶ ex:C1 ──retail:name──▶ "Naidu Random1"
```

## IRIs name things

To avoid confusing *this* customer with any other customer of any other shop, RDF names things with **IRIs**: web-style global identifiers.

```
<https://example.org/retail/data/C1>
```

Writing full IRIs is tiring, so we declare a **prefix** once and use short names after that:

```turtle
@prefix ex:     <https://example.org/retail/data/> .        # the things: customers, orders…
@prefix retail: <https://example.org/retail/ontology#> .    # the vocabulary: placedBy, name…
```

Notice the two namespaces. That's a common pattern:

- `retail:` holds the **vocabulary**: classes like `retail:Order` and properties like `retail:placedBy`. This is the *ontology*.
- `ex:` holds the **data**: the actual customers, orders and products.

Subjects and predicates are always IRIs (subjects can also be *blank nodes*, covered in the next lesson). Objects can be IRIs or **literals**: plain values such as `"Naidu Random1"` or `1299.00`.

> **Why IRIs?** The CRM system, the warehouse and the web shop can all publish triples about `ex:C1`, and when the graphs are merged the statements line up automatically. That makes RDF good for *integrating* data.

## Look at the data

Each line in the Data panel ends with a full stop `.` and is exactly one triple. Run the query to list them all. Notice how the results table shows the short prefixed names.

## Exercise

Add a triple stating that **`ex:PRD-0002`** has **`retail:brand`** **`ex:BRAND-ExampleTech`**. Run the query to see it, then press **Check my answer**.

```turtle data
@prefix retail: <https://example.org/retail/ontology#> .
@prefix ex:     <https://example.org/retail/data/> .

ex:ORD-0001 retail:placedBy ex:C1 .
ex:C1       retail:name     "Naidu Random1" .
ex:PRD-0001 retail:name     "Laptop Pro 14" .
ex:PRD-0001 retail:brand    ex:BRAND-ExampleTech .
ex:PRD-0002 retail:name     "Wireless Earbuds X" .
```

```sparql query
SELECT ?subject ?predicate ?object
WHERE { ?subject ?predicate ?object }
```

```sparql check
PREFIX retail: <https://example.org/retail/ontology#>
PREFIX ex:     <https://example.org/retail/data/>
ASK { ex:PRD-0002 retail:brand ex:BRAND-ExampleTech }
```

```turtle solution-data
@prefix retail: <https://example.org/retail/ontology#> .
@prefix ex:     <https://example.org/retail/data/> .

ex:ORD-0001 retail:placedBy ex:C1 .
ex:C1       retail:name     "Naidu Random1" .
ex:PRD-0001 retail:name     "Laptop Pro 14" .
ex:PRD-0001 retail:brand    ex:BRAND-ExampleTech .
ex:PRD-0002 retail:name     "Wireless Earbuds X" .
ex:PRD-0002 retail:brand    ex:BRAND-ExampleTech .
```
