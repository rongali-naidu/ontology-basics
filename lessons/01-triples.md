---
title: Triples and IRIs
section: Foundations
---

# Everything is a triple

RDF (Resource Description Framework) describes the world with **triples**. Each triple is one statement made of three parts:

| subject | predicate | object |
|---|---|---|
| Frankenstein | was written by | Mary Shelley |
| Mary Shelley | was born in | 1797 |

Triples that share a subject or object join up into a **graph**. Here `ex:shelley` links the two facts:

```
ex:frankenstein ──ex:author──▶ ex:shelley ──ex:born──▶ 1797
```

## IRIs name things

To avoid confusing "Mary Shelley the author" with someone else of the same name, RDF names things with **IRIs**: web-style global identifiers.

```
<http://example.org/library#shelley>
```

Writing full IRIs is tiring, so we declare a **prefix** once and use short names after that:

```turtle
@prefix ex: <http://example.org/library#> .
# now ex:shelley means <http://example.org/library#shelley>
```

Subjects and predicates are always IRIs (subjects can also be *blank nodes*, covered in the next lesson). Objects can be IRIs or **literals**: plain values such as `"Frankenstein"` or `1797`.

> **Why IRIs?** Anyone can publish triples about `ex:shelley`, and when the graphs are merged the statements line up automatically. That makes RDF good for *linking* data.

## Look at the data

Each line in the Data panel ends with a full stop `.` and is exactly one triple. Run the query to list them all. Notice how the results table shows the short `ex:` names.

## Exercise

Add a triple stating that **`ex:dracula`** has **`ex:author`** **`ex:stoker`**. Run the query to see it, then press **Check my answer**.

```turtle data
@prefix ex: <http://example.org/library#> .

ex:frankenstein ex:author ex:shelley .
ex:frankenstein ex:title  "Frankenstein" .
ex:shelley      ex:name   "Mary Shelley" .
ex:shelley      ex:born   1797 .
ex:dracula      ex:title  "Dracula" .
```

```sparql query
SELECT ?subject ?predicate ?object
WHERE { ?subject ?predicate ?object }
```

```sparql check
PREFIX ex: <http://example.org/library#>
ASK { ex:dracula ex:author ex:stoker }
```

```turtle solution-data
@prefix ex: <http://example.org/library#> .

ex:frankenstein ex:author ex:shelley .
ex:frankenstein ex:title  "Frankenstein" .
ex:shelley      ex:name   "Mary Shelley" .
ex:shelley      ex:born   1797 .
ex:dracula      ex:title  "Dracula" .
ex:dracula      ex:author ex:stoker .
```
