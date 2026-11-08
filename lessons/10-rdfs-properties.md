---
title: Properties, domain and range
section: RDFS
reasoning: rdfs
check_reasoning: rdfs
---

# Describing properties

Properties can be described too.

## rdfs:subPropertyOf

```turtle
ex:author      rdfs:subPropertyOf ex:contributor .
ex:illustrator rdfs:subPropertyOf ex:contributor .
```

If someone is the author, they are also a contributor (rule **rdfs7**). One query on `ex:contributor` now finds authors *and* illustrators.

## rdfs:domain and rdfs:range

```turtle
ex:author rdfs:domain ex:Book ;     # the subject of ex:author is a Book
          rdfs:range  ex:Person .   # the object of ex:author is a Person
```

Here's the surprise for beginners: **domain and range are not checks, they are inference rules.** They don't reject "bad" data. They *add types*:

```
IF ?x ex:author ?y   THEN   ?x a ex:Book   AND   ?y a ex:Person
```

Look at the last line of the data. Someone made a mistake and wrote that the *person* `ex:shelley` has author `ex:frankenstein`. Run this with RDFS on:

```sparql
PREFIX ex: <http://example.org/library#>

SELECT ?x ?type
WHERE { VALUES ?x { ex:shelley ex:frankenstein } ?x a ?type }
ORDER BY ?x
```

The reasoner happily concludes that Mary Shelley is a **Book** and Frankenstein is a **Person**. RDFS never complains. To *catch* mistakes like this you need OWL disjointness (coming soon) or SHACL validation (later).

> **Rule of thumb:** use `rdfs:domain`/`rdfs:range` to *document intent and add types*. Use SHACL to *enforce* constraints.

## Exercise

With RDFS reasoning on, write a query that lists **everyone who contributed to `ex:frankenstein`** by asking only for `ex:contributor`. Return `?who`. Frankenstein has an author and an illustrator, so you should get both.

*Bonus:* delete the mistaken last line, run the type query again, and see how the strange inferences disappear.

```turtle data
@prefix ex:   <http://example.org/library#> .
@prefix rdf:  <http://www.w3.org/1999/02/22-rdf-syntax-ns#> .
@prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .

# ---- Schema ----
ex:contributor a rdf:Property .
ex:author      rdfs:subPropertyOf ex:contributor ;
               rdfs:domain ex:Book ;
               rdfs:range  ex:Person .
ex:illustrator rdfs:subPropertyOf ex:contributor ;
               rdfs:range  ex:Person .

# ---- Data ----
ex:frankenstein ex:title "Frankenstein" ;
                ex:author ex:shelley ;
                ex:illustrator ex:holst .
ex:shelley ex:name "Mary Shelley" .
ex:holst   ex:name "Theodor von Holst" .

# A mistake! Subject and object are swapped:
ex:shelley ex:author ex:frankenstein .
```

```sparql query
PREFIX ex: <http://example.org/library#>

SELECT ?x ?type
WHERE { VALUES ?x { ex:shelley ex:frankenstein } ?x a ?type }
ORDER BY ?x
```

```sparql solution
PREFIX ex: <http://example.org/library#>

SELECT ?who
WHERE { ex:frankenstein ex:contributor ?who }
```
