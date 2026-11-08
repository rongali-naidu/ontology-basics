---
title: Classes and subclasses
section: RDFS
reasoning: none
check_reasoning: rdfs
---

# RDFS: your first vocabulary

So far `ex:Book` has just been a name. **RDF Schema (RDFS)** lets us say what our terms *mean*, so a machine can draw conclusions from them.

The two most important words are:

- `rdfs:Class`: "this is a category of things"
- `rdfs:subClassOf`: "every member of A is also a member of B"

```turtle
ex:Novel        rdfs:subClassOf ex:Book .
ex:Book         rdfs:subClassOf ex:Publication .
```

## Inference: facts you never wrote

The data says `ex:frankenstein a ex:Novel`. It never says Frankenstein is a `Publication`. But it *must* be: a novel is a book, and a book is a publication.

1. Run the query. It asks for all `ex:Publication`s and finds **nothing**, because SPARQL only sees triples that are actually stored.
2. Switch **Reasoning** (above the data) to **RDFS** and run again.

Now every book, novel, graphic novel and magazine appears. The reasoner **inferred** new triples. Click the "**N inferred**" link under the data to see each one.

The key rule is tiny (**rdfs9**):

```
IF   ?x a ?C   AND   ?C rdfs:subClassOf ?D
THEN ?x a ?D
```

`rdfs:subClassOf` is also transitive (**rdfs11**): a GraphicNovel is a Novel, a Novel is a Book, so a GraphicNovel is a Book.

> **Mental model:** an ontology is *data about your data*. The schema (classes, properties) and the instances live in the same graph and are queried in the same way.

## Exercise

The library also has a magazine, `ex:natGeo`. Add **one schema triple** so that `ex:Magazine` is a subclass of a new class **`ex:Periodical`**. With RDFS reasoning on, `ex:natGeo` should then be inferred to be an `ex:Periodical`.

Don't type `ex:natGeo a ex:Periodical` yourself. Let the reasoner do it!

```turtle data
@prefix ex:   <http://example.org/library#> .
@prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .

# ---- Schema ----
ex:Publication  a rdfs:Class .
ex:Book         a rdfs:Class ; rdfs:subClassOf ex:Publication .
ex:Novel        a rdfs:Class ; rdfs:subClassOf ex:Book .
ex:GraphicNovel a rdfs:Class ; rdfs:subClassOf ex:Novel .
ex:Magazine     a rdfs:Class ; rdfs:subClassOf ex:Publication .

# ---- Instances ----
ex:frankenstein a ex:Novel ;        ex:title "Frankenstein" .
ex:watchmen     a ex:GraphicNovel ; ex:title "Watchmen" .
ex:cookbook     a ex:Book ;         ex:title "Victorian Cookery" .
ex:natGeo       a ex:Magazine ;     ex:title "National Geographic" .
```

```sparql query
PREFIX ex: <http://example.org/library#>

SELECT ?thing ?title
WHERE { ?thing a ex:Publication ; ex:title ?title }
```

```sparql check
PREFIX ex:   <http://example.org/library#>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
ASK { ex:Magazine rdfs:subClassOf ex:Periodical . ex:natGeo a ex:Periodical }
```

```turtle solution-data
@prefix ex:   <http://example.org/library#> .
@prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .

# ---- Schema ----
ex:Publication  a rdfs:Class .
ex:Book         a rdfs:Class ; rdfs:subClassOf ex:Publication .
ex:Novel        a rdfs:Class ; rdfs:subClassOf ex:Book .
ex:GraphicNovel a rdfs:Class ; rdfs:subClassOf ex:Novel .
ex:Magazine     a rdfs:Class ; rdfs:subClassOf ex:Publication .
ex:Magazine     rdfs:subClassOf ex:Periodical .

# ---- Instances ----
ex:frankenstein a ex:Novel ;        ex:title "Frankenstein" .
ex:watchmen     a ex:GraphicNovel ; ex:title "Watchmen" .
ex:cookbook     a ex:Book ;         ex:title "Victorian Cookery" .
ex:natGeo       a ex:Magazine ;     ex:title "National Geographic" .
```
