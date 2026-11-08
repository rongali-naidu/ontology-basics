---
title: Same idea, different words
section: Ontology concepts
---

# Same idea, different words

Ontologies, knowledge graphs, databases, object-oriented code and BI tools all grew up separately, and each community named the same ideas differently. Some words even mean *different* things in different places. This page is the translation table. Come back to it whenever a tool, paper or colleague uses a word you don't recognise.

**This course uses:** *class*, *individual*, *data property*, *object property*, *restriction*, *knowledge graph*.

## One idea, many names

| Idea | Names you'll meet |
|---|---|
| **Ontology** | ontology, vocabulary, schema, data model, TBox, terminology |
| **Class** | class, concept, type, category, entity type, frame, node label (Neo4j), table (SQL) |
| **Individual** | individual, instance, object, entity, resource, member, node, row/record |
| **Property** (any) | property, slot, role, predicate, feature, field |
| **Object property** | object property, relation, relationship, association, link, edge, reference, foreign key |
| **Data property** | datatype property, data property, attribute, field, column, node property |
| **Restriction** | restriction, facet, role restriction, constraint, shape, rule, multiplicity, cardinality |
| **Subclass of** | subClassOf, is-a, kind-of, specialisation/generalisation, subsumption (⊑), inheritance, extends |
| **Statement** | triple, statement, fact, assertion, edge, quad (with a graph name) |
| **Identifier** | IRI, URI, prefixed name/CURIE, node id, primary key |
| **Value** | literal, value, data value, scalar |
| **Knowledge graph** | knowledge graph, knowledge base, dataset, TBox + ABox |
| **Taxonomy** | taxonomy, hierarchy, concept scheme, thesaurus, classification, controlled vocabulary |
| **Reasoning** | reasoning, inference, entailment, materialisation, classification |
| **Validation** | validation, constraint checking, conformance, data quality checks |

## The same model in five technologies

| Ontology (OWL/RDF) | OOP | UML | Property graph (Neo4j) | Relational DB |
|---|---|---|---|---|
| class `retail:Customer` | class `Customer` | class | node label `:Customer` | table `customer` |
| individual `ex:C1` | object | object | node | row |
| data property `retail:email` | primitive field | attribute | node property | column |
| object property `retail:placedBy` | reference field | association | relationship `[:PLACED_BY]` | foreign key |
| relationship with data (`retail:OrderLine`) | association object | association class | relationship properties | join table with columns |
| `rdfs:subClassOf` | `extends` | generalisation | multiple labels | table-per-type or a type column |
| restriction / SHACL shape | type system, validation code | multiplicity `1..*` | constraints | `NOT NULL`, `CHECK`, FK constraints |
| SPARQL | — | — | Cypher / GQL | SQL |
| identity: IRI, global | memory reference, local | — | internal id, local | primary key, per table |

## ⚠ False friends: same word, different meaning

| Word | Meaning 1 | Meaning 2 |
|---|---|---|
| **property** | RDF/OWL: attributes *and* relationships | Neo4j: only key–value attributes on nodes/edges; OOP: a field with getters/setters |
| **label** | `rdfs:label` / `skos:prefLabel`: a human-readable **name** | Neo4j: a node's **type** (≈ class) |
| **concept** | ontology engineering: a **class** | SKOS: a **term** in a taxonomy (`skos:Concept`), *not* a class |
| **relation** | ontology/logic: a **property** linking things | relational theory: a **table**! |
| **domain** | the subject area being modelled | `rdfs:domain`: the class of a property's *subjects*; in relational theory: the set of allowed values (closer to `rdfs:range`!) |
| **range** | `rdfs:range`: the type of a property's values | a numeric interval (`sh:minInclusive … sh:maxInclusive`) |
| **type** | `rdf:type`: class membership | a datatype like `xsd:decimal` |
| **role** | description logic: a **property** | modelling: a class a thing plays, like *Customer*; IT: an access-control role |
| **entity** | ER modelling: an entity *type* (≈ class) | knowledge graphs/NLP: one thing (≈ individual) |
| **schema** | a database schema | schema.org, a shared *vocabulary*; or loosely, "the ontology" |
| **semantic model** | talk about ontologies: the ontology | BI tools (dbt, LookML, Apache Ossie): a **metrics layer**, as in the retail example's `semantic-model/` |
| **inference** | logic: deriving new facts | machine learning: running a trained model |
| **"the same"** | `owl:sameAs`: two IRIs, one individual | `owl:equivalentClass`: two classes, same members; `skos:exactMatch`: interchangeable terms, no logical identity |

## Query the dictionary

