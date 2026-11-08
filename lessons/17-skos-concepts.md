---
title: Concepts, schemes and labels
section: SKOS
reasoning: none
---

# SKOS: vocabularies for people

Not everything needs the logical precision of OWL. Subject headings, genre lists, keyword taxonomies and thesauri are about **organising concepts and their names**. That's what **SKOS** (Simple Knowledge Organization System) is for.

> **OWL classes vs SKOS concepts.** `ex:Novel` as an OWL class means *the set of all novels*, and membership has logical consequences. `ex:Horror` as a SKOS concept is *a subject heading you can tag things with*. A book is not an "instance of Horror". It is *about* or *in the genre of* Horror.

## The core terms

```turtle
ex:genres a skos:ConceptScheme ;
    skos:prefLabel "Library genres"@en .

ex:SciFi a skos:Concept ;
    skos:inScheme   ex:genres ;
    skos:prefLabel  "Science fiction"@en , "Science-fiction"@fr ;
    skos:altLabel   "Sci-Fi"@en , "SF"@en ;
    skos:hiddenLabel "Scifi"@en ;
    skos:definition "Fiction based on imagined future science or technology."@en .
```

| Property | Meaning |
|---|---|
| `skos:prefLabel` | **the** preferred name: at most one per language |
| `skos:altLabel` | synonyms, abbreviations, other names |
| `skos:hiddenLabel` | misspellings: useful for search, never displayed |
| `skos:definition`, `skos:scopeNote`, `skos:example` | documentation notes |
| `skos:notation` | a code, like `"FIC-SF"` |
| `skos:inScheme`, `skos:hasTopConcept` | which scheme a concept belongs to |

## Labels make search work

A user types "SF". Which genre do they mean? Search **all** label kinds:

```sparql
PREFIX skos: <http://www.w3.org/2004/02/skos/core#>

SELECT ?concept ?pref
WHERE {
  ?concept skos:prefLabel|skos:altLabel|skos:hiddenLabel "SF"@en ;
           skos:prefLabel ?pref .
  FILTER(LANG(?pref) = "en")
}
```

Then always **display** the `prefLabel`, in the user's language if one exists.

## Exercise

Write a query that finds the concept whose **preferred or alternative label** equals **"sci-fi"**, ignoring upper/lower case and the language tag. Return only `?concept`.

*Hint:* `FILTER(LCASE(STR(?label)) = "sci-fi")`. `STR()` drops the language tag.

```turtle data
@prefix ex:   <http://example.org/library#> .
@prefix skos: <http://www.w3.org/2004/02/skos/core#> .

ex:genres a skos:ConceptScheme ;
    skos:prefLabel "Library genres"@en ;
    skos:hasTopConcept ex:Fiction , ex:NonFiction .

ex:Fiction a skos:Concept ; skos:inScheme ex:genres ;
    skos:prefLabel "Fiction"@en , "Fiction"@fr ;
    skos:notation "FIC" .

ex:NonFiction a skos:Concept ; skos:inScheme ex:genres ;
    skos:prefLabel "Non-fiction"@en , "Documentaire"@fr ;
    skos:altLabel "Nonfiction"@en ;
    skos:notation "NF" .

ex:SciFi a skos:Concept ; skos:inScheme ex:genres ;
    skos:prefLabel  "Science fiction"@en , "Science-fiction"@fr ;
    skos:altLabel   "Sci-Fi"@en , "SF"@en ;
    skos:hiddenLabel "Scifi"@en ;
    skos:definition "Fiction based on imagined future science or technology."@en ;
    skos:notation "FIC-SF" .

ex:Horror a skos:Concept ; skos:inScheme ex:genres ;
    skos:prefLabel "Horror"@en , "Épouvante"@fr ;
    skos:altLabel  "Gothic horror"@en ;
    skos:notation "FIC-HOR" .

ex:Romance a skos:Concept ; skos:inScheme ex:genres ;
    skos:prefLabel "Romance"@en , "Roman d'amour"@fr ;
    skos:notation "FIC-ROM" .
```

```sparql query
PREFIX skos: <http://www.w3.org/2004/02/skos/core#>

SELECT ?concept ?en ?fr ?code
WHERE {
  ?concept a skos:Concept ; skos:notation ?code .
  OPTIONAL { ?concept skos:prefLabel ?en FILTER(LANG(?en) = "en") }
  OPTIONAL { ?concept skos:prefLabel ?fr FILTER(LANG(?fr) = "fr") }
}
ORDER BY ?code
```

```sparql solution
PREFIX skos: <http://www.w3.org/2004/02/skos/core#>

SELECT DISTINCT ?concept
WHERE {
  ?concept skos:prefLabel|skos:altLabel ?label .
  FILTER(LCASE(STR(?label)) = "sci-fi")
}
```
