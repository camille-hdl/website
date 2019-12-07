---
title: Compose Elastica queries in PHP
date: "2019-12-07T16:57:00.000Z"
description: "Embrace the multi-paradigm"
---

[Elastica](https://elastica.io/api/latest/) is an Elasticsearch client library for PHP.  
Among other things, it handles transport and provides a class-based abstraction over the transiting JSON objects.  
While Elastica can be used for other tasks such as bulk indexing documents, this post will focus on the Query API.  

## Query building

As long as you're building queries whose general structure doesn't change much, the API is straightforward.  
However, I find that when dealing with more complex search techniques such as [faceted search](https://en.wikipedia.org/wiki/Faceted_search),
where fields and operators change according to user input, 
the code can get awkward if written in an imperative way.

As an example, imagine the following index type describing movies:

```php
/**
* This is an oversimplification of
* an actual Elasticsearch mapping
*/
$mapping = [
    "title" => "text",
    "genre" => "keyword",
    "director" => "keyword",
];
```

And the following search parameters sent from the front-end:

```php
$request = [
    "title" => ["q" => "Apocalypse"],
    "genre" => [ "q" => ["war", "horror"], "operator" => "OR"]
];
```

A naive imperative implementation could look like this:

```php
use \Elastica\ResultSet;
use \Elastica\Query\AbstractQuery;
use \Elastica\Query\BoolQuery;
use \Elastica\Query\Match;
use \Elastica\Query\SimpleQueryString;

function getQuery($request): AbstractQuery {
    $query = new BoolQuery();
    if (isset($request["title"])) {
        $fullTextQuery = new SimpleQueryString($request["title"]["q"] . "*", [
            "title",
        ]);
        $fullTextQuery->setDefaultOperator(SimpleQueryString::OPERATOR_AND);
        $fullTextQuery->setParam("analyze_wildcard", true);
        $query->addMust($fullTextQuery);
    }
    if (isset($request["genre"])) {
        if ($request["genre"]["operator"] === "OR") {
            $orQuery = new BoolQuery();
            $subQueries = [];
            foreach ($request["genre"]["q"] as $value) {
                $matchQuery = new Match();
                $matchQuery->setFieldQuery("title", $request["title"]["q"]);
                $subQueries[] = $matchQuery;
            }
            $orQuery->addShould($subQueries);
            $orQuery->setMinimumShouldMatch(1);
            $query->addMust($orQuery);
        } elseif ($request["genre"]["operator"] === "AND") {
            foreach ($request["genre"]["q"] as $value) {
                $matchQuery = new Match();
                $matchQuery->setFieldQuery("title", $request["title"]["q"]);
                $query->addMust($matchQuery);
            }
        }
    }
    /** ... */

    return new \Elastica\Query($query);
}

```

As you can imagine, as you add new searchable fields or field types, it can get difficult to read and maintain.

## A touch of functional flavor

Let's refactor this code to something more manageable using closures.  

First, we create a helper for the usual operators AND, OR and NOT.

```php
use \Elastica\Query\BoolQuery;

function getOperatorFn(string $operator): callable {
    $defaultOperator = "AND";
    // one could declare a function for each operator
    // to be more "declarative"
    $operatorFunctions = [
        "AND" => function (BoolQuery $query, array $subQueries): BoolQuery {
            if (count($subQueries) <= 0) {
                return $query;
            }
            $query->addMust($subQueries);
            return $query;
        },
        "OR" => function (BoolQuery $query, array $subQueries): BoolQuery {
            if (count($subQueries) <= 0) {
                return $query;
            }
            $orQuery = new BoolQuery();
            $orQuery->addShould($subQueries);
            $orQuery->setMinimumShouldMatch(1);
            $query->addMust($orQuery);
            return $query;
        },
        "NOT" => function (BoolQuery $query, array $subQueries): BoolQuery {
            if (count($subQueries) <= 0) {
                return $query;
            }
            $query->addMustNot($subQueries);
            return $query;
        }
    ];
    $actualOperator = isset($operatorFunctions[$operator]) ? $operator : $defaultOperator;
    return $operatorFunctions[$actualOperator];
}
```

Then, we need to figure out what kind of Query to build for a given field:

```php
use \Elastica\Query\SimpleQueryString;
use \Elastica\Query\Match;
use \Elastica\Query\SimpleQueryString;
use \Elastica\Query\AbstractQuery;

function getQueryBuilderForField(string $field, array $mapping): callable {
    $fieldType = $mapping[$field];
    if ($fieldType === "title") {
        return function(string $value) use($field): AbstractQuery {
            $fullTextQuery = new SimpleQueryString(
                $value . "*", 
                [$field]
            );
            $fullTextQuery->setDefaultOperator(SimpleQueryString::OPERATOR_AND);
            $fullTextQuery->setParam("analyze_wildcard", true);
            return $fullTextQuery;
        };
    }
    if ($fieldType === "keyword") {
        return function(string $value) use($field): AbstractQuery {
            $matchQuery = new Match();
            $matchQuery->setFieldQuery($field, $value);
            return $matchQuery;
        }
    }
    throw new \InvalidArgumentException("$fieldType is not supported");
}
```

Finally, let's create the actual query.  

```php
use \Elastica\Query\AbstractQuery;
use function \Functional\reduce_left;
use function \Functional\map;

function getQuery(array $request, array $mapping): AbstractQuery {
    $query = reduce_left(
        $request,
        function ($search, $field, $_, $query) use($mapping): BoolQuery {
            $operator = getOperatorFn($search["operator"]);
            $q = is_array($search["q"]) ? $search["q"] : [ $search["q"] ];
            return $operator(
                $query,
                map(
                    $q, 
                    getQueryBuilderForField($field, $mapping)
                )
            );
        },
        new BoolQuery()
    );
    return new \Elastica\Query($query);
}
```

> You can of course use the built-in `array_*` functions instead of [functional-php](https://github.com/lstrojny/functional-php).