interface KeyValueToken {
  type: string;
  value: string | string[];
}

enum FileType {
  Model = 'model',
  Dataset = 'dataset',
  Dashboard = 'dashboard',
  Text = 'text',
}

enum PropertyType {
  DataSourceName = 'datasource',
  Metric = 'metric',
  Dimension = 'dimension',
  Measure = 'measure',
  Tag = 'tag',
  Owner = 'owner',
}

enum FieldType {
  OWNER = 'owner',
  TAG = 'tag',
  DATASOURCE = 'datasource',
}

type FilterObjectType = PropertyType.Dimension
  | PropertyType.Measure
  | PropertyType.Metric
  | FileType.Model
  | FileType.Dataset
  | FileType.Dashboard

type FilterFieldType = FieldType;

type FilterType = 'object' | 'field' | 'text';

interface BaseFilter {
  type: FilterType
}

interface ObjectFilter extends BaseFilter {
  type: 'object';
  objectType: FilterObjectType;
  objectName: string;
}

interface FieldFilter extends BaseFilter {
  type: 'field';
  fieldType: FilterFieldType;
  fieldName: string;
}

interface TextFilter extends BaseFilter {
  type: 'text';
  searchText: string;
}

type Filter = ObjectFilter | FieldFilter | TextFilter;

type SearchFile = {
  path: string,
  content: string,
}

type SearchModes = {
  matchCase: boolean;
  matchWholeWord: boolean;
}

type SearchOptions = SearchModes & {
  prefixRegex?: RegExp;
  fileType?: string;
};

type SearchOperator = {
  searchText: string;
  options: SearchOptions;
};

type MultipleSearchParams = {
  files: Record<string, SearchFile>;
  operators: SearchOperator[];
  searchId: number;
};

type SingleSearchParams = {
  file: SearchFile;
  operator: SearchOperator;
  searchId: number;
};

type SearchData = SearchOptions & {
  searchText: string;
}

interface SearchMatch {
  text: string;
  start: number;
  end: number;
  lineContent: string;
  lineNumber: number;
}

interface SearchResult {
  filePath: string;
  matches: SearchMatch[];
  hasMatch: boolean;
}

const FILTER_VALUE_REGEX = /[^\s:]+/;

export type {
  SearchFile,
  SearchOptions,
  SearchOperator,
  MultipleSearchParams,
  SingleSearchParams,
  SearchMatch,
  SearchResult,
  SearchModes,
  SearchData,
};

export type {
  Filter,
  FilterObjectType,
  FilterFieldType,
  ObjectFilter,
  FieldFilter,
  TextFilter,
};

export type { KeyValueToken };
export { FILTER_VALUE_REGEX, PropertyType, FileType, FieldType };