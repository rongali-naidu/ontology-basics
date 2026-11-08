---
title: Turtle syntax
section: Foundations
---

# Writing RDF comfortably: Turtle

**Turtle** is the most readable way to write RDF. A few shortcuts make it compact.

## `;` repeats the subject, `,` repeats subject and predicate

```turtle
@prefix retail: <https://example.org/retail/ontology#> .
@prefix ex:     <https://example.org/retail/data/> .

ex:ORD-0001 retail:placedBy ex:C1 ;                    # same subject…
            retail:status "DELIVERED" ;                # …again
            retail:hasLine ex:ORD-0001-1 , ex:ORD-0001-2 .   # two objects for one predicate
```

That's four triples, and the final `.` ends the group.

## `a` means `rdf:type`

`ex:ORD-0001 a retail:Order .` says *"ORD-0001 is an Order"*. The word `a` is short for the IRI `rdf:type`, which you'll use constantly.

## Literals: strings, numbers, dates and languages

| Turtle | Meaning |
|---|---|
| `"Laptop Pro 14"` | a plain string |
| `"Electronics"@en` | a string tagged as English |
| `"Électronique"@fr` | French text: a *different* literal |
| `2` | shorthand for `"2"^^xsd:integer` |
| `29.99` | shorthand for `"29.99"^^xsd:decimal` (good for money) |
| `true` | an `xsd:boolean` |
| `"2026-09-01"^^xsd:date` | a typed date (`xsd:` must be declared) |

Datatypes matter: `29.99` and `"29.99"` are **different** values, and only the first sorts and compares as a number.

## Blank nodes: things without a name

Sometimes a thing has no IRI of its own, such as a shipping address used only once. `[ … ]` creates an anonymous **blank node**:

```turtle-add
@prefix retail: <https://example.org/retail/ontology#> .
@prefix ex:     <https://example.org/retail/data/> .

ex:C1 retail:hasAddress [ retail:city "Sampleton" ; retail:postalCode "00001" ] .
```

Press **+ Add to data** under the snippet, then look at the results: the address appears as `_:something`.

## Comments

`#` starts a comment that runs to the end of the line.

## Exercise

Add the product **`ex:PRD-0003`** to the data using `;`, with these four facts:

- it is `a retail:Product`
- `retail:name` is `"USB-C Charger 65W"`
- `retail:price` is the decimal `29.99`
- `retail:brand` is `ex:BRAND-ExampleTech`

If you make a syntax error, the bar under the data editor turns red and tells you where.

```turtle data
@prefix retail: <https://example.org/retail/ontology#> .
@prefix ex:     <https://example.org/retail/data/> .
@prefix xsd:    <http://www.w3.org/2001/XMLSchema#> .

ex:PRD-0001 a retail:Product ;
    retail:name  "Laptop Pro 14" ;
    retail:price 1299.00 ;
    retail:brand ex:BRAND-ExampleTech .

ex:FAM-ELEC a retail:ProductFamily ;
    retail:code "FAM-ELEC" ;
    retail:name "Electronics"@en , "Électronique"@fr .

ex:ORD-0001 a retail:Order ;
    retail:orderDate "2026-09-01"^^xsd:date ;
    retail:status "DELIVERED" .

# Add ex:PRD-0003 below this line

```

```sparql query
SELECT ?s ?p ?o
WHERE { ?s ?p ?o }
```

```sparql check
PREFIX retail: <https://example.org/retail/ontology#>
PREFIX ex:     <https://example.org/retail/data/>
ASK {
  ex:PRD-0003 a retail:Product ; retail:name "USB-C Charger 65W" ;
              retail:price ?p ; retail:brand ex:BRAND-ExampleTech .
  FILTER(?p = 29.99)
}
```

```turtle solution-data
@prefix retail: <https://example.org/retail/ontology#> .
@prefix ex:     <https://example.org/retail/data/> .
@prefix xsd:    <http://www.w3.org/2001/XMLSchema#> .

ex:PRD-0001 a retail:Product ;
    retail:name  "Laptop Pro 14" ;
    retail:price 1299.00 ;
    retail:brand ex:BRAND-ExampleTech .

ex:FAM-ELEC a retail:ProductFamily ;
    retail:code "FAM-ELEC" ;
    retail:name "Electronics"@en , "Électronique"@fr .

ex:ORD-0001 a retail:Order ;
    retail:orderDate "2026-09-01"^^xsd:date ;
    retail:status "DELIVERED" .

ex:PRD-0003 a retail:Product ;
    retail:name  "USB-C Charger 65W" ;
    retail:price 29.99 ;
    retail:brand ex:BRAND-ExampleTech .
```
