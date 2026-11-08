---
title: Classes and subclasses
section: RDFS
reasoning: none
check_reasoning: rdfs
---

# RDFS: your first vocabulary

So far `retail:Customer` has just been a name. **RDF Schema (RDFS)** lets us say what our terms *mean*, so a machine can draw conclusions from them.

The two most important words are:

- `rdfs:Class` / `owl:Class`: "this is a category of things"
- `rdfs:subClassOf`: "every member of A is also a member of B"

From the retail ontology:

```turtle
retail:PremiumCustomer rdfs:subClassOf retail:Customer .
retail:Customer        rdfs:subClassOf retail:Party .
```

## Inference: facts you never wrote

The data says `ex:C1 a retail:PremiumCustomer`. It never says C1 is a `Customer`, let alone a `Party`. But it *must* be: a premium customer is a customer, and a customer is a party.

1. Run the query. It asks for all `retail:Party` members and finds **nothing**, because SPARQL only sees triples that are actually stored.
2. Switch **Reasoning** (above the data) to **RDFS** and run again.

Now all three customers appear, plus the brand's owner `ex:ExampleCorp`. The reasoner **inferred** new triples. Click the "**N inferred**" link under the data to see each one.

The key rule is tiny (**rdfs9**):

```
IF   ?x a ?C   AND   ?C rdfs:subClassOf ?D
THEN ?x a ?D
```

`rdfs:subClassOf` is also transitive (**rdfs11**): PremiumCustomer ⊑ Customer ⊑ Party, so PremiumCustomer ⊑ Party.

The same idea organises the product hierarchy: `retail:ProductFamily`, `retail:ProductCategory` and `retail:SubCategory` are all subclasses of `retail:Category`, which is itself a subclass of `skos:Concept`. Try asking for `?x a retail:Category`.

> **Mental model:** an ontology is *data about your data*. The schema (classes, properties) and the instances live in the same graph and are queried in the same way.

## Exercise

The retail ontology aligns its classes with **schema.org**, so search engines and other tools understand them. Add **one schema triple** saying `retail:Customer` is a subclass of **`schema:Person`**. With RDFS reasoning on, the premium customer `ex:C1` should then be inferred to be a `schema:Person`.

Don't type `ex:C1 a schema:Person` yourself. Let the reasoner do it!

```turtle data
@prefix retail: <https://example.org/retail/ontology#> .
@prefix ex:     <https://example.org/retail/data/> .
@prefix rdfs:   <http://www.w3.org/2000/01/rdf-schema#> .
@prefix owl:    <http://www.w3.org/2002/07/owl#> .
@prefix skos:   <http://www.w3.org/2004/02/skos/core#> .
@prefix schema: <https://schema.org/> .

# ---- Schema (TBox) ----
retail:Party           a owl:Class .
retail:Customer        a owl:Class ; rdfs:subClassOf retail:Party .
retail:PremiumCustomer a owl:Class ; rdfs:subClassOf retail:Customer .
retail:Organization    a owl:Class ; rdfs:subClassOf retail:Party .   # added for this lesson
retail:Category        a owl:Class ; rdfs:subClassOf skos:Concept .
retail:ProductFamily   a owl:Class ; rdfs:subClassOf retail:Category .
retail:ProductCategory a owl:Class ; rdfs:subClassOf retail:Category .
retail:SubCategory     a owl:Class ; rdfs:subClassOf retail:Category .

# ---- Instances (ABox) ----
ex:C1 a retail:PremiumCustomer ; retail:name "Naidu Random1" .
ex:C2 a retail:Customer        ; retail:name "Bob Random2" .
ex:C3 a retail:PremiumCustomer ; retail:name "Carol Random3" .
ex:ExampleCorp a retail:Organization ; retail:name "Example Corp" .

ex:FAM-ELEC   a retail:ProductFamily   ; retail:name "Electronics" .
ex:CAT-COMP   a retail:ProductCategory ; retail:name "Computers" .
ex:SUB-LAPTOP a retail:SubCategory     ; retail:name "Laptops" .
```

```sparql query
PREFIX retail: <https://example.org/retail/ontology#>

SELECT ?party ?name
WHERE { ?party a retail:Party ; retail:name ?name }
```

```sparql check
PREFIX retail: <https://example.org/retail/ontology#>
PREFIX ex:     <https://example.org/retail/data/>
PREFIX rdfs:   <http://www.w3.org/2000/01/rdf-schema#>
PREFIX schema: <https://schema.org/>
ASK { retail:Customer rdfs:subClassOf schema:Person . ex:C1 a schema:Person }
```

```turtle solution-data
@prefix retail: <https://example.org/retail/ontology#> .
@prefix ex:     <https://example.org/retail/data/> .
@prefix rdfs:   <http://www.w3.org/2000/01/rdf-schema#> .
@prefix owl:    <http://www.w3.org/2002/07/owl#> .
@prefix skos:   <http://www.w3.org/2004/02/skos/core#> .
@prefix schema: <https://schema.org/> .

# ---- Schema (TBox) ----
retail:Party           a owl:Class .
retail:Customer        a owl:Class ; rdfs:subClassOf retail:Party , schema:Person .
retail:PremiumCustomer a owl:Class ; rdfs:subClassOf retail:Customer .
retail:Organization    a owl:Class ; rdfs:subClassOf retail:Party .   # added for this lesson
retail:Category        a owl:Class ; rdfs:subClassOf skos:Concept .
retail:ProductFamily   a owl:Class ; rdfs:subClassOf retail:Category .
retail:ProductCategory a owl:Class ; rdfs:subClassOf retail:Category .
retail:SubCategory     a owl:Class ; rdfs:subClassOf retail:Category .

# ---- Instances (ABox) ----
ex:C1 a retail:PremiumCustomer ; retail:name "Naidu Random1" .
ex:C2 a retail:Customer        ; retail:name "Bob Random2" .
ex:C3 a retail:PremiumCustomer ; retail:name "Carol Random3" .
ex:ExampleCorp a retail:Organization ; retail:name "Example Corp" .

ex:FAM-ELEC   a retail:ProductFamily   ; retail:name "Electronics" .
ex:CAT-COMP   a retail:ProductCategory ; retail:name "Computers" .
ex:SUB-LAPTOP a retail:SubCategory     ; retail:name "Laptops" .
```
