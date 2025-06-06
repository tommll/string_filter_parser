# String Filter Parser

A TypeScript library for parsing search queries to identify text, field, and object filters. (Inspired by https://help.obsidian.md/plugins/search#Search+operators)

## Installation

```bash
npm install string_filter_parser
```

## Usage

```typescript
import { parseQuery } from 'string_filter_parser';

// Parse your search query
const filters = parseQuery('your search query');
```

## Filter Types

The parser supports three types of filters:

### 1. Text Filter

Simple text search without any special syntax.

```typescript
const query = "search this text";
const filters = parseQuery(query);
// Result: [{ type: 'text', searchText: 'search this text' }]
```

### 2. Field Filter
Use the `field:value` syntax for field-based filtering.

- Sample field
```ruby
{
  owner: 'admin'
  ...
}
```

Supported field types:
- `owner`: Filter by owner
- `datasource`: Filter by data source
- `tag`: Filer by tag

Examples:
```typescript
// Filter by owner
const ownerQuery = "owner:admin";
const ownerFilters = parseQuery(ownerQuery);
// Result: [{ type: 'field', fieldType: 'owner', fieldName: 'admin' }]

// Filter by datasource
const datasourceQuery = "tag:mkt";
const datasourceFilters = parseQuery(datasourceQuery);
// Result: [{ type: 'field', fieldType: 'owner', fieldName: 'mkt' }]

// Combine multiple field filters
const combinedQuery = "owner:admin tag:mkt";
const combinedFilters = parseQuery(combinedQuery);
// Result: [
//   { type: 'field', fieldType: 'owner', fieldName: 'admin' },
//   { type: 'field', fieldType: 'tag', fieldName: 'mkt' }
// ]
```

### 3. Object Filter
Use `type:object text` syntax for object-base filtering

- Object sample:
```ruby
Model users {
  data_source: 'demodb'

  dimension name {
    ...
  }
  ...
}
```


Supported object types:
- `model`
- `dataset`
- `dimension`
- `measure`

Examples:
```typescript
// Filter by model
const modelQuery = "type:model user";
const modelFilters = parseQuery(modelQuery);
// Result: [
//   { type: 'object', objectType: 'model', objectName: 'user' },
// ]

// Filter by dimension
const dimensionQuery = "type:dimension revenue";
const dimensionFilters = parseQuery(dimensionQuery);
// Result: [
//   { type: 'object', objectType: 'dimension', objectName: 'revenue' },
// ]
```

## Combining Multiple Filters

You can combine different types of filters in a single query:

```typescript
const complexQuery = "type:model sales owner:admin datasource:mysql_db important";
const complexFilters = parseQuery(complexQuery);
// Result: [
//   { type: 'object', objectType: 'model', objectName: 'sales' },
//   { type: 'field', fieldType: 'owner', fieldName: 'admin' },
//   { type: 'field', fieldType: 'datasource', fieldName: 'mysql_db' },
//   { type: 'text', searchText: 'important' }
// ]
```

## Notes

- Field filters are case-sensitive
- Object type filters must be followed by a search text
- Text filters can be used anywhere in the query
- Multiple filters can be combined in any order 