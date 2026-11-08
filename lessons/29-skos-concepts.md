---
title: Concepts, schemes and labels
section: SKOS
reasoning: none
---

# SKOS: vocabularies for people

Not everything needs the logical precision of OWL. Business glossaries, product taxonomies and keyword lists are about **organising concepts and their names**. That's what **SKOS** (Simple Knowledge Organization System) is for.

The retail example has a **business glossary**: the words people in the company actually use (*revenue*, *GMV*, *AOV*…), each with a definition and an owner. On the right is a part of it.

> **OWL classes vs SKOS concepts.** `retail:Order` as an OWL class means *the set of all orders*, and membership has logical consequences. `gl:revenue` as a SKOS concept is *a business term people use*. Nothing is "an instance of Revenue". The glossary *links* to the ontology instead, with `gl:about`.

## The core terms

```turtle
gl:RetailGlossary a skos:ConceptScheme ;
    skos:prefLabel "Retail business glossary"@en .

gl:revenue a skos:Concept ;
    skos:inScheme   gl:RetailGlossary ;
    skos:prefLabel  "Revenue"@en ;
    skos:altLabel   "Sales"@en , "Net sales"@en , "GMV"@en , "Turnover"@en ;
    skos:definition "The price customers actually paid on order lines …"@en .
```

| Property | Meaning |
|---|---|
| `skos:prefLabel` | **the** preferred name: at most one per language |
| `skos:altLabel` | synonyms, abbreviations, jargon |
| `skos:hiddenLabel` | misspellings: useful for search, never displayed |
| `skos:definition`, `skos:scopeNote`, `skos:example` | documentation notes |
| `skos:notation` | a code, like `"FAM-ELEC"` |
| `skos:inScheme`, `skos:hasTopConcept` | which scheme a concept belongs to |
| `skos:related` | "see also": a non-hierarchical link |

## Labels make questions answerable

A manager asks *"What was GMV last month?"*. Which metric do they mean? Search **all** label kinds:

```sparql
PREFIX skos: <http://www.w3.org/2004/02/skos/core#>

SELECT ?concept ?pref ?definition
WHERE {
  ?concept skos:prefLabel|skos:altLabel|skos:hiddenLabel "GMV"@en ;
           skos:prefLabel ?pref ;
           skos:definition ?definition .
}
```

This is exactly how a data agent turns business words into the right metric. Then always **display** the `prefLabel`.

Notice too that *revenue* and *booked revenue* are different concepts with different definitions, linked by `skos:related`. A glossary keeps similar-sounding terms apart.

## Exercise

Write a query that finds the concept whose **preferred or alternative label** equals **"aov"**, ignoring upper/lower case and the language tag. Return only `?concept`.

*Hint:* `FILTER(LCASE(STR(?label)) = "aov")`. `STR()` drops the language tag.

```turtle data
@prefix skos:   <http://www.w3.org/2004/02/skos/core#> .
@prefix retail: <https://example.org/retail/ontology#> .
@prefix gl:     <https://example.org/retail/glossary/> .

gl:RetailGlossary a skos:ConceptScheme ;
    skos:prefLabel "Retail business glossary"@en ;
    skos:hasTopConcept gl:revenue , gl:booked-revenue , gl:order-count , gl:average-order-value , gl:customer .

gl:revenue a skos:Concept ; skos:inScheme gl:RetailGlossary ;
    skos:prefLabel "Revenue"@en ;
    skos:altLabel "Sales"@en , "Net sales"@en , "Gross merchandise value"@en , "GMV"@en , "Turnover"@en ;
    skos:hiddenLabel "Reveneu"@en ;    # a common misspelling (added for this lesson)
    skos:definition "The price customers actually paid on order lines (quantity times the price paid), counting only orders that are not cancelled or returned. Excludes shipping and tax."@en ;
    skos:related gl:booked-revenue ;
    gl:about retail:OrderLine , retail:quantity , retail:unitPrice , retail:status ;
    gl:owner "Finance" .

gl:booked-revenue a skos:Concept ; skos:inScheme gl:RetailGlossary ;
    skos:prefLabel "Booked revenue"@en ;
    skos:altLabel "Bookings"@en , "Orders booked"@en ;
    skos:definition "The price paid on every order ever placed, including orders later cancelled or returned. Use only when the question is about bookings; otherwise use revenue."@en ;
    skos:related gl:revenue ;
    gl:owner "Finance" .

gl:order-count a skos:Concept ; skos:inScheme gl:RetailGlossary ;
    skos:prefLabel "Order count"@en ;
    skos:altLabel "Number of orders"@en , "Orders"@en ;
    skos:definition "The number of distinct orders that count as sales. Never count order lines instead."@en ;
    gl:owner "Sales Operations" .

gl:average-order-value a skos:Concept ; skos:inScheme gl:RetailGlossary ;
    skos:prefLabel "Average order value"@en ;
    skos:altLabel "AOV"@en , "Basket size"@en , "Average basket"@en ;
    skos:definition "Revenue divided by order count, recomputed at every level of detail (never an average of averages)."@en ;
    skos:related gl:revenue , gl:order-count ;
    gl:owner "Finance" .

gl:customer a skos:Concept ; skos:inScheme gl:RetailGlossary ;
    skos:prefLabel "Customer"@en ;
    skos:altLabel "Buyers"@en , "Shoppers"@en , "Clients"@en ;
    skos:definition "A person with an account who places orders and writes reviews."@en ;
    gl:about retail:Customer ;
    gl:owner "Marketing" .
```

```sparql query
PREFIX skos: <http://www.w3.org/2004/02/skos/core#>
PREFIX gl:   <https://example.org/retail/glossary/>

SELECT ?term (GROUP_CONCAT(?alt; separator=", ") AS ?synonyms) ?owner
WHERE {
  ?c skos:prefLabel ?term ; gl:owner ?owner .
  OPTIONAL { ?c skos:altLabel ?alt }
}
GROUP BY ?term ?owner
ORDER BY ?term
```

```sparql solution
PREFIX skos: <http://www.w3.org/2004/02/skos/core#>

SELECT DISTINCT ?concept
WHERE {
  ?concept skos:prefLabel|skos:altLabel ?label .
  FILTER(LCASE(STR(?label)) = "aov")
}
```
