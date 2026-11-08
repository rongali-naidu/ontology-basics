---
title: Capstone, and what's next
section: Wrap-up
reasoning: owl
check_reasoning: owl
tab: data
start: query
---

# Putting it all together

The data on the right is a small but complete knowledge graph that uses **everything** from this course:

- **RDFS:** a class hierarchy (`ex:Novel ⊑ ex:Book`) and domains/ranges
- **OWL:** an inverse property (`ex:borrowedBy` ↔ `ex:borrowed`) and a defined class (`ex:ActiveMember`)
- **SKOS:** a genre scheme with `broader` links
- **SHACL:** shapes that keep loans and books well-formed (Shapes tab)

Explore it with the queries below. Reasoning is on (**RDFS + OWL RL**).

Who are the active members (anyone who has borrowed something)? Nobody is *stated* to be one:

```sparql
PREFIX ex: <http://example.org/library#>

SELECT ?m ?name WHERE { ?m a ex:ActiveMember ; ex:name ?name }
```

Which books has each member borrowed? This uses the inverse property:

```sparql
PREFIX ex: <http://example.org/library#>

SELECT ?name ?title WHERE { ?m ex:borrowed ?b ; ex:name ?name . ?b ex:title ?title }
```

## Final exercise

List the **name of every member** who has borrowed **any kind of fiction**, together with the **English preferred label** of that book's genre. Return `?name ?genreLabel`.

You will need an OWL inference (`ex:borrowed`, or go via the loans), a SKOS hierarchy walk (`skos:broader*`) and a language filter.

## Where to go next

- **Protégé** (protege.stanford.edu): the classic free editor for building OWL ontologies, with full DL reasoners.
- **W3C specs:** [RDF 1.1 Primer](https://www.w3.org/TR/rdf11-primer/), [SPARQL 1.1 Query](https://www.w3.org/TR/sparql11-query/), [OWL 2 Primer](https://www.w3.org/TR/owl2-primer/), [SKOS Primer](https://www.w3.org/TR/skos-primer/), [SHACL](https://www.w3.org/TR/shacl/).
- **Real data to query:** the [Wikidata Query Service](https://query.wikidata.org/) is the largest public SPARQL endpoint.
- **Triple stores:** Oxigraph (which powers this site), Apache Jena Fuseki, GraphDB, Stardog, Amazon Neptune.
- **Vocabularies to reuse:** schema.org, Dublin Core, FOAF, PROV-O. Reuse before you invent!

Thanks for learning. Now model something you care about. 🎓

```turtle shapes
@prefix sh:  <http://www.w3.org/ns/shacl#> .
@prefix xsd: <http://www.w3.org/2001/XMLSchema#> .
@prefix ex:  <http://example.org/library#> .

ex:BookShape a sh:NodeShape ;
    sh:targetClass ex:Book ;
    sh:property [ sh:path ex:title ; sh:minCount 1 ; sh:maxCount 1 ] ;
    sh:property [ sh:path ex:genre ; sh:minCount 1 ;
                  sh:class <http://www.w3.org/2004/02/skos/core#Concept> ] .

ex:LoanShape a sh:NodeShape ;
    sh:targetClass ex:Loan ;
    sh:property [ sh:path ex:borrower ; sh:minCount 1 ; sh:maxCount 1 ; sh:class ex:Member ] ;
    sh:property [ sh:path ex:item     ; sh:minCount 1 ; sh:maxCount 1 ; sh:class ex:Book ] ;
    sh:property [ sh:path ex:due      ; sh:minCount 1 ; sh:datatype xsd:date ] .
```

```turtle data
@prefix ex:   <http://example.org/library#> .
@prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .
@prefix owl:  <http://www.w3.org/2002/07/owl#> .
@prefix skos: <http://www.w3.org/2004/02/skos/core#> .
@prefix xsd:  <http://www.w3.org/2001/XMLSchema#> .

# ---- Ontology (RDFS + OWL) ----
ex:Novel        rdfs:subClassOf ex:Book .
ex:Book         rdfs:subClassOf ex:Publication .
ex:Member       a owl:Class .
ex:borrower     a owl:ObjectProperty ; rdfs:domain ex:Loan ; rdfs:range ex:Member .
ex:item         a owl:ObjectProperty ; rdfs:domain ex:Loan ; rdfs:range ex:Book .
ex:borrowed     a owl:ObjectProperty .
ex:borrowedBy   a owl:ObjectProperty ; owl:inverseOf ex:borrowed .
ex:ActiveMember owl:equivalentClass [
    a owl:Restriction ; owl:onProperty ex:borrowed ; owl:someValuesFrom ex:Book ] .

# ---- Genres (SKOS) ----
ex:genres  a skos:ConceptScheme ; skos:hasTopConcept ex:Fiction , ex:NonFiction .
ex:Fiction    a skos:Concept ; skos:inScheme ex:genres ; skos:prefLabel "Fiction"@en , "Ficción"@es .
ex:NonFiction a skos:Concept ; skos:inScheme ex:genres ; skos:prefLabel "Non-fiction"@en , "No ficción"@es .
ex:SciFi      a skos:Concept ; skos:inScheme ex:genres ; skos:broader ex:Fiction ;
              skos:prefLabel "Science fiction"@en , "Ciencia ficción"@es ; skos:altLabel "Sci-Fi"@en .
ex:Horror     a skos:Concept ; skos:inScheme ex:genres ; skos:broader ex:Fiction ;
              skos:prefLabel "Horror"@en , "Terror"@es .
ex:History    a skos:Concept ; skos:inScheme ex:genres ; skos:broader ex:NonFiction ;
              skos:prefLabel "History"@en , "Historia"@es .

# ---- Books ----
ex:frankenstein a ex:Novel ; ex:title "Frankenstein" ;     ex:genre ex:Horror .
ex:timeMachine  a ex:Novel ; ex:title "The Time Machine" ; ex:genre ex:SciFi .
ex:gibbon       a ex:Book  ; ex:title "The Decline and Fall of the Roman Empire" ; ex:genre ex:History .

# ---- Members & loans ----
ex:alice a ex:Member ; ex:name "Alice" .
ex:bob   a ex:Member ; ex:name "Bob" .
ex:chen  a ex:Member ; ex:name "Chen" .

ex:loan1 a ex:Loan ; ex:borrower ex:alice ; ex:item ex:frankenstein ; ex:due "2026-12-01"^^xsd:date .
ex:loan2 a ex:Loan ; ex:borrower ex:chen  ; ex:item ex:gibbon       ; ex:due "2026-12-03"^^xsd:date .
ex:loan3 a ex:Loan ; ex:borrower ex:chen  ; ex:item ex:timeMachine  ; ex:due "2026-12-05"^^xsd:date .

# Loans are recorded from the book's side; ex:borrowed is inferred.
ex:frankenstein ex:borrowedBy ex:alice .
ex:gibbon       ex:borrowedBy ex:chen .
ex:timeMachine  ex:borrowedBy ex:chen .
```

```sparql query
PREFIX ex: <http://example.org/library#>

SELECT ?m ?name WHERE { ?m a ex:ActiveMember ; ex:name ?name }
```

```sparql solution
PREFIX ex:   <http://example.org/library#>
PREFIX skos: <http://www.w3.org/2004/02/skos/core#>

SELECT ?name ?genreLabel
WHERE {
  ?m ex:borrowed ?book ; ex:name ?name .
  ?book ex:genre ?g .
  ?g skos:broader* ex:Fiction ; skos:prefLabel ?genreLabel .
  FILTER(LANG(?genreLabel) = "en")
}
```
