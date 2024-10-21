import { LinkData } from '../../components/diagram/useTrackChanges';

export interface PagedQueryResponse<T> {
  limit: number;
  offset: number;
  count: number;
  total?: number;
  results: T[];
}

export interface SchemaAttribute {
  name: string;
  type: string;
  required: boolean;
  set: boolean;
  reference?: {
    by: string;
    type: string;
  };
  enum?: { label: string; value: string }[];
}

export interface ProductTypeAttribute {
  name: string;
  label: Record<string, string>;
  isRequired: boolean;
  type: {
    name: string;
    values?: { label: string | Record<string, string>; key: string }[];
    referenceTypeId?: string;
    elementType?: {
      name: string;
      values?: { label: string | Record<string, string>; key: string }[];
      referenceTypeId?: string;
    };
  };
}

export interface SchemaTypeResponse {
  id: string;
  key: string;
  value: {
    attributes: SchemaAttribute[];
  };
}

export interface LinkDataResponse {
  id: string;
  key: string;
  value: LinkData[];
}

export interface TypeAttribute {
  name: string;
  label: Record<string, string>;
  required: boolean;
  type: {
    name: string;
    values?: { label: string | Record<string, string>; key: string }[];
    referenceTypeId?: string;
    elementType?: {
      name: string;
      values?: { label: string | Record<string, string>; key: string }[];
      referenceTypeId?: string;
    };
  };
}

export interface ProductTypeResponse {
  id: string;
  name: string;
  key: string;
  attributes: ProductTypeAttribute[];
}

export interface TypeResponse {
  id: string;
  name: string;
  key: string;
  fieldDefinitions: TypeAttribute[];
  resourceTypeIds: string[];
}

export type GoEntity = {
  key: string;
  location: go.Point;
  items: {
    name: string;
    iskey: boolean;
    figure: string;
    color: string;
  }[];
};
