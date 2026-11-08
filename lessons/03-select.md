---
title: SELECT and graph patterns
section: SPARQL basics
---

# Asking questions with SELECT

From now on the playground holds a small **library**: books, authors, members and loans. Scroll through the data first to get a feel for it.

A SPARQL query is a **pattern of triples with holes in it**. The holes are **variables** that start with `?`. The engine finds every way to fill the holes so that every triple in the pattern exists in the data.

```sparql
PREFIX ex: <http://example.org/library#>

SELECT ?book ?title
WHERE {
  ?book a ex:Book .
  ?book ex:title ?title .
}
```

Read it as: *"find `?book` and `?title` such that `?book` is a Book **and** `?book` has title `?title`."* Each row of results is one way of filling the holes.

## Joins come for free

Using the **same variable** in two patterns connects them, and that's a join. This finds each book with its author's name:

```sparql
PREFIX ex: <http://example.org/library#>

SELECT ?title ?name
WHERE {
  ?book   ex:title  ?title ;
          ex:author ?author .
  ?author ex:name   ?name .
}
```

Notice that `;` works in queries just as it does in Turtle.

## Things to know

- `PREFIX` lines work like Turtle's `@prefix` (no `@`, no final dot).
- `SELECT *` returns every variable.
- Fixed values in a pattern, like `ex:austen` or `"Emma"`, must match **exactly**, including language tags and datatypes.
- Variables in `SELECT` that never get a value show as **—** in the results.

## Exercise

List the **titles of all books written by the author whose `ex:name` is `"Jane Austen"`**. Don't use `ex:austen` directly: find the author through the name. Return only `?title`.

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

SELECT ?book ?title
WHERE {
  ?book a ex:Book .
  ?book ex:title ?title .
}
```

```sparql solution
PREFIX ex: <http://example.org/library#>

SELECT ?title
WHERE {
  ?author ex:name "Jane Austen" .
  ?book   ex:author ?author ;
          ex:title  ?title .
}
```
