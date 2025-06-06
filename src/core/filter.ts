import { KeyValueParser } from './keyValueParser';
import {
  KeyValueToken,
  ObjectFilter,
  FilterFieldType,
  TextFilter,
  Filter,
  FieldFilter,
  SearchOperator,
  SearchOptions,
  FilterObjectType,
  FILTER_VALUE_REGEX,
} from '../types';
import {
  isAMLObjectType,
  isFileObjectType,
  isAMLFieldFilter,
  isFileType,
  escapeRegExp,
  isPropertyType,
} from '../helper';

function isFileObjectFilter(filter: Filter): boolean {
  return filter.type === 'object' && isFileObjectType(filter.objectType);
}

const buildTextFilterFromKeyValue = (key: string, value: string): TextFilter => {
  return { type: 'text', searchText: `${key}:${value}` };
};

const serializeFilter = (filter: Filter): string => {
  switch (filter.type) {
    case 'text':
      return `${filter.type}-${filter.searchText}`;
    case 'field':
      return `${filter.type}-${filter.fieldType}-${filter.fieldName}`;
    case 'object':
      return `${filter.type}-${filter.objectType}-${filter.objectName}`;
    default:
      return '';
  }
};

function mergeFilters(filters: Filter[]): Filter[] {
  const combinedFilters: Filter[] = [];
  let currentTextFilter: TextFilter | null = null;

  filters.forEach(filter => {
    if (filter.type === 'text') {
      if (currentTextFilter) {
        currentTextFilter.searchText += ` ${filter.searchText}`;
      } else {
        currentTextFilter = { type: 'text', searchText: filter.searchText };
      }
    } else {
      if (currentTextFilter) {
        combinedFilters.push(currentTextFilter);
        currentTextFilter = null;
      }
      combinedFilters.push(filter);
    }
  });

  if (currentTextFilter) {
    combinedFilters.push(currentTextFilter);
  }

  return combinedFilters;
}

const buildFilterFromKeyValueTokens = (tokens: KeyValueToken[]): Filter[] => {
  return tokens.map(token => {
    if (token.type === 'keyValue') {
      const [key, _, value] = token.value as [string, string, string];

      if (key === 'type' && (isAMLObjectType(value) || isFileObjectType(value))) {
        return { type: 'object', objectType: value, objectName: '' };
      }

      if (isAMLFieldFilter(key) && FILTER_VALUE_REGEX.test(value)) {
        return { type: 'field', fieldType: key, fieldName: value };
      }

      // Unrecognized key-value remains as is
      return buildTextFilterFromKeyValue(key, value);
    }

    if (token.type === 'text') {
      return { type: 'text', searchText: token.value };
    }

    return token;
  }) as Filter[];
};


const buildPrefixRegexForObjectType = (objectType: FilterObjectType): RegExp | undefined => {
  switch (objectType) {
    case 'dimension':
    case 'measure':
    case 'metric':
      return new RegExp(`\\s${escapeRegExp(objectType)}\\s+.*`);

    case 'dataset':
    case 'model':
    case 'dashboard':
      return undefined;
    default: return undefined;
  }
};

const buildPrefixRegexForFieldType = (fieldType: FilterFieldType): RegExp | undefined => {
  switch (fieldType) {
    case 'owner':
    case 'tag':
      return new RegExp(`\\s${escapeRegExp(fieldType)}:\\s+.*`);
    case 'datasource':
      return /\sdata_source_name:\s+.*/;
    default: return undefined;
  }
};

const buildPrefixRegexForFieldFilter = (filter: FieldFilter): RegExp | undefined => {
  return buildPrefixRegexForFieldType(filter.fieldType as FilterFieldType);
};

const buildPrefixRegexForObjectFilter = (filter: ObjectFilter): RegExp | undefined => {
  if (isFileObjectType(filter.objectType)) {
    return undefined;
  }
  return buildPrefixRegexForObjectType(filter.objectType as FilterObjectType);
};

function getSearchTextFromFilter({ filter }: { filter: Filter }): string | undefined {
  switch (filter.type) {
    case 'field': return filter.fieldName;
    case 'object':
      if (isFileType(filter.objectType)) {
        return undefined;
      }
      return filter.objectName;
    case 'text': return filter.searchText;
    default: return undefined;
  }
}

function buildSearchOperatorsFromFilters(filters: Filter[], baseOption: SearchOptions): SearchOperator[] {
  const operators: SearchOperator[] = [];

  for (let i = 0; i < filters.length; i++) {
    const filter = filters[i];

    // Handle type filters
    if (filter.type === 'object') {
      if (isFileObjectType(filter.objectType)) {
        operators.push({
          searchText: filter.objectName,
          options: {
            ...baseOption,
            fileType: filter.objectType,
          },
        });
        continue;
      }

      if (isPropertyType(filter.objectType)) {
        if (i + 1 < filters.length && filters[i + 1].type === 'text') {
          const operator = {
            searchText: filters[i + 1]?.searchText || '',
            options: {
              ...baseOption,
            },
          };

          const prefixRegex = buildPrefixRegexForObjectType(filter.objectType as FilterObjectType);

          if (prefixRegex) {
            operator.options.prefixRegex = prefixRegex;
          }

          if (isFileObjectType(filter.objectType)) {
            operator.options.fileType = filter.objectType;
          }

          operators.push(operator);
          // Skip the next filter since we've used it
          i++;
        }

        // If no text token follows, discard the object filter
      } else {
        // For other type filters, use objectName
        operators.push({
          searchText: filter.objectName,
          options: {
            ...baseOption,
            prefixRegex: buildPrefixRegexForObjectFilter(filter as ObjectFilter),
          },
        });
      }
    } else if (filter.type === 'field') {
      // Handle field filters
      operators.push({
        searchText: filter.fieldName,
        options: {
          ...baseOption,
          prefixRegex: buildPrefixRegexForFieldFilter(filter as FieldFilter),
        },
      });
    } else if (filter.type === 'text') {
      // Handle text filters
      operators.push({
        searchText: filter.searchText,
        options: {
          ...baseOption,
        },
      });
    }
  }

  return operators;
}

const parseQuery = (input: string): Filter[] => {
  const kvParser = new KeyValueParser();
  const tokens = kvParser.parse(input);

  const baseFilters = buildFilterFromKeyValueTokens(tokens);

  return mergeFilters(baseFilters);
}

export {
  parseQuery,
};
