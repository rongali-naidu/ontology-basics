---
title: Properties, domain and range
section: RDFS
reasoning: rdfs
check_reasoning: rdfs
---

# Describing properties

Properties can be described too.

## rdfs:subPropertyOf

The retail ontology maps its own properties onto schema.org:

```turtle
retail:name rdfs:subPropertyOf schema:name .
retail:sku  rdfs:subPropertyOf schema:sku .
```

If something has a `retail:name`, it also has a `schema:name` (rule **rdfs7**). A tool that only knows schema.org can now read your data.

## rdfs:domain and rdfs:range

```turtle
retail:placedBy rdfs:domain retail:Order ;      # the subject of placedBy is an Order
                rdfs:range  retail:Customer .   # the object is a Customer
retail:email    rdfs:domain retail:Customer .
```

Here's the surprise for beginners: **domain and range are not checks, they are inference rules.** They don't reject "bad" data. They *add types*:

```
IF ?x retail:placedBy ?y   THEN   ?x a retail:Order   AND   ?y a retail:Customer
```

So `ex:ORD-0001` becomes an Order and `ex:C1` a Customer, even though neither is typed in the data. That's useful.

Now look at the last line of the data. Someone recorded a **support email for a brand** using `retail:email`. Run this with RDFS on:

```sparql
PREFIX ex: <https://example.org/retail/data/>

SELECT ?x ?type
WHERE { VALUES ?x { ex:C1 ex:BRAND-ExampleTech } ?x a ?type }
ORDER BY ?x
```

The reasoner happily concludes that the **brand ExampleTech is a Customer**, because `retail:email` has domain `retail:Customer`. RDFS never complains. To *catch* mistakes like this you need OWL disjointness (coming soon) or SHACL validation (later).

> **Rule of thumb:** use `rdfs:domain`/`rdfs:range` to *document intent and add types*. Use SHACL to *enforce* constraints.

## Exercise

With RDFS reasoning on, write a query that lists **every thing and its `schema:name`**. Return `?thing ?name`. Nothing in the data uses `schema:name` directly, so every row comes from inference.

*Bonus:* delete the mistaken brand email, run the type query again, and see the strange inference disappear.

```turtle data
@prefix retail: <https://example.org/retail/ontology#> .
@prefix ex:     <https://example.org/retail/data/> .
@prefix rdfs:   <http://www.w3.org/2000/01/rdf-schema#> .
@prefix schema: <https://schema.org/> .

# ---- Schema ----
retail:name     rdfs:subPropertyOf schema:name .
retail:sku      rdfs:subPropertyOf schema:sku .
retail:placedBy rdfs:domain retail:Order ; rdfs:range retail:Customer .
retail:brand    rdfs:domain retail:Product ; rdfs:range retail:Brand .
retail:email    rdfs:domain retail:Customer .

# ---- Data (deliberately without rdf:type) ----
ex:ORD-0001 retail:placedBy ex:C1 .
ex:C1       retail:name "Naidu Random1" ; retail:email "naidu@example.com" .
ex:PRD-0001 retail:name "Laptop Pro 14" ; retail:sku "LAP-PRO-14" ; retail:brand ex:BRAND-ExampleTech .
ex:BRAND-ExampleTech retail:name "ExampleTech" .

# A modelling mistake: retail:email is meant for customers only
ex:BRAND-ExampleTech retail:email "support@exampletech.example" .
```

```sparql query
PREFIX ex: <https://example.org/retail/data/>

SELECT ?x ?type
WHERE { VALUES ?x { ex:C1 ex:BRAND-ExampleTech } ?x a ?type }
ORDER BY ?x
```

```sparql solution
PREFIX schema: <https://schema.org/>

SELECT ?thing ?name
WHERE { ?thing schema:name ?name }
```
