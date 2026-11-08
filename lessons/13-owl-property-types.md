---
title: Inverse, transitive, symmetric
section: OWL
reasoning: owl
check_reasoning: owl
---

# Property characteristics

OWL lets you describe *how a property behaves*. Each characteristic is a rule the reasoner applies. Reasoning on this page is set to **RDFS + OWL RL**.

## owl:inverseOf

```turtle
ex:wrote owl:inverseOf ex:author .
```

`ex:frankenstein ex:author ex:shelley` now also gives `ex:shelley ex:wrote ex:frankenstein`. You can query in either direction no matter which one was stored.

```sparql
PREFIX ex: <http://example.org/library#>

SELECT ?person ?book WHERE { ?person ex:wrote ?book }
```

## owl:TransitiveProperty

If A is in B and B is in C, then A is in C:

```turtle
ex:locatedIn a owl:TransitiveProperty .
ex:shelfA      ex:locatedIn ex:readingRoom .
ex:readingRoom ex:locatedIn ex:mainBuilding .
```

```sparql
PREFIX ex: <http://example.org/library#>

SELECT ?place WHERE { ex:shelfA ex:locatedIn ?place }
```

Only one `locatedIn` triple is stored for `ex:shelfA`, but you get both places.

## owl:SymmetricProperty

If A is related to B, then B is related to A:

```turtle
ex:relatedTo a owl:SymmetricProperty .
ex:frankenstein ex:relatedTo ex:dracula .
```

Other characteristics include `owl:ReflexiveProperty`, `owl:AsymmetricProperty`, and `owl:FunctionalProperty`, which you'll meet soon.

> Switch Reasoning to **Off** and run the queries again to see which answers depended on inference.

## Exercise

Add **one triple** declaring `ex:hasPart` as the **inverse** of `ex:locatedIn`. Then the reasoner can work out that `ex:mainBuilding ex:hasPart ex:shelfA`. That takes two steps, transitivity *and* inverse, even though no such triple is stored.

```turtle data
@prefix ex:  <http://example.org/library#> .
@prefix owl: <http://www.w3.org/2002/07/owl#> .

# ---- Schema ----
ex:author    a owl:ObjectProperty .
ex:wrote     a owl:ObjectProperty ; owl:inverseOf ex:author .
ex:locatedIn a owl:ObjectProperty , owl:TransitiveProperty .
ex:hasPart   a owl:ObjectProperty .
ex:relatedTo a owl:ObjectProperty , owl:SymmetricProperty .

# ---- Data ----
ex:frankenstein ex:author ex:shelley .
ex:dracula      ex:author ex:stoker .
ex:frankenstein ex:relatedTo ex:dracula .

ex:shelfA      ex:locatedIn ex:readingRoom .
ex:shelfB      ex:locatedIn ex:readingRoom .
ex:readingRoom ex:locatedIn ex:mainBuilding .
ex:frankenstein ex:locatedIn ex:shelfA .
```

```sparql query
PREFIX ex: <http://example.org/library#>

SELECT ?whole ?part
WHERE { ?whole ex:hasPart ?part }
```

```sparql check
PREFIX ex:  <http://example.org/library#>
PREFIX owl: <http://www.w3.org/2002/07/owl#>
ASK {
  { ex:hasPart owl:inverseOf ex:locatedIn } UNION { ex:locatedIn owl:inverseOf ex:hasPart }
  ex:mainBuilding ex:hasPart ex:shelfA .
}
```

```turtle solution-data
@prefix ex:  <http://example.org/library#> .
@prefix owl: <http://www.w3.org/2002/07/owl#> .

# ---- Schema ----
ex:author    a owl:ObjectProperty .
ex:wrote     a owl:ObjectProperty ; owl:inverseOf ex:author .
ex:locatedIn a owl:ObjectProperty , owl:TransitiveProperty .
ex:hasPart   a owl:ObjectProperty ; owl:inverseOf ex:locatedIn .
ex:relatedTo a owl:ObjectProperty , owl:SymmetricProperty .

# ---- Data ----
ex:frankenstein ex:author ex:shelley .
ex:dracula      ex:author ex:stoker .
ex:frankenstein ex:relatedTo ex:dracula .

ex:shelfA      ex:locatedIn ex:readingRoom .
ex:shelfB      ex:locatedIn ex:readingRoom .
ex:readingRoom ex:locatedIn ex:mainBuilding .
ex:frankenstein ex:locatedIn ex:shelfA .
```