The data on the right *is* this translation table, written as a small knowledge graph. Each **usage** of a word links the word, the context where it's used and the idea it means. Run the query to see every idea with all its names.

## Exercise

Write a query that shows every meaning of the word **"domain"**: the **context** and the **preferred label** of the idea it means. Return `?context ?meaning`.

```turtle data
@prefix tm:   <https://example.org/terms/> .
@prefix skos: <http://www.w3.org/2004/02/skos/core#> .

# ---- Ideas ----
tm:Ontology       a skos:Concept ; skos:prefLabel "Ontology (the model)" .
tm:Class          a skos:Concept ; skos:prefLabel "Class" .
tm:Individual     a skos:Concept ; skos:prefLabel "Individual" .
tm:Property       a skos:Concept ; skos:prefLabel "Property (any)" .
tm:ObjectProperty a skos:Concept ; skos:prefLabel "Object property" .
tm:DataProperty   a skos:Concept ; skos:prefLabel "Data property" .
tm:Restriction    a skos:Concept ; skos:prefLabel "Restriction" .
tm:SubclassOf     a skos:Concept ; skos:prefLabel "Subclass of" .
tm:Statement      a skos:Concept ; skos:prefLabel "Statement" .
tm:Identifier     a skos:Concept ; skos:prefLabel "Identifier" .
tm:Literal        a skos:Concept ; skos:prefLabel "Value (literal)" .
tm:KnowledgeGraph a skos:Concept ; skos:prefLabel "Knowledge graph" .
tm:Taxonomy       a skos:Concept ; skos:prefLabel "Taxonomy" .
tm:TaxonomyTerm   a skos:Concept ; skos:prefLabel "Taxonomy term" .
tm:Broader        a skos:Concept ; skos:prefLabel "More general term" .
tm:Name           a skos:Concept ; skos:prefLabel "Human-readable name" .
tm:Reasoning      a skos:Concept ; skos:prefLabel "Reasoning" .
tm:MLInference    a skos:Concept ; skos:prefLabel "Running an ML model" .
tm:Validation     a skos:Concept ; skos:prefLabel "Validation" .
tm:SubjectArea    a skos:Concept ; skos:prefLabel "Subject area being modelled" .
tm:SubjectClass   a skos:Concept ; skos:prefLabel "Class of a property's subjects" .
tm:ValueType      a skos:Concept ; skos:prefLabel "Type of a property's values" .
tm:ValueSet       a skos:Concept ; skos:prefLabel "Set of allowed values" .
tm:MetricsLayer   a skos:Concept ; skos:prefLabel "BI metrics layer" .

# ---- Usages: word, context, meaning ----
[] a tm:Usage ; tm:word "class" ;            tm:context "OWL / RDFS" ;               tm:means tm:Class .
[] a tm:Usage ; tm:word "class" ;            tm:context "OOP / UML" ;                tm:means tm:Class .
[] a tm:Usage ; tm:word "concept" ;          tm:context "Ontology engineering" ;     tm:means tm:Class .
[] a tm:Usage ; tm:word "concept" ;          tm:context "SKOS" ;                     tm:means tm:TaxonomyTerm .
[] a tm:Usage ; tm:word "type" ;             tm:context "RDF (rdf:type)" ;           tm:means tm:Class .
[] a tm:Usage ; tm:word "type" ;             tm:context "XSD datatypes" ;            tm:means tm:ValueType .
[] a tm:Usage ; tm:word "label" ;            tm:context "Neo4j / property graphs" ;  tm:means tm:Class .
[] a tm:Usage ; tm:word "label" ;            tm:context "RDFS (rdfs:label)" ;        tm:means tm:Name .
[] a tm:Usage ; tm:word "label" ;            tm:context "SKOS (prefLabel)" ;         tm:means tm:Name .
[] a tm:Usage ; tm:word "entity type" ;      tm:context "ER modelling" ;             tm:means tm:Class .
[] a tm:Usage ; tm:word "table" ;            tm:context "Relational DB" ;            tm:means tm:Class .
[] a tm:Usage ; tm:word "frame" ;            tm:context "Frame-based systems" ;      tm:means tm:Class .
[] a tm:Usage ; tm:word "category" ;         tm:context "Retail / SKOS" ;            tm:means tm:TaxonomyTerm .
[] a tm:Usage ; tm:word "individual" ;       tm:context "OWL" ;                      tm:means tm:Individual .
[] a tm:Usage ; tm:word "instance" ;         tm:context "Ontology tools" ;           tm:means tm:Individual .
[] a tm:Usage ; tm:word "object" ;           tm:context "OOP" ;                      tm:means tm:Individual .
[] a tm:Usage ; tm:word "node" ;             tm:context "Graphs" ;                   tm:means tm:Individual .
[] a tm:Usage ; tm:word "row" ;              tm:context "Relational DB" ;            tm:means tm:Individual .
[] a tm:Usage ; tm:word "resource" ;         tm:context "RDF" ;                      tm:means tm:Individual .
[] a tm:Usage ; tm:word "entity" ;           tm:context "Knowledge graphs / NLP" ;   tm:means tm:Individual .
[] a tm:Usage ; tm:word "entity" ;           tm:context "ER modelling" ;             tm:means tm:Class .
[] a tm:Usage ; tm:word "property" ;         tm:context "RDF / OWL" ;                tm:means tm:Property .
[] a tm:Usage ; tm:word "property" ;         tm:context "Neo4j / property graphs" ;  tm:means tm:DataProperty .
[] a tm:Usage ; tm:word "slot" ;             tm:context "Protégé / frames" ;         tm:means tm:Property .
[] a tm:Usage ; tm:word "role" ;             tm:context "Description logic" ;        tm:means tm:Property .
[] a tm:Usage ; tm:word "predicate" ;        tm:context "RDF triples" ;              tm:means tm:Property .
[] a tm:Usage ; tm:word "feature" ;          tm:context "Machine learning" ;         tm:means tm:DataProperty .
[] a tm:Usage ; tm:word "object property" ;  tm:context "OWL" ;                      tm:means tm:ObjectProperty .
[] a tm:Usage ; tm:word "relationship" ;     tm:context "Neo4j / ER modelling" ;     tm:means tm:ObjectProperty .
[] a tm:Usage ; tm:word "association" ;      tm:context "UML" ;                      tm:means tm:ObjectProperty .
[] a tm:Usage ; tm:word "foreign key" ;      tm:context "Relational DB" ;            tm:means tm:ObjectProperty .
[] a tm:Usage ; tm:word "edge" ;             tm:context "Graphs" ;                   tm:means tm:ObjectProperty .
[] a tm:Usage ; tm:word "relation" ;         tm:context "Ontology / logic" ;         tm:means tm:ObjectProperty .
[] a tm:Usage ; tm:word "relation" ;         tm:context "Relational theory" ;        tm:means tm:Class .
[] a tm:Usage ; tm:word "datatype property" ; tm:context "OWL" ;                     tm:means tm:DataProperty .
[] a tm:Usage ; tm:word "attribute" ;        tm:context "UML / ER modelling" ;       tm:means tm:DataProperty .
[] a tm:Usage ; tm:word "column" ;           tm:context "Relational DB" ;            tm:means tm:DataProperty .
[] a tm:Usage ; tm:word "field" ;            tm:context "OOP" ;                      tm:means tm:DataProperty .
[] a tm:Usage ; tm:word "restriction" ;      tm:context "OWL" ;                      tm:means tm:Restriction .
[] a tm:Usage ; tm:word "facet" ;            tm:context "Ontology engineering" ;     tm:means tm:Restriction .
[] a tm:Usage ; tm:word "role restriction" ; tm:context "Description logic" ;        tm:means tm:Restriction .
[] a tm:Usage ; tm:word "shape" ;            tm:context "SHACL" ;                    tm:means tm:Restriction .
[] a tm:Usage ; tm:word "constraint" ;       tm:context "Relational DB" ;            tm:means tm:Restriction .
[] a tm:Usage ; tm:word "multiplicity" ;     tm:context "UML" ;                      tm:means tm:Restriction .
[] a tm:Usage ; tm:word "range" ;            tm:context "RDFS (rdfs:range)" ;        tm:means tm:ValueType .
[] a tm:Usage ; tm:word "range" ;            tm:context "SHACL / statistics" ;       tm:means tm:Restriction .
[] a tm:Usage ; tm:word "domain" ;           tm:context "Ontology engineering" ;     tm:means tm:SubjectArea .
[] a tm:Usage ; tm:word "domain" ;           tm:context "RDFS (rdfs:domain)" ;       tm:means tm:SubjectClass .
[] a tm:Usage ; tm:word "domain" ;           tm:context "Relational theory" ;        tm:means tm:ValueSet .
[] a tm:Usage ; tm:word "subClassOf" ;       tm:context "RDFS" ;                     tm:means tm:SubclassOf .
[] a tm:Usage ; tm:word "is-a" ;             tm:context "Ontology engineering" ;     tm:means tm:SubclassOf .
[] a tm:Usage ; tm:word "subsumption" ;      tm:context "Description logic" ;        tm:means tm:SubclassOf .
[] a tm:Usage ; tm:word "inheritance" ;      tm:context "OOP" ;                      tm:means tm:SubclassOf .
[] a tm:Usage ; tm:word "generalization" ;   tm:context "UML" ;                      tm:means tm:SubclassOf .
[] a tm:Usage ; tm:word "broader" ;          tm:context "SKOS" ;                     tm:means tm:Broader .
[] a tm:Usage ; tm:word "triple" ;           tm:context "RDF" ;                      tm:means tm:Statement .
[] a tm:Usage ; tm:word "assertion" ;        tm:context "Description logic" ;        tm:means tm:Statement .
[] a tm:Usage ; tm:word "fact" ;             tm:context "Everyday" ;                 tm:means tm:Statement .
[] a tm:Usage ; tm:word "quad" ;             tm:context "RDF datasets" ;             tm:means tm:Statement .
[] a tm:Usage ; tm:word "IRI" ;              tm:context "RDF" ;                      tm:means tm:Identifier .
[] a tm:Usage ; tm:word "prefixed name" ;    tm:context "Turtle / SPARQL" ;          tm:means tm:Identifier .
[] a tm:Usage ; tm:word "primary key" ;      tm:context "Relational DB" ;            tm:means tm:Identifier .
[] a tm:Usage ; tm:word "literal" ;          tm:context "RDF" ;                      tm:means tm:Literal .
[] a tm:Usage ; tm:word "ontology" ;         tm:context "OWL" ;                      tm:means tm:Ontology .
[] a tm:Usage ; tm:word "TBox" ;             tm:context "Description logic" ;        tm:means tm:Ontology .
[] a tm:Usage ; tm:word "vocabulary" ;       tm:context "Linked Data" ;              tm:means tm:Ontology .
[] a tm:Usage ; tm:word "schema" ;           tm:context "Databases" ;                tm:means tm:Ontology .
[] a tm:Usage ; tm:word "semantic model" ;   tm:context "Ontology talk" ;            tm:means tm:Ontology .
[] a tm:Usage ; tm:word "semantic model" ;   tm:context "BI (dbt, LookML, Ossie)" ;  tm:means tm:MetricsLayer .
[] a tm:Usage ; tm:word "knowledge graph" ;  tm:context "Industry" ;                 tm:means tm:KnowledgeGraph .
[] a tm:Usage ; tm:word "knowledge base" ;   tm:context "Ontology engineering" ;     tm:means tm:KnowledgeGraph .
[] a tm:Usage ; tm:word "dataset" ;          tm:context "RDF / SPARQL" ;             tm:means tm:KnowledgeGraph .
[] a tm:Usage ; tm:word "taxonomy" ;         tm:context "Everyday" ;                 tm:means tm:Taxonomy .
[] a tm:Usage ; tm:word "concept scheme" ;   tm:context "SKOS" ;                     tm:means tm:Taxonomy .
[] a tm:Usage ; tm:word "thesaurus" ;        tm:context "Library science" ;          tm:means tm:Taxonomy .
[] a tm:Usage ; tm:word "hierarchy" ;        tm:context "BI / dimensional models" ;  tm:means tm:Taxonomy .
[] a tm:Usage ; tm:word "reasoning" ;        tm:context "Ontologies" ;               tm:means tm:Reasoning .
[] a tm:Usage ; tm:word "inference" ;        tm:context "Logic" ;                    tm:means tm:Reasoning .
[] a tm:Usage ; tm:word "inference" ;        tm:context "Machine learning" ;         tm:means tm:MLInference .
[] a tm:Usage ; tm:word "entailment" ;       tm:context "RDF semantics" ;            tm:means tm:Reasoning .
[] a tm:Usage ; tm:word "materialisation" ;  tm:context "Triple stores" ;            tm:means tm:Reasoning .
[] a tm:Usage ; tm:word "validation" ;       tm:context "SHACL" ;                    tm:means tm:Validation .
[] a tm:Usage ; tm:word "constraint checking" ; tm:context "Databases" ;            tm:means tm:Validation .
```

```sparql query
PREFIX tm:   <https://example.org/terms/>
PREFIX skos: <http://www.w3.org/2004/02/skos/core#>

SELECT ?idea (GROUP_CONCAT(CONCAT(?word, " (", ?context, ")"); separator=" · ") AS ?namesInUse)
WHERE {
  ?u tm:word ?word ; tm:context ?context ; tm:means/skos:prefLabel ?idea .
}
GROUP BY ?idea
ORDER BY ?idea
```

```sparql solution
PREFIX tm:   <https://example.org/terms/>
PREFIX skos: <http://www.w3.org/2004/02/skos/core#>

SELECT ?context ?meaning
WHERE { ?u tm:word "domain" ; tm:context ?context ; tm:means/skos:prefLabel ?meaning }
```
