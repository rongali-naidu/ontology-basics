---
title: Property paths, UNION, BIND
section: SPARQL basics
---

# Walking the graph

## Property paths

A **property path** follows several links in one step. These two queries are equivalent:

```sparql
PREFIX ex: <http://example.org/library#>

SELECT ?title ?name
WHERE { ?b ex:title ?title ; ex:author ?a . ?a ex:name ?name }
```

```sparql
PREFIX ex: <http://example.org/library#>

SELECT ?title ?name
WHERE { ?b ex:title ?title ; ex:author/ex:name ?name }
```

| Path | Meaning |
|---|---|
| `p/q` | follow `p`, then `q` |
| `^p` | follow `p` **backwards** |
| `p\|q` | either `p` or `q` |
| `p*` | zero or more `p` steps |
| `p+` | one or more `p` steps |
| `p?` | zero or one `p` step |

`*` and `+` are especially useful for hierarchies, as you'll see in the RDFS lessons.

## UNION: "either this pattern or that one"

```sparql
PREFIX ex: <http://example.org/library#>

SELECT ?thing ?label
WHERE {
  { ?thing ex:title ?label }
  UNION
  { ?thing ex:name ?label }
}
```

## BIND and VALUES

`BIND` computes a new variable. `VALUES` supplies a fixed list of values to try.

```sparql
PREFIX ex: <http://example.org/library#>

SELECT ?title ?ageAtWriting
WHERE {
  VALUES ?b { ex:frankenstein ex:dracula }
  ?b ex:title ?title ; ex:year ?y ; ex:author/ex:born ?born .
  BIND(?y - ?born AS ?ageAtWriting)
}
```

Mary Shelley published *Frankenstein* at 21!

## Exercise

Using **one property path**, find the **names of the authors** whose books **Alice** (`ex:alice`) has borrowed. Return only `?name`.

*Hint:* start from a loan: `?loan ex:borrower ex:alice ; ex:item/…`

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
  ?loan ex:borrower ex:alice .

}
```

```sparql solution
PREFIX ex: <http://example.org/library#>

SELECT ?name
WHERE {
  ?loan ex:borrower ex:alice ;
        ex:item/ex:author/ex:name ?name .
}
```
