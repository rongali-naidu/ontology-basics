---
title: Properties, domain and range
section: Ontology concepts
reasoning: none
---

# Properties: attributes and relationships

Classes say *what kinds of things* exist. **Properties** (called **slots** in older ontology tools, **roles** in description logic) describe them: their features, and how they relate to each other.

## Two kinds of property

| | Data property | Object property |
|---|---|---|
| OWL term | `owl:DatatypeProperty` | `owl:ObjectProperty` |
| Value is… | a **literal**: text, number, date | **another individual** |
| Describes | an **attribute** | a **relationship** |
| In the store | `retail:price 1299.00`, `retail:email "…"` | `retail:placedBy ex:C1`, `retail:brand ex:BRAND-ExampleTech` |
| OOP analogy | a field of a primitive type (`BigDecimal price`) | a field holding a reference (`Customer placedBy`) |
| Graph analogy | an attribute of a node | an edge between two nodes |

## Domain and range

```turtle
retail:placedBy a owl:ObjectProperty ;
    rdfs:domain retail:Order ;      # the subject is an Order
    rdfs:range  retail:Customer .   # the value is a Customer
retail:price a owl:DatatypeProperty ;
    rdfs:domain retail:Product ;
    rdfs:range  xsd:decimal .       # the value is a decimal number
```

- **Domain**: which class the property describes (the class of the **subject**).
- **Range**: what kind of value it takes, either a class (object property) or a datatype (data property).

## The biggest difference from OOP: properties stand alone

In Java or Python, a field belongs to its class: `Order.placedBy` only exists inside `Order`. In an ontology, **a property is a first-class thing with its own IRI**, defined separately from any class:

- **One property, many classes.** `retail:name` describes products, brands, customers and categories. It declares no domain at all.
- **Properties have their own hierarchy.** `retail:name rdfs:subPropertyOf schema:name`.
- **Properties have their own characteristics.** They can be inverse, transitive or functional (see the OWL lessons).
- **Everything is a triple, schema included.** `retail:price rdfs:domain retail:Product` is a triple just like `ex:PRD-0001 retail:price 1299.00`, and you query both the same way.

## ⚠ Domain and range don't *check* anything

In OOP, assigning a `Brand` to a `Customer` field is a type error. In RDFS/OWL, domain and range are **inference rules**: if `ex:X retail:placedBy ex:Y`, a reasoner *concludes* that X is an Order and Y is a Customer, whatever they really are. Checking ("reject anything that isn't a Customer") is the job of **SHACL**. The next lesson shows both.

## Exercise

Write a query that lists **every object property** with its **domain and range**. Return `?property ?domain ?range`.

*Hint:* `?property a owl:ObjectProperty ; rdfs:domain ?domain ; …`

```turtle data
@prefix retail: <https://example.org/retail/ontology#> .
@prefix ex:     <https://example.org/retail/data/> .
@prefix owl:    <http://www.w3.org/2002/07/owl#> .
@prefix rdfs:   <http://www.w3.org/2000/01/rdf-schema#> .
@prefix xsd:    <http://www.w3.org/2001/XMLSchema#> .

# ---- Object properties (relationships) ----
retail:placedBy   a owl:ObjectProperty ; rdfs:domain retail:Order ;     rdfs:range retail:Customer .
retail:hasLine    a owl:ObjectProperty ; rdfs:domain retail:Order ;     rdfs:range retail:OrderLine .
retail:forProduct a owl:ObjectProperty ; rdfs:domain retail:OrderLine ; rdfs:range retail:Product .
retail:brand      a owl:ObjectProperty ; rdfs:domain retail:Product ;   rdfs:range retail:Brand .

# ---- Data properties (attributes) ----
retail:price     a owl:DatatypeProperty ; rdfs:domain retail:Product ;  rdfs:range xsd:decimal .
retail:email     a owl:DatatypeProperty ; rdfs:domain retail:Customer ; rdfs:range xsd:string .
retail:orderDate a owl:DatatypeProperty ; rdfs:domain retail:Order ;    rdfs:range xsd:date .
retail:name      a owl:DatatypeProperty ; rdfs:range xsd:string .        # no domain: used by many classes

# ---- A few individuals ----
ex:PRD-0001 a retail:Product ; retail:name "Laptop Pro 14" ; retail:price 1299.00 ; retail:brand ex:BRAND-ExampleTech .
ex:BRAND-ExampleTech a retail:Brand ; retail:name "ExampleTech" .
ex:C1 a retail:Customer ; retail:name "Naidu Random1" ; retail:email "naidu@example.com" .
```

```sparql query
PREFIX owl:  <http://www.w3.org/2002/07/owl#>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>

SELECT ?property ?kind ?range
WHERE {
  ?property a ?kind .
  VALUES ?kind { owl:ObjectProperty owl:DatatypeProperty }
  OPTIONAL { ?property rdfs:range ?range }
}
ORDER BY ?kind ?property
```

```sparql solution
PREFIX owl:  <http://www.w3.org/2002/07/owl#>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>

SELECT ?property ?domain ?range
WHERE { ?property a owl:ObjectProperty ; rdfs:domain ?domain ; rdfs:range ?range }
```
