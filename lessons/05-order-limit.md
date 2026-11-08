---
title: ORDER BY, LIMIT, DISTINCT
section: SPARQL basics
---

# Shaping the result list

Results come back in no particular order. These keywords go **after** the `WHERE { … }` block.

## ORDER BY

```sparql
PREFIX ex: <http://example.org/library#>

SELECT ?title ?year
WHERE { ?b ex:title ?title ; ex:year ?year }
ORDER BY ?year
```

Use `DESC(?year)` for newest first. You can sort by several keys: `ORDER BY ?country DESC(?born)`.

## LIMIT and OFFSET

`LIMIT 3` keeps only the first three rows. `OFFSET 3 LIMIT 3` gives the next "page" of three. Without `ORDER BY`, *which* rows you get is undefined, so always sort before limiting.

## DISTINCT

Which countries do our authors come from? Run this, and you'll see "UK" three times:

```sparql
PREFIX ex: <http://example.org/library#>

SELECT ?country
WHERE { ?a a ex:Author ; ex:country ?country }
```

Add `DISTINCT` to remove duplicate rows:

```sparql
PREFIX ex: <http://example.org/library#>

SELECT DISTINCT ?country
WHERE { ?a a ex:Author ; ex:country ?country }
ORDER BY ?country
```

## Exercise

Find the **three longest books**, longest first. Return `?title ?pages`.

The order is checked too, so you'll need `ORDER BY`.

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

SELECT ?title ?pages
WHERE { ?b ex:title ?title ; ex:pages ?pages }
```

```sparql solution
PREFIX ex: <http://example.org/library#>

SELECT ?title ?pages
WHERE { ?b ex:title ?title ; ex:pages ?pages }
ORDER BY DESC(?pages)
LIMIT 3
```
