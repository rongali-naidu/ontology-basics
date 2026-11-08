---
title: Restrictions and defined classes
section: OWL
reasoning: owl
check_reasoning: owl
---

# Defining classes by their properties

So far we've *told* the reasoner which class things belong to. With **restrictions**, you can define a class by a condition, and the reasoner works out the members itself.

A restriction is an anonymous class (a blank node) that describes "the things whose property *P* satisfies some condition":

## owl:hasValue: "has this exact value"

```turtle
ex:HorrorBook owl:equivalentClass [
    a owl:Restriction ;
    owl:onProperty ex:genre ;
    owl:hasValue   ex:Horror
] .
```

*A HorrorBook is exactly something whose `ex:genre` is `ex:Horror`.* Because it's an **equivalence**, it works both ways:

- anything with genre Horror is inferred to be a `ex:HorrorBook`;
- anything stated to be a `ex:HorrorBook` gets `ex:genre ex:Horror`.

```sparql
PREFIX ex: <http://example.org/library#>

SELECT ?b WHERE { ?b a ex:HorrorBook }
```

## owl:someValuesFrom: "has at least one value of this type"

```turtle
ex:Borrower owl:equivalentClass [
    a owl:Restriction ;
    owl:onProperty     ex:hasLoan ;
    owl:someValuesFrom ex:Loan
] .
```

*A Borrower is anyone with at least one loan.*

```sparql
PREFIX ex: <http://example.org/library#>

SELECT ?who WHERE { ?who a ex:Borrower }
```

## owl:allValuesFrom: "every value is of this type"

```turtle
ex:Anthology rdfs:subClassOf [
    a owl:Restriction ;
    owl:onProperty    ex:contains ;
    owl:allValuesFrom ex:ShortStory
] .
```

Everything an anthology contains is inferred to be a `ex:ShortStory`.

> Full OWL also has cardinality restrictions (`owl:minCardinality`, `owl:qualifiedCardinality` …), `owl:complementOf` and more. This site runs a *subset* of the **OWL 2 RL** rules: enough to learn the ideas. For complete OWL DL reasoning, use a tool like Protégé with the HermiT reasoner.

## Exercise

Define **`ex:SciFiBook`** as equivalent to a restriction on `ex:genre` with the value `ex:SciFi`. Then *The Time Machine* and *The War of the Worlds* should be classified automatically.

```turtle data
@prefix ex:   <http://example.org/library#> .
@prefix owl:  <http://www.w3.org/2002/07/owl#> .
@prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .

# ---- Defined classes ----
ex:HorrorBook owl:equivalentClass [
    a owl:Restriction ; owl:onProperty ex:genre ; owl:hasValue ex:Horror ] .

ex:Borrower owl:equivalentClass [
    a owl:Restriction ; owl:onProperty ex:hasLoan ; owl:someValuesFrom ex:Loan ] .

ex:Anthology rdfs:subClassOf [
    a owl:Restriction ; owl:onProperty ex:contains ; owl:allValuesFrom ex:ShortStory ] .

# ---- Data ----
ex:frankenstein ex:genre ex:Horror .
ex:dracula      ex:genre ex:Horror .
ex:timeMachine  ex:genre ex:SciFi .
ex:warOfWorlds  ex:genre ex:SciFi .
ex:emma         ex:genre ex:Romance .
ex:ghostStories a ex:HorrorBook .       # genre will be inferred

ex:alice ex:hasLoan ex:loan1 .  ex:loan1 a ex:Loan .
ex:bob   ex:hasLoan ex:loan2 .  ex:loan2 a ex:Loan .
ex:chen  ex:name "Chen" .

ex:victorianTales a ex:Anthology ; ex:contains ex:theSignalman , ex:theOpenWindow .
```

```sparql query
PREFIX ex: <http://example.org/library#>

SELECT ?b ?genre WHERE { ?b a ex:HorrorBook ; ex:genre ?genre }
```

```sparql check
PREFIX ex: <http://example.org/library#>
ASK {
  ex:timeMachine a ex:SciFiBook . ex:warOfWorlds a ex:SciFiBook .
  FILTER NOT EXISTS { ex:dracula a ex:SciFiBook }
  FILTER NOT EXISTS { ex:timeMachine a ex:HorrorBook }
}
```

```turtle solution-data
@prefix ex:   <http://example.org/library#> .
@prefix owl:  <http://www.w3.org/2002/07/owl#> .
@prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .

# ---- Defined classes ----
ex:HorrorBook owl:equivalentClass [
    a owl:Restriction ; owl:onProperty ex:genre ; owl:hasValue ex:Horror ] .

ex:SciFiBook owl:equivalentClass [
    a owl:Restriction ; owl:onProperty ex:genre ; owl:hasValue ex:SciFi ] .

ex:Borrower owl:equivalentClass [
    a owl:Restriction ; owl:onProperty ex:hasLoan ; owl:someValuesFrom ex:Loan ] .

ex:Anthology rdfs:subClassOf [
    a owl:Restriction ; owl:onProperty ex:contains ; owl:allValuesFrom ex:ShortStory ] .

# ---- Data ----
ex:frankenstein ex:genre ex:Horror .
ex:dracula      ex:genre ex:Horror .
ex:timeMachine  ex:genre ex:SciFi .
ex:warOfWorlds  ex:genre ex:SciFi .
ex:emma         ex:genre ex:Romance .
ex:ghostStories a ex:HorrorBook .       # genre will be inferred

ex:alice ex:hasLoan ex:loan1 .  ex:loan1 a ex:Loan .
ex:bob   ex:hasLoan ex:loan2 .  ex:loan2 a ex:Loan .
ex:chen  ex:name "Chen" .

ex:victorianTales a ex:Anthology ; ex:contains ex:theSignalman , ex:theOpenWindow .
```
