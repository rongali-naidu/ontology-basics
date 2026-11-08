---
title: Datatypes, patterns, ranges
section: SHACL
expect_focus: ex:C2 ex:SUB-Tablets ex:R9
---

# Constraining values

Counting values is only the start. SHACL can check what the values **look like**.

| Constraint | Checks |
|---|---|
| `sh:datatype xsd:date` | literal has this datatype |
| `sh:nodeKind sh:IRI` | value is an IRI (or `sh:Literal`, `sh:BlankNode` …) |
| `sh:pattern "^[A-Z]"` | the string matches a regular expression (`sh:flags "i"` ignores case) |
| `sh:minLength 2`, `sh:maxLength 50` | string length |
| `sh:minInclusive 1`, `sh:maxInclusive 5` | numeric (or date) range |
| `sh:in ( "WEB" "APP" )` | value is one of a fixed list |
| `sh:languageIn ( "en" "fr" )` | allowed language tags |
| `sh:uniqueLang true` | at most one value per language |

The starting shape is the retail example's customer email check. Validate, and you'll see Bob's `"bob-at-example.com"` rejected.

Notice `sh:targetClass retail:Customer` also checks the **premium** customers. SHACL follows `rdfs:subClassOf` triples found in the data, so you'll see a `PremiumCustomer ⊑ Customer` line there.

> **Escaping:** inside a Turtle string a backslash must be doubled, so the regex `\s` is written `"\\s"`.

## Exercise

Add two more shapes from the retail example:

1. **`shape:CategoryShape`**: every `retail:Category` has a `retail:code` matching **`^(FAM|CAT|SUB)-[A-Z]+$`**.
2. **`shape:ReviewShape`**: every `retail:Review` has a `retail:rating` of datatype **`xsd:integer`**, **between 1 and 5** inclusive. The ontology declares the same 1–5 range as an OWL datatype restriction, but only SHACL *enforces* it.

Validate. The report should flag exactly **`ex:C2`** (email), **`ex:SUB-Tablets`** (code) and **`ex:R9`** (rating). Read the data to see why each one fails.

```turtle shapes
@prefix sh:     <http://www.w3.org/ns/shacl#> .
@prefix xsd:    <http://www.w3.org/2001/XMLSchema#> .
@prefix retail: <https://example.org/retail/ontology#> .
@prefix shape:  <https://example.org/retail/shapes#> .

shape:CustomerShape a sh:NodeShape ;
    sh:targetClass retail:Customer ;
    sh:property [
        sh:path retail:email ; sh:datatype xsd:string ;
        sh:minCount 1 ; sh:maxCount 1 ;
        sh:pattern "^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$" ;
        sh:message "Customer needs exactly one well-formed email." ] .
```

```turtle data
@prefix retail: <https://example.org/retail/ontology#> .
@prefix ex:     <https://example.org/retail/data/> .
@prefix rdfs:   <http://www.w3.org/2000/01/rdf-schema#> .

retail:PremiumCustomer rdfs:subClassOf retail:Customer .
retail:ProductFamily   rdfs:subClassOf retail:Category .
retail:SubCategory     rdfs:subClassOf retail:Category .

ex:C1 a retail:PremiumCustomer ; retail:name "Naidu Random1" ; retail:email "naidu@example.com" .
ex:C2 a retail:Customer        ; retail:name "Bob Random2"   ; retail:email "bob-at-example.com" .
ex:C3 a retail:PremiumCustomer ; retail:name "Carol Random3" ; retail:email "carol@example.com" .

ex:FAM-ELEC    a retail:ProductFamily ; retail:code "FAM-ELEC" .
ex:SUB-LAPTOP  a retail:SubCategory   ; retail:code "SUB-LAPTOP" .
ex:SUB-Tablets a retail:SubCategory   ; retail:code "SUB-Tablets" .

ex:R1 a retail:Review ; retail:writtenBy ex:C1 ; retail:rating 5 .
ex:R3 a retail:Review ; retail:writtenBy ex:C1 ; retail:rating 3 .
ex:R9 a retail:Review ; retail:writtenBy ex:C3 ; retail:rating 7 .
```

```turtle solution-shapes
@prefix sh:     <http://www.w3.org/ns/shacl#> .
@prefix xsd:    <http://www.w3.org/2001/XMLSchema#> .
@prefix retail: <https://example.org/retail/ontology#> .
@prefix shape:  <https://example.org/retail/shapes#> .

shape:CustomerShape a sh:NodeShape ;
    sh:targetClass retail:Customer ;
    sh:property [
        sh:path retail:email ; sh:datatype xsd:string ;
        sh:minCount 1 ; sh:maxCount 1 ;
        sh:pattern "^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$" ;
        sh:message "Customer needs exactly one well-formed email." ] .

shape:CategoryShape a sh:NodeShape ;
    sh:targetClass retail:Category ;
    sh:property [
        sh:path retail:code ; sh:datatype xsd:string ;
        sh:minCount 1 ; sh:maxCount 1 ;
        sh:pattern "^(FAM|CAT|SUB)-[A-Z]+$" ] .

shape:ReviewShape a sh:NodeShape ;
    sh:targetClass retail:Review ;
    sh:property [
        sh:path retail:rating ; sh:datatype xsd:integer ;
        sh:minCount 1 ; sh:maxCount 1 ;
        sh:minInclusive 1 ; sh:maxInclusive 5 ] .
```
