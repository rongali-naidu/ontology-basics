---
title: FILTER and OPTIONAL
section: SPARQL basics
---

# Narrowing down and filling gaps

## FILTER keeps rows that pass a test

```sparql
PREFIX ex: <http://example.org/library#>

SELECT ?title ?pages
WHERE {
  ?book ex:title ?title ; ex:pages ?pages .
  FILTER(?pages < 300)
}
```

Useful things inside `FILTER`:

| Expression | Meaning |
|---|---|
| `?x > 5 && ?x <= 10` | comparisons with *and*; `\|\|` is *or*, `!` is *not* |
| `?a != ?b` | not equal |
| `CONTAINS(?title, "War")` | text contains |
| `REGEX(?title, "^the", "i")` | regular expression (`"i"` = ignore case) |
| `LANG(?label) = "en"` | language tag of a literal |
| `BOUND(?email)` | does the variable have a value? |

## OPTIONAL: "if it exists"

In a normal pattern, **every** triple must match. Bob has no email, so he vanishes here:

```sparql
PREFIX ex: <http://example.org/library#>

SELECT ?name ?email
WHERE { ?m a ex:Member ; ex:name ?name ; ex:email ?email . }
```

Wrap the uncertain part in `OPTIONAL { … }` to keep the row and leave the variable empty:

```sparql
PREFIX ex: <http://example.org/library#>

SELECT ?name ?email
WHERE {
  ?m a ex:Member ; ex:name ?name .
  OPTIONAL { ?m ex:email ?email }
}
```

## FILTER NOT EXISTS: "this doesn't exist"

To find members **without** an email:

```sparql
PREFIX ex: <http://example.org/library#>

SELECT ?name
WHERE {
  ?m a ex:Member ; ex:name ?name .
  FILTER NOT EXISTS { ?m ex:email ?e }
}
```

## Exercise

List the **title, year and genre** of every book published **after 1850**. Include books that have **no genre** too (one of them doesn't). Return `?title ?year ?genre`.

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

SELECT ?title ?year ?genre
WHERE {
  ?book a ex:Book ; ex:title ?title ; ex:year ?year .

}
```

```sparql solution
PREFIX ex: <http://example.org/library#>

SELECT ?title ?year ?genre
WHERE {
  ?book a ex:Book ; ex:title ?title ; ex:year ?year .
  OPTIONAL { ?book ex:genre ?genre }
  FILTER(?year > 1850)
}
```
