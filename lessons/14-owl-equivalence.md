---
title: sameAs and equivalence
section: OWL
reasoning: owl
check_reasoning: owl
---

# Linking data from different sources

Imagine merging our library data with an external **catalogue** that uses its own IRIs (prefix `cat:`). It's the same world described with different names.

## owl:sameAs: two IRIs, one thing

```turtle
ex:austen owl:sameAs cat:JaneAusten .
```

Everything said about one IRI now holds for the other. Query `ex:austen` and you also get the catalogue's facts, such as her birthplace:

```sparql
PREFIX ex: <http://example.org/library#>

SELECT ?p ?o WHERE { ex:austen ?p ?o }
```

This is how Linked Data stitches datasets together. Wikidata, DBpedia and library catalogues all publish `sameAs` links.

> ⚠ `sameAs` is very strong. If you link two things that are only *similar*, every fact about one leaks onto the other. For "close but not identical" links, use SKOS mapping properties instead (see the SKOS lessons).

## owl:equivalentClass and owl:equivalentProperty

Classes and properties can be equivalent too:

```turtle
ex:Author owl:equivalentClass cat:Writer .
ex:name   owl:equivalentProperty cat:fullName .
```

`equivalentClass` means each class is a subclass of the other, so their members are the same. Now one query in *your* vocabulary also covers the catalogue's data:

```sparql
PREFIX ex: <http://example.org/library#>

SELECT ?who ?name WHERE { ?who a ex:Author ; ex:name ?name }
```

Jules Verne exists only in the catalogue, yet he appears as an `ex:Author` with an `ex:name`.

## Exercise

The catalogue says `cat:HGWells` was born in **"Bromley"**. Link our `ex:wells` to it with **one triple**, so that this query returns `"Bromley"`:

```sparql
PREFIX ex:  <http://example.org/library#>
PREFIX cat: <http://catalogue.example.org/>

SELECT ?place WHERE { ex:wells cat:birthPlace ?place }
```

```turtle data
@prefix ex:  <http://example.org/library#> .
@prefix cat: <http://catalogue.example.org/> .
@prefix owl: <http://www.w3.org/2002/07/owl#> .

# ---- Our library ----
ex:austen a ex:Author ; ex:name "Jane Austen" .
ex:wells  a ex:Author ; ex:name "H. G. Wells" .

# ---- External catalogue ----
cat:JaneAusten a cat:Writer ; cat:fullName "Jane Austen" ; cat:birthPlace "Steventon" .
cat:HGWells    a cat:Writer ; cat:fullName "Herbert George Wells" ; cat:birthPlace "Bromley" .
cat:JulesVerne a cat:Writer ; cat:fullName "Jules Verne" ; cat:birthPlace "Nantes" .

# ---- Links between the two ----
ex:austen owl:sameAs cat:JaneAusten .
ex:Author owl:equivalentClass cat:Writer .
ex:name   owl:equivalentProperty cat:fullName .
```

```sparql query
PREFIX ex: <http://example.org/library#>

SELECT ?p ?o WHERE { ex:austen ?p ?o }
```

```sparql check
PREFIX ex:  <http://example.org/library#>
PREFIX cat: <http://catalogue.example.org/>
ASK { ex:wells cat:birthPlace "Bromley" }
```

```turtle solution-data
@prefix ex:  <http://example.org/library#> .
@prefix cat: <http://catalogue.example.org/> .
@prefix owl: <http://www.w3.org/2002/07/owl#> .

# ---- Our library ----
ex:austen a ex:Author ; ex:name "Jane Austen" .
ex:wells  a ex:Author ; ex:name "H. G. Wells" .

# ---- External catalogue ----
cat:JaneAusten a cat:Writer ; cat:fullName "Jane Austen" ; cat:birthPlace "Steventon" .
cat:HGWells    a cat:Writer ; cat:fullName "Herbert George Wells" ; cat:birthPlace "Bromley" .
cat:JulesVerne a cat:Writer ; cat:fullName "Jules Verne" ; cat:birthPlace "Nantes" .

# ---- Links between the two ----
ex:austen owl:sameAs cat:JaneAusten .
ex:wells  owl:sameAs cat:HGWells .
ex:Author owl:equivalentClass cat:Writer .
ex:name   owl:equivalentProperty cat:fullName .
```
