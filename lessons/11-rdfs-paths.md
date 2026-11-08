---
title: Labels, and reasoning with paths
section: RDFS
reasoning: none
---

# Documenting a vocabulary, and querying it without a reasoner

## Labels and comments

A good vocabulary is readable by **people** too. RDFS gives you annotation properties:

| Property | Use |
|---|---|
| `rdfs:label` | a human-readable name, often in several languages |
| `rdfs:comment` | a description or definition |
| `rdfs:seeAlso` | a link to more information |
| `rdfs:isDefinedBy` | the vocabulary a term belongs to |

```sparql
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>

SELECT ?class ?label ?comment
WHERE {
  ?class a rdfs:Class ; rdfs:label ?label .
  OPTIONAL { ?class rdfs:comment ?comment }
  FILTER(LANG(?label) = "en")
}
```

Change `"en"` to `"es"` to get the Spanish labels.

## Reasoning with property paths

Many databases don't run a reasoner. You can still get the *subclass* inference by writing it into the query with a property path:

```sparql
PREFIX ex:   <http://example.org/library#>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>

SELECT ?thing
WHERE { ?thing a/rdfs:subClassOf* ex:Publication }
```

Read `a/rdfs:subClassOf*` as: *"has a type, which is the class itself or any number of `subClassOf` steps below it."* The `*` includes **zero** steps, so things typed directly as `ex:Publication` match too.

Reasoning is **Off** on this page, and the query still finds everything.

| Approach | Pros | Cons |
|---|---|---|
| **Reasoner** (materialise triples) | Simple queries; consistent everywhere | Extra storage; must re-run after changes |
| **Query rewriting** (paths) | No extra data; always up to date | Every query must remember to do it |

## Exercise

With reasoning **off**, list every **`ex:Book`** (including novels and graphic novels) together with its **English label**. Return `?thing ?label`.

```turtle data
@prefix ex:   <http://example.org/library#> .
@prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .

ex:Publication  a rdfs:Class ; rdfs:label "Publication"@en , "Publicación"@es .
ex:Book         a rdfs:Class ; rdfs:subClassOf ex:Publication ;
                rdfs:label "Book"@en , "Libro"@es ;
                rdfs:comment "A bound, non-periodical publication."@en .
ex:Novel        a rdfs:Class ; rdfs:subClassOf ex:Book ;
                rdfs:label "Novel"@en , "Novela"@es ;
                rdfs:comment "A long work of narrative fiction."@en .
ex:GraphicNovel a rdfs:Class ; rdfs:subClassOf ex:Novel ;
                rdfs:label "Graphic novel"@en , "Novela gráfica"@es .
ex:Magazine     a rdfs:Class ; rdfs:subClassOf ex:Publication ;
                rdfs:label "Magazine"@en , "Revista"@es .

ex:frankenstein a ex:Novel ;        rdfs:label "Frankenstein"@en .
ex:watchmen     a ex:GraphicNovel ; rdfs:label "Watchmen"@en .
ex:cookbook     a ex:Book ;         rdfs:label "Victorian Cookery"@en , "Cocina victoriana"@es .
ex:natGeo       a ex:Magazine ;     rdfs:label "National Geographic"@en .
ex:almanac      a ex:Publication ;  rdfs:label "Farmer's Almanac"@en .
```

```sparql query
PREFIX ex:   <http://example.org/library#>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>

SELECT ?thing
WHERE { ?thing a/rdfs:subClassOf* ex:Publication }
```

```sparql solution
PREFIX ex:   <http://example.org/library#>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>

SELECT ?thing ?label
WHERE {
  ?thing a/rdfs:subClassOf* ex:Book ;
         rdfs:label ?label .
  FILTER(LANG(?label) = "en")
}
```
