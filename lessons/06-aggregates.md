---
title: Counting and grouping
section: SPARQL basics
---

# Aggregates: COUNT, SUM, AVG, GROUP BY

Aggregates turn many rows into one summary value.

```sparql
PREFIX ex: <http://example.org/library#>

SELECT (COUNT(?b) AS ?books) (SUM(?pages) AS ?totalPages) (AVG(?pages) AS ?avg)
WHERE { ?b a ex:Book ; ex:pages ?pages }
```

`(expression AS ?name)` gives the computed column a name. Other aggregates are `MIN`, `MAX`, `SAMPLE` and `GROUP_CONCAT`.

## GROUP BY: one summary per group

How many books per genre?

```sparql
PREFIX ex: <http://example.org/library#>

SELECT ?genre (COUNT(?b) AS ?n)
WHERE { ?b a ex:Book ; ex:genre ?genre }
GROUP BY ?genre
ORDER BY DESC(?n)
```

**Rule:** every variable you `SELECT` must either be in `GROUP BY` or be inside an aggregate.

## HAVING: filter the groups

`FILTER` tests individual rows *before* grouping. `HAVING` tests the groups *after*:

```sparql
PREFIX ex: <http://example.org/library#>

SELECT ?member (COUNT(?loan) AS ?loans)
WHERE { ?loan ex:borrower ?member }
GROUP BY ?member
HAVING (COUNT(?loan) >= 2)
```

## GROUP_CONCAT

This gathers values into one string:

```sparql
PREFIX ex: <http://example.org/library#>

SELECT ?name (GROUP_CONCAT(?title; separator=" | ") AS ?titles)
WHERE { ?b ex:author/ex:name ?name ; ex:title ?title }
GROUP BY ?name
```

(The `/` is a *property path*, covered in the next lesson.)

## Exercise

For each **author name**, count their books, and keep only authors with **more than one** book. Return `?name` and the count (call it whatever you like).

```turtle data
@prefix ex:  <http://example.org/library#> .
@prefix xsd: <http://www.w3.org/2001/XMLSchema#> .

# ---- Books ----
ex:frankenstein a ex:Book ; ex:title "Frankenstein" ;          ex:year 1818 ; ex:pages 280 ; ex:author ex:shelley ; ex:genre ex:Horror .
ex:dracula      a ex:Book ; ex:title "Dracula" ;               ex:year 1897 ; ex:pages 418 ; ex:author ex:stoker  ; ex:genre ex:Horror .
ex:pride        a ex:Book ; ex:title "Pride and Prejudice" ;   ex:year 1813 ; ex:pages 432 ; ex:author ex:austen  ; ex:genre ex:Romance .
ex:emma         a ex:Book ; ex:title "Emma" ;                  ex:year 1815 ; ex:pages 474 ; ex:author ex:austen  ; ex:genre ex:Romance .
ex:timeMachine  a ex:Book ; ex:title "The Time Machine" ;      ex:year 1895 ; ex:pages 118 ; ex:author ex:wells   ; ex:genre ex:SciFi .
ex:warOfWorlds  a ex:Book ; ex:title "The War of the Worlds" ; ex:year 1898 ; ex:pages 287 ; ex:author ex:wells   ; ex:genre ex:SciFi .
ex:mobyDick     a ex:Book ; ex:title "Moby-Dick" ;             ex:year 1851 ; ex:pages 635 ; ex:author ex:melville .

# ---- Authors ----
ex:shelley  a ex:Author ; ex:name "Mary Shelley" ;    ex:born 1797 ; ex:country "UK" .
ex:stoker   a ex:Author ; ex:name "Bram Stoker" ;     ex:born 1847 ; ex:country "Ireland" .
ex:austen   a ex:Author ; ex:name "Jane Austen" ;     ex:born 1775 ; ex:country "UK" .
ex:wells    a ex:Author ; ex:name "H. G. Wells" ;     ex:born 1866 ; ex:country "UK" .
ex:melville a ex:Author ; ex:name "Herman Melville" ; ex:born 1819 ; ex:country "USA" .

# ---- Members ----
ex:alice a ex:Member ; ex:name "Alice" ; ex:email "alice@example.org" .
ex:bob   a ex:Member ; ex:name "Bob" .
ex:chen  a ex:Member ; ex:name "Chen" ;  ex:email "chen@example.org" .

# ---- Loans ----
ex:loan1 a ex:Loan ; ex:borrower ex:alice ; ex:item ex:dracula     ; ex:due "2026-11-20"^^xsd:date .
ex:loan2 a ex:Loan ; ex:borrower ex:alice ; ex:item ex:emma        ; ex:due "2026-11-02"^^xsd:date .
ex:loan3 a ex:Loan ; ex:borrower ex:chen  ; ex:item ex:timeMachine ; ex:due "2026-11-15"^^xsd:date .
```

```sparql query
PREFIX ex: <http://example.org/library#>

SELECT ?name
WHERE {
  ?b ex:author ?a .
  ?a ex:name ?name .
}
```

```sparql solution
PREFIX ex: <http://example.org/library#>

SELECT ?name (COUNT(?b) AS ?books)
WHERE {
  ?b ex:author ?a .
  ?a ex:name ?name .
}
GROUP BY ?name
HAVING (COUNT(?b) > 1)
```
