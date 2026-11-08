---
title: Classes and hierarchies
section: Ontology concepts
reasoning: none
---

# Classes: the concepts of a domain

A **class** is a concept of the domain: *Customer*, *Order*, *Product*. Formally, a class is a **set**: the class `retail:Customer` stands for the set of all customers. Its members are its **instances** (also called **individuals**).

```turtle
retail:Customer a owl:Class .        # "Customer is a class"
ex:C2 a retail:Customer .            # "C2 is an instance of Customer" (a = rdf:type)
```

## Subclasses: from general to specific

A **subclass** is a more specific concept. Every member of the subclass is also a member of the superclass:

```turtle
retail:PremiumCustomer rdfs:subClassOf retail:Customer .
retail:Customer        rdfs:subClassOf retail:Party .
```

Note that the property is **`rdfs:subClassOf`**, which comes from RDFS. OWL has no `owl:subClass`.

This *is-a* relation is transitive, so a premium customer is a customer, and therefore a party. Following `subClassOf` up and down gives you a **taxonomy**: a hierarchy of specialisation. That's where ontologies and taxonomies overlap. A taxonomy is an ontology that only has the hierarchy, with no properties or restrictions.

> The store also has a *second* kind of hierarchy: Electronics › Computers › Laptops. Those are **categories you tag products with** (SKOS concepts), not classes. A laptop is *in* the Laptops category; it isn't an *instance of* "Laptops". The SKOS section shows the difference.

## Two design mindsets

**Object-oriented design** starts from a *program*. You identify the objects, their **state** (fields) and their **behaviour** (methods), then translate them into class definitions in Java, Python and so on. The classes live inside one application and exist to make it run.

**Ontology design** starts from a *domain*. You identify the concepts, how they're related, and what is true about them, then write that down:

- **classes and their hierarchy** in **RDFS/OWL**,
- their **properties** (attributes and relationships) in **RDFS/OWL**,
- **what follows logically** (inverse, transitive, defined classes) in **OWL**,
- **what valid data must look like** (required, one-of, ranges) in **SHACL**,
- the instances as **RDF triples**, in Turtle files or any RDF store,
- and you ask questions with **SPARQL**.

There's **no behaviour**. An ontology describes *what is*, not *what to do*. It isn't tied to one program either: the same ontology serves the web shop, the warehouse, a search engine and a data agent alike.

## Classes compared with OOP

| Ontology (OWL) | Object-oriented programming |
|---|---|
| class (`owl:Class`) | class |
| subclass (`rdfs:subClassOf`) | inheritance (`extends`) |
| individual (`ex:C1`) | object |
| `ex:C1 a retail:Customer` | `c1 = new Customer()` |

The similarities stop there:

1. **An individual can belong to many classes at once.** `ex:C1` is a PremiumCustomer, a Customer, a Party and a `schema:Person`, all simultaneously. An OOP object has exactly one class.
2. **Membership can change, or be *inferred*.** Add a membership date and a customer can become premium. OWL can work out class membership from the facts (see *defined classes* later). An OOP object's class is fixed at `new`.
3. **Multiple inheritance is normal.** `retail:Customer` is a subclass of both `retail:Party` and `schema:Person`.
4. **Classes have no behaviour.** There are no methods: an ontology describes *what is*, not *what to do*.
5. **Things exist without a class.** `ex:C4` can appear in the data with no type at all. A reasoner might still work one out from how it's used.

## Good habits

- Use **singular** class names: `Customer`, not `Customers`. A class names one kind of thing.
- Make sure each subclass really **is-a** superclass. An order line *is part of* an order, but it is *not a kind of* order.
- **Siblings** should sit at the same level of generality, e.g. `ProductFamily`, `ProductCategory` and `SubCategory` under `Category`.
- If you'd add a subclass only to hold a value (e.g. `RedProduct`), you probably want a **property** instead.

The query on the right shows **all** classes of `ex:C1` by walking up `subClassOf` (the `*` means zero or more steps; you'll learn this in SPARQL basics).

## Exercise

The store's product hierarchy has three levels. Add **two triples**: declare `retail:SubCategory` as a **subclass of `retail:Category`**, and make `ex:SUB-LAPTOP` an **instance** of `retail:SubCategory`.

```turtle data
@prefix retail: <https://example.org/retail/ontology#> .
@prefix ex:     <https://example.org/retail/data/> .
@prefix owl:    <http://www.w3.org/2002/07/owl#> .
@prefix rdfs:   <http://www.w3.org/2000/01/rdf-schema#> .
@prefix skos:   <http://www.w3.org/2004/02/skos/core#> .
@prefix schema: <https://schema.org/> .

# ---- Classes and their hierarchy ----
retail:Party           a owl:Class .
retail:Customer        a owl:Class ; rdfs:subClassOf retail:Party , schema:Person .
retail:PremiumCustomer a owl:Class ; rdfs:subClassOf retail:Customer .
retail:Category        a owl:Class ; rdfs:subClassOf skos:Concept .
retail:ProductFamily   a owl:Class ; rdfs:subClassOf retail:Category .
retail:ProductCategory a owl:Class ; rdfs:subClassOf retail:Category .
retail:SubCategory     a owl:Class .

# ---- Individuals ----
ex:C1 a retail:PremiumCustomer .
ex:C2 a retail:Customer .
ex:FAM-ELEC a retail:ProductFamily .
ex:CAT-COMP a retail:ProductCategory .
ex:SUB-LAPTOP retail:name "Laptops" .
```

```sparql query
PREFIX ex:   <https://example.org/retail/data/>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>

SELECT ?class
WHERE { ex:C1 a/rdfs:subClassOf* ?class }
```

```sparql check
PREFIX retail: <https://example.org/retail/ontology#>
PREFIX ex:     <https://example.org/retail/data/>
PREFIX rdfs:   <http://www.w3.org/2000/01/rdf-schema#>
ASK { retail:SubCategory rdfs:subClassOf retail:Category . ex:SUB-LAPTOP a retail:SubCategory }
```

```turtle solution-data
@prefix retail: <https://example.org/retail/ontology#> .
@prefix ex:     <https://example.org/retail/data/> .
@prefix owl:    <http://www.w3.org/2002/07/owl#> .
@prefix rdfs:   <http://www.w3.org/2000/01/rdf-schema#> .
@prefix skos:   <http://www.w3.org/2004/02/skos/core#> .
@prefix schema: <https://schema.org/> .

# ---- Classes and their hierarchy ----
retail:Party           a owl:Class .
retail:Customer        a owl:Class ; rdfs:subClassOf retail:Party , schema:Person .
retail:PremiumCustomer a owl:Class ; rdfs:subClassOf retail:Customer .
retail:Category        a owl:Class ; rdfs:subClassOf skos:Concept .
retail:ProductFamily   a owl:Class ; rdfs:subClassOf retail:Category .
retail:ProductCategory a owl:Class ; rdfs:subClassOf retail:Category .
retail:SubCategory     a owl:Class ; rdfs:subClassOf retail:Category .

# ---- Individuals ----
ex:C1 a retail:PremiumCustomer .
ex:C2 a retail:Customer .
ex:FAM-ELEC a retail:ProductFamily .
ex:CAT-COMP a retail:ProductCategory .
ex:SUB-LAPTOP a retail:SubCategory ; retail:name "Laptops" .
```
