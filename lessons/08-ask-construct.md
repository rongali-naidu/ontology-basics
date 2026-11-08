---
title: ASK and CONSTRUCT
section: SPARQL basics
---

# Other query forms

`SELECT` returns a table. SPARQL has two other forms you'll use often.

## ASK: yes or no

`ASK` returns `true` if the pattern matches at least once:

```sparql
PREFIX ex:  <http://example.org/library#>
PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>

# Is any loan overdue on 10 November 2026?
ASK {
  ?loan ex:due ?due .
  FILTER(?due < "2026-11-10"^^xsd:date)
}
```

`ASK` is how the **Check my answer** button tests some of your exercises.

## CONSTRUCT: build new triples

`CONSTRUCT` uses the matches to build a **new graph** from a template. That makes it great for reshaping data or converting it to another vocabulary:

```sparql
PREFIX ex:     <http://example.org/library#>
PREFIX schema: <https://schema.org/>

CONSTRUCT {
  ?b a schema:Book ;
     schema:name ?title ;
     schema:datePublished ?year .
}
WHERE {
  ?b a ex:Book ; ex:title ?title ; ex:year ?year .
}
```

The results panel shows the triples that would be created. They aren't added to your data.

> **Coming up:** CONSTRUCT is also the basis of *rules*. A reasoner is basically "run CONSTRUCT rules until nothing new appears". Click **rules** above the data panel to see the ones this site uses.

## DESCRIBE

`DESCRIBE ex:austen` asks the engine for "everything useful about" a resource. What gets returned depends on the engine, so it's handy for exploring but not for precise work.

## Exercise

Write a `CONSTRUCT` query that creates the **reverse** of every authorship link: for each `?book ex:author ?person`, build the triple **`?person ex:wrote ?book`**.

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

CONSTRUCT {

}
WHERE {

}
```

```sparql solution
PREFIX ex: <http://example.org/library#>

CONSTRUCT { ?person ex:wrote ?book }
WHERE     { ?book ex:author ?person }
```
