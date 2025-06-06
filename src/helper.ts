import { FieldType, FileType, PropertyType } from "./types";

function isPropertyType(filterValue: string): filterValue is PropertyType {
  return Object.values(PropertyType).includes(filterValue as any);
}

function isFileType(value: string): value is FileType {
  return Object.values(FileType).includes(value as any);
}

function isAMLFieldFilter(value: string): value is FieldType {
  return [
    FieldType.OWNER,
    FieldType.DATASOURCE,
  ].includes(value as any);
}

function isAMLObjectType(value: string): value is PropertyType {
  return [
    PropertyType.Dimension,
    PropertyType.Measure,
    PropertyType.Metric,
    FileType.Model,
    FileType.Dataset,
    FileType.Dashboard,
  ].includes(value as any);
}

function isFileObjectType(value: string): value is FileType {
  return [
    FileType.Model,
    FileType.Dataset,
    FileType.Dashboard,
  ].includes(value as any);
}

function escapeRegExp(text: string) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export {
  isPropertyType,
  isFileType,
  isAMLFieldFilter,
  isAMLObjectType,
  isFileObjectType,
  escapeRegExp,
};