---
title: Turtle syntax
section: Foundations
---

# Writing RDF comfortably: Turtle

**Turtle** is the most readable way to write RDF. A few shortcuts make it compact.

## `;` repeats the subject, `,` repeats subject and predicate

```turtle
@prefix ex: <http://example.org/library#> .

ex:pride ex:title "Pride and Prejudice" ;     # same subject…
         ex:author ex:austen ;                 # …again
         ex:subject ex:Marriage , ex:Class .   # two objects for one predicate
```

That's four triples, and the final `.` ends the group.

## `a` means `rdf:type`

`ex:pride a ex:Book .` says *"pride is a Book"*. The word `a` is short for the IRI `rdf:type`, which you'll use constantly.

## Literals: strings, numbers, dates and languages

| Turtle | Meaning |
|---|---|
| `"Emma"` | a plain string |
| `"Emma"@en` | a string tagged as English |
| `"Emma"@fr` | the same text tagged as French: a *different* literal |
| `1815` | shorthand for `"1815"^^xsd:integer` |
| `3.5` | an `xsd:decimal` |
| `true` | an `xsd:boolean` |
| `"2026-11-20"^^xsd:date` | a typed date (`xsd:` must be declared) |

Datatypes matter: `1815` and `"1815"` are **different** values, and only the first sorts and compares as a number.

## Blank nodes: things without a name

Sometimes a thing has no IRI of its own, such as an address. `[ … ]` creates an anonymous **blank node**:

```turtle-add
@prefix ex: <http://example.org/library#> .

ex:austen ex:address [ ex:city "Bath" ; ex:country "UK" ] .
```

Press **+ Add to data** under the snippet, then look at the results: the address appears as `_:something`.

## Comments

`#` starts a comment that runs to the end of the line.

## Exercise

Add the book **`ex:emma`** to the data using `;`, with these four facts:

- it is `a ex:Book`
- `ex:title` is `"Emma"` **tagged as English** (`@en`)
- `ex:year` is the integer `1815`
- `ex:author` is `ex:austen`

If you make a syntax error, the bar under the data editor turns red and tells you where.

```turtle data
@prefix ex:  <http://example.org/library#> .
@prefix xsd: <http://www.w3.org/2001/XMLSchema#> .

ex:pride a ex:Book ;
    ex:title  "Pride and Prejudice"@en , "Orgueil et Préjugés"@fr ;
    ex:year   1813 ;
    ex:author ex:austen .

ex:austen a ex:Author ;
    ex:name "Jane Austen" ;
    ex:born "1775-12-16"^^xsd:date .

# Add ex:emma below this line

```

```sparql query
SELECT ?s ?p ?o
WHERE { ?s ?p ?o }
```

```sparql check
PREFIX ex: <http://example.org/library#>
ASK { ex:emma a ex:Book ; ex:title "Emma"@en ; ex:year 1815 ; ex:author ex:austen }
```

```turtle solution-data
@prefix ex:  <http://example.org/library#> .
@prefix xsd: <http://www.w3.org/2001/XMLSchema#> .

ex:pride a ex:Book ;
    ex:title  "Pride and Prejudice"@en , "Orgueil et Préjugés"@fr ;
    ex:year   1813 ;
    ex:author ex:austen .

ex:austen a ex:Author ;
    ex:name "Jane Austen" ;
    ex:born "1775-12-16"^^xsd:date .

ex:emma a ex:Book ;
    ex:title  "Emma"@en ;
    ex:year   1815 ;
    ex:author ex:austen .
```
