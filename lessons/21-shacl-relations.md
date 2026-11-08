---
title: Checking links between nodes
section: SHACL
expect_focus: ex:loan2 ex:loan3 ex:loan4
---

# Shapes that follow links

Real data is a graph, so constraints often care about **what a link points to**.

## sh:class: the value must be an instance of a class

```turtle
sh:property [ sh:path ex:borrower ; sh:class ex:Member ] .
```

The value must have `rdf:type ex:Member`, either directly or through `rdfs:subClassOf` triples **in the data graph**. That's the only "reasoning" SHACL does by itself.

## sh:node: the value must conform to another shape

Shapes can reuse each other:

```turtle
ex:LoanShape sh:property [ sh:path ex:borrower ; sh:node ex:ActiveMemberShape ] .
ex:ActiveMemberShape a sh:NodeShape ;
    sh:property [ sh:path ex:status ; sh:in ( "active" ) ] .
```

## Logic and paths

- `sh:or`, `sh:and`, `sh:not` and `sh:xone` combine shapes.
- `sh:path` accepts paths too: `( ex:item ex:author )` follows two steps, `[ sh:inversePath ex:borrower ]` goes backwards, and `[ sh:zeroOrMorePath skos:broader ]` walks a hierarchy.
- `sh:closed true` rejects any property the shape doesn't mention.

## Exercise

The loan shape checks the **borrower** and the **due date**. Add a property shape for **`ex:item`**:

- the item must be an instance of **`ex:Book`** (`sh:class`), and
- a loan has **exactly one** item.

The report should then flag exactly **`ex:loan2`** (a book as borrower!), **`ex:loan3`** (a person as item) and **`ex:loan4`** (two items). `ex:loan5` lends a `ex:Novel`, which is fine, because `ex:Novel rdfs:subClassOf ex:Book` is in the data.

```turtle shapes
@prefix sh:  <http://www.w3.org/ns/shacl#> .
@prefix xsd: <http://www.w3.org/2001/XMLSchema#> .
@prefix ex:  <http://example.org/library#> .

ex:LoanShape
    a sh:NodeShape ;
    sh:targetClass ex:Loan ;
    sh:property [
        sh:path ex:borrower ;
        sh:minCount 1 ; sh:maxCount 1 ;
        sh:class ex:Member
    ] ;
    sh:property [
        sh:path ex:due ;
        sh:minCount 1 ;
        sh:datatype xsd:date
    ] .
```

```turtle data
@prefix ex:   <http://example.org/library#> .
@prefix xsd:  <http://www.w3.org/2001/XMLSchema#> .
@prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .

ex:Novel rdfs:subClassOf ex:Book .

ex:alice   a ex:Member .
ex:chen    a ex:Member .
ex:dracula a ex:Book .
ex:emma    a ex:Book .
ex:frankenstein a ex:Novel .

ex:loan1 a ex:Loan ; ex:borrower ex:alice   ; ex:item ex:dracula ; ex:due "2026-11-20"^^xsd:date .
ex:loan2 a ex:Loan ; ex:borrower ex:dracula ; ex:item ex:emma    ; ex:due "2026-11-21"^^xsd:date .
ex:loan3 a ex:Loan ; ex:borrower ex:chen    ; ex:item ex:alice   ; ex:due "2026-11-22"^^xsd:date .
ex:loan4 a ex:Loan ; ex:borrower ex:chen    ; ex:item ex:emma , ex:dracula ; ex:due "2026-11-23"^^xsd:date .
ex:loan5 a ex:Loan ; ex:borrower ex:alice   ; ex:item ex:frankenstein ; ex:due "2026-11-24"^^xsd:date .
```

```turtle solution-shapes
@prefix sh:  <http://www.w3.org/ns/shacl#> .
@prefix xsd: <http://www.w3.org/2001/XMLSchema#> .
@prefix ex:  <http://example.org/library#> .

ex:LoanShape
    a sh:NodeShape ;
    sh:targetClass ex:Loan ;
    sh:property [
        sh:path ex:borrower ;
        sh:minCount 1 ; sh:maxCount 1 ;
        sh:class ex:Member
    ] ;
    sh:property [
        sh:path ex:item ;
        sh:minCount 1 ; sh:maxCount 1 ;
        sh:class ex:Book
    ] ;
    sh:property [
        sh:path ex:due ;
        sh:minCount 1 ;
        sh:datatype xsd:date
    ] .
```
