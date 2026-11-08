---
title: sameAs and equivalence
section: OWL
reasoning: owl
check_reasoning: owl
---

# Linking data from different systems

A real store has several systems. Here the **CRM** knows the same customers under its own IRIs (prefix `crm:`), with facts the shop doesn't have, such as a support segment and a phone number.

## owl:sameAs: two IRIs, one thing

Entity resolution matched shop customer `ex:C1` with CRM contact `crm:CRM-1001` (same initial, last name, postal code and state). The retail data records that match:

```turtle
ex:C1 owl:sameAs crm:CRM-1001 .
```

Everything said about one IRI now holds for the other. Ask about `ex:C1` and you also get the CRM's facts:

```sparql
PREFIX ex: <https://example.org/retail/data/>

SELECT ?p ?o WHERE { ex:C1 ?p ?o }
```

> ⚠ `sameAs` is very strong. If you link two things that are only *similar*, every fact about one leaks onto the other. For "close but not identical", use SKOS mapping properties instead (see the SKOS lessons). The retail example uses `skos:exactMatch` to align its categories with Google's, not `sameAs`.

## owl:equivalentClass and owl:equivalentProperty

Classes and properties can be equivalent too. The retail ontology says:

```turtle
retail:Product owl:equivalentClass schema:Product .
```

This lesson adds two more, to merge in the CRM's vocabulary:

```turtle
retail:Customer owl:equivalentClass crm:Contact .
retail:name     owl:equivalentProperty crm:fullName .
```

`equivalentClass` means each class is a subclass of the other, so their members are the same. Now one query in *your* vocabulary also covers the CRM's data:

```sparql
PREFIX retail: <https://example.org/retail/ontology#>

SELECT ?who ?name WHERE { ?who a retail:Customer ; retail:name ?name }
```

`crm:CRM-2001` exists only in the CRM (they never ordered online), yet they appear as a `retail:Customer` with a `retail:name`.

## Exercise

Entity resolution also matched **`ex:C3`** (Carol) with **`crm:CRM-1003`**, but the link is missing from the data. Add it with **one triple**, so that this query returns Carol's segment, `"Loyal"`:

```sparql
PREFIX ex:  <https://example.org/retail/data/>
PREFIX crm: <https://example.org/crm/contact/>

SELECT ?segment WHERE { ex:C3 crm:segment ?segment }
```

```turtle data
@prefix retail: <https://example.org/retail/ontology#> .
@prefix ex:     <https://example.org/retail/data/> .
@prefix crm:    <https://example.org/crm/contact/> .
@prefix owl:    <http://www.w3.org/2002/07/owl#> .
@prefix rdfs:   <http://www.w3.org/2000/01/rdf-schema#> .
@prefix schema: <https://schema.org/> .

# ---- The web shop ----
ex:C1 a retail:PremiumCustomer ; retail:name "Naidu Random1" .
ex:C3 a retail:PremiumCustomer ; retail:name "Carol Random3" .
retail:PremiumCustomer rdfs:subClassOf retail:Customer .

# ---- The CRM (illustrative data for this lesson) ----
crm:CRM-1001 a crm:Contact ; crm:fullName "N. Random1" ; crm:segment "VIP"   ; crm:phone "+1-555-0101" .
crm:CRM-1003 a crm:Contact ; crm:fullName "C. Random3" ; crm:segment "Loyal" ; crm:phone "+1-555-0103" .
crm:CRM-2001 a crm:Contact ; crm:fullName "Dana Random4" ; crm:segment "Prospect" .

# ---- Links between the two ----
ex:C1 owl:sameAs crm:CRM-1001 .
retail:Product  owl:equivalentClass schema:Product .
retail:Customer owl:equivalentClass crm:Contact .
retail:name     owl:equivalentProperty crm:fullName .
```

```sparql query
PREFIX ex: <https://example.org/retail/data/>

SELECT ?p ?o WHERE { ex:C1 ?p ?o }
```

```sparql check
PREFIX ex:  <https://example.org/retail/data/>
PREFIX crm: <https://example.org/crm/contact/>
ASK { ex:C3 crm:segment "Loyal" }
```

```turtle solution-data
@prefix retail: <https://example.org/retail/ontology#> .
@prefix ex:     <https://example.org/retail/data/> .
@prefix crm:    <https://example.org/crm/contact/> .
@prefix owl:    <http://www.w3.org/2002/07/owl#> .
@prefix rdfs:   <http://www.w3.org/2000/01/rdf-schema#> .
@prefix schema: <https://schema.org/> .

# ---- The web shop ----
ex:C1 a retail:PremiumCustomer ; retail:name "Naidu Random1" .
ex:C3 a retail:PremiumCustomer ; retail:name "Carol Random3" .
retail:PremiumCustomer rdfs:subClassOf retail:Customer .

# ---- The CRM (illustrative data for this lesson) ----
crm:CRM-1001 a crm:Contact ; crm:fullName "N. Random1" ; crm:segment "VIP"   ; crm:phone "+1-555-0101" .
crm:CRM-1003 a crm:Contact ; crm:fullName "C. Random3" ; crm:segment "Loyal" ; crm:phone "+1-555-0103" .
crm:CRM-2001 a crm:Contact ; crm:fullName "Dana Random4" ; crm:segment "Prospect" .

# ---- Links between the two ----
ex:C1 owl:sameAs crm:CRM-1001 .
ex:C3 owl:sameAs crm:CRM-1003 .
retail:Product  owl:equivalentClass schema:Product .
retail:Customer owl:equivalentClass crm:Contact .
retail:name     owl:equivalentProperty crm:fullName .
```
