---
title: Your first shape
section: SHACL
expect_focus: ex:untitled ex:anonymous
---

# SHACL: rules your data must follow

RDFS and OWL *infer*. **SHACL** (Shapes Constraint Language) *checks*. It works under the **closed world**: a missing required value **is** an error. It's the tool for "every book must have exactly one title".

The playground now has a **Shapes** tab next to **Data**, and a **Validate ✓** button. Shapes are written in Turtle too.

## Anatomy of a shape

```turtle
ex:BookShape
    a sh:NodeShape ;
    sh:targetClass ex:Book ;            # which nodes to check: every ex:Book
    sh:property [                       # a constraint on one property
        sh:path     ex:title ;
        sh:minCount 1 ;                 # at least one title
        sh:maxCount 1 ;                 # at most one
        sh:datatype xsd:string ;
        sh:message  "A book needs exactly one string title."
    ] .
```

- A **node shape** picks its **focus nodes** with a target (`sh:targetClass`, `sh:targetNode`, `sh:targetSubjectsOf`, `sh:targetObjectsOf`).
- Each **property shape** describes the values reached by `sh:path`, using **constraints** like `sh:minCount`.
- Validating produces a **report**: one result per problem, with the focus node, path, offending value and message.

Look at the report in the results panel. `ex:untitled` has no title, and `ex:twoTitles` has two. Now open the **Data** tab, fix one of them, and press **Validate ✓** again.

> **Severity:** results are `sh:Violation` by default. Add `sh:severity sh:Warning` (or `sh:Info`) to a shape for softer checks.

## Exercise

Every book must also have **at least one `ex:author`**. Add a second `sh:property` block to `ex:BookShape`, then validate.

To pass, the report must flag **exactly** `ex:untitled` and `ex:anonymous`. First fix `ex:twoTitles` in the **Data** tab by deleting one of its titles.

```turtle shapes
@prefix sh:  <http://www.w3.org/ns/shacl#> .
@prefix xsd: <http://www.w3.org/2001/XMLSchema#> .
@prefix ex:  <http://example.org/library#> .

ex:BookShape
    a sh:NodeShape ;
    sh:targetClass ex:Book ;
    sh:property [
        sh:path     ex:title ;
        sh:minCount 1 ;
        sh:maxCount 1 ;
        sh:datatype xsd:string ;
        sh:message  "A book needs exactly one string title."
    ] .
```

```turtle data
@prefix ex: <http://example.org/library#> .

ex:pride     a ex:Book ; ex:title "Pride and Prejudice" ; ex:author ex:austen .
ex:untitled  a ex:Book ;                                   ex:author ex:shelley .
ex:anonymous a ex:Book ; ex:title "Beowulf" .
ex:twoTitles a ex:Book ; ex:title "Dracula" , "Nosferatu" ; ex:author ex:stoker .

ex:austen ex:name "Jane Austen" .   # not a Book, so not checked
```

```turtle solution-shapes
@prefix sh:  <http://www.w3.org/ns/shacl#> .
@prefix xsd: <http://www.w3.org/2001/XMLSchema#> .
@prefix ex:  <http://example.org/library#> .

ex:BookShape
    a sh:NodeShape ;
    sh:targetClass ex:Book ;
    sh:property [
        sh:path     ex:title ;
        sh:minCount 1 ;
        sh:maxCount 1 ;
        sh:datatype xsd:string ;
        sh:message  "A book needs exactly one string title."
    ] ;
    sh:property [
        sh:path     ex:author ;
        sh:minCount 1 ;
        sh:message  "A book needs at least one author."
    ] .
```

```turtle solution-data
@prefix ex: <http://example.org/library#> .

ex:pride     a ex:Book ; ex:title "Pride and Prejudice" ; ex:author ex:austen .
ex:untitled  a ex:Book ;                                   ex:author ex:shelley .
ex:anonymous a ex:Book ; ex:title "Beowulf" .
ex:twoTitles a ex:Book ; ex:title "Dracula" ; ex:author ex:stoker .

ex:austen ex:name "Jane Austen" .   # not a Book, so not checked
```
