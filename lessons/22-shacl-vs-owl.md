---
title: SHACL and OWL together
section: SHACL
tab: data
expect_focus:
---

# Inference vs validation

You've now seen both sides. Here's the same intention, *"the author of a book is a person"*, written both ways:

```turtle
# OWL / RDFS: an inference rule
ex:author rdfs:range ex:Person .

# SHACL: a constraint
ex:BookShape sh:property [ sh:path ex:author ; sh:class ex:Person ] .
```

| | OWL / RDFS | SHACL |
|---|---|---|
| World view | open: missing = unknown | closed: missing = violation |
| `ex:x ex:author ex:y`, and `ex:y` has no type | **infers** `ex:y a ex:Person` | **reports** a violation |
| Book with no author | fine, the author is just unknown | violation if `sh:minCount 1` |
| Result | more triples | a validation report |
| Good for | integrating data, classification, query convenience | data quality, forms, APIs, pipelines |

They work well **together**: reason first to add the facts that follow logically, then validate the result. This playground does exactly that. With Reasoning on, the inferred triples are included in SHACL validation.

## Try it

1. Press **Validate ✓**. `ex:shelley` has no type, so `sh:class ex:Person` fails, and `ex:mystery` has no author at all.
2. Switch Reasoning to **RDFS** and validate again. The `range` axiom *infers* that Shelley is a Person, so that violation disappears. The missing author is still reported. No amount of inference can invent a value that isn't there.

## Exercise

Make the data **conform**: the report should be empty. You may use reasoning, edit the data, or both, but don't change the shapes. Ask yourself which fix is *right*: should `ex:shelley` get her type from inference, or be stated explicitly?

```turtle shapes
@prefix sh:  <http://www.w3.org/ns/shacl#> .
@prefix ex:  <http://example.org/library#> .

ex:BookShape
    a sh:NodeShape ;
    sh:targetClass ex:Book ;
    sh:property [ sh:path ex:title  ; sh:minCount 1 ] ;
    sh:property [ sh:path ex:author ; sh:minCount 1 ; sh:class ex:Person ] .
```

```turtle data
@prefix ex:   <http://example.org/library#> .
@prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .

# ---- Ontology ----
ex:author rdfs:range ex:Person .

# ---- Data ----
ex:frankenstein a ex:Book ; ex:title "Frankenstein" ; ex:author ex:shelley .
ex:dracula      a ex:Book ; ex:title "Dracula" ;      ex:author ex:stoker .
ex:mystery      a ex:Book ; ex:title "The Unknown Manuscript" .

ex:stoker  a ex:Person ; ex:name "Bram Stoker" .
ex:shelley ex:name "Mary Shelley" .
```

```turtle solution-data
@prefix ex:   <http://example.org/library#> .
@prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .

# ---- Ontology ----
ex:author rdfs:range ex:Person .

# ---- Data ----
ex:frankenstein a ex:Book ; ex:title "Frankenstein" ; ex:author ex:shelley .
ex:dracula      a ex:Book ; ex:title "Dracula" ;      ex:author ex:stoker .
ex:mystery      a ex:Book ; ex:title "The Unknown Manuscript" ; ex:author ex:anonymous .

ex:stoker    a ex:Person ; ex:name "Bram Stoker" .
ex:shelley   a ex:Person ; ex:name "Mary Shelley" .
ex:anonymous a ex:Person ; ex:name "Anonymous" .
```
