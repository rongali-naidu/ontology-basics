---
title: Datatypes, patterns, ranges
section: SHACL
expect_focus: ex:bob ex:chen ex:dana
---

# Constraining values

Counting values is only the start. SHACL can check what the values **look like**.

| Constraint | Checks |
|---|---|
| `sh:datatype xsd:integer` | literal has this datatype |
| `sh:nodeKind sh:IRI` | value is an IRI (or `sh:Literal`, `sh:BlankNode` …) |
| `sh:pattern "^[A-Z]"` | the string matches a regular expression (`sh:flags "i"` ignores case) |
| `sh:minLength 2`, `sh:maxLength 50` | string length |
| `sh:minInclusive 0`, `sh:maxExclusive 150` | numeric (or date) range |
| `sh:in ( "gold" "silver" )` | value is one of a fixed list |
| `sh:languageIn ( "en" "fr" )` | allowed language tags |
| `sh:uniqueLang true` | at most one value per language |

The starting shape checks member emails with a pattern. Validate, and you'll see Bob's `"bob-at-example.org"` rejected.

> **Escaping:** inside a Turtle string a backslash must be doubled, so the regex `\d` is written `"\\d"`.

## Exercise

Members also have a library **card number** and an **age**. Add two property shapes to `ex:MemberShape`:

1. `ex:cardNumber` must match the pattern `^LIB-[0-9]{4}$` (e.g. `LIB-0042`).
2. `ex:age` must have datatype `xsd:integer` and be **between 0 and 130** (inclusive).

Validate. The report should flag exactly **`ex:bob`** (email), **`ex:chen`** (card number) and **`ex:dana`** (age). Read the data to see why each one fails.

```turtle shapes
@prefix sh:  <http://www.w3.org/ns/shacl#> .
@prefix xsd: <http://www.w3.org/2001/XMLSchema#> .
@prefix ex:  <http://example.org/library#> .

ex:MemberShape
    a sh:NodeShape ;
    sh:targetClass ex:Member ;
    sh:property [
        sh:path    ex:email ;
        sh:maxCount 1 ;
        sh:pattern "^[^@\\s]+@[^@\\s]+\\.[a-z]+$" ;
        sh:message "Email must look like name@domain.tld"
    ] .
```

```turtle data
@prefix ex:  <http://example.org/library#> .
@prefix xsd: <http://www.w3.org/2001/XMLSchema#> .

ex:alice a ex:Member ; ex:name "Alice" ; ex:email "alice@example.org" ;
         ex:cardNumber "LIB-0001" ; ex:age 34 .
ex:bob   a ex:Member ; ex:name "Bob"   ; ex:email "bob-at-example.org" ;
         ex:cardNumber "LIB-0002" ; ex:age 51 .
ex:chen  a ex:Member ; ex:name "Chen"  ; ex:email "chen@example.org" ;
         ex:cardNumber "LIB-12"   ; ex:age 27 .
ex:dana  a ex:Member ; ex:name "Dana"  ;
         ex:cardNumber "LIB-0004" ; ex:age 142 .
```

```turtle solution-shapes
@prefix sh:  <http://www.w3.org/ns/shacl#> .
@prefix xsd: <http://www.w3.org/2001/XMLSchema#> .
@prefix ex:  <http://example.org/library#> .

ex:MemberShape
    a sh:NodeShape ;
    sh:targetClass ex:Member ;
    sh:property [
        sh:path    ex:email ;
        sh:maxCount 1 ;
        sh:pattern "^[^@\\s]+@[^@\\s]+\\.[a-z]+$" ;
        sh:message "Email must look like name@domain.tld"
    ] ;
    sh:property [
        sh:path    ex:cardNumber ;
        sh:pattern "^LIB-[0-9]{4}$" ;
        sh:message "Card numbers look like LIB-0042"
    ] ;
    sh:property [
        sh:path ex:age ;
        sh:datatype xsd:integer ;
        sh:minInclusive 0 ;
        sh:maxInclusive 130
    ] .
```
