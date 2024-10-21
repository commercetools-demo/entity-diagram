import * as go from 'gojs';
import {
  PagedQueryResponse,
  SchemaTypeResponse,
  ProductTypeResponse,
  TypeResponse,
  GoEntity,
} from './types'; // Assuming types are defined in a separate file

// Helper function to generate a random color
const getRandomColor = (): string => {
  return '#' + Math.floor(Math.random() * 16777215).toString(16);
};

const PRODUCT_INHERITED_ATTRIBUTES = [
  {
    name: 'id',
    iskey: true,
    figure: 'Diamond',
  },
  {
    name: 'name',
    iskey: false,
    figure: 'Rectangle',
  },
  {
    name: 'description',
    iskey: false,
    figure: 'Rectangle',
  },
];

// Helper function to create a GoEntity
const createGoEntity = (
  key: string,
  name: string,
  items: { name: string; iskey: boolean }[],
  type: 'CustomObject' | 'CustomType' | 'ProductType'
): GoEntity => {
  return {
    key,
    location: new go.Point(1, 300), // You may want to set a specific location or randomize it
    items: items.map((item) => ({
      name: item.name,
      iskey: item.iskey,
      figure: 'Rectangle',
      color:
        type === 'ProductType'
          ? 'blue'
          : type === 'CustomType'
          ? 'red'
          : 'green',
      
    })),
    ...(type === 'ProductType' && {
      inheritedItems: PRODUCT_INHERITED_ATTRIBUTES,
    }),
  };
};

// Method to map SchemaTypeResponse to GoEntity[]
export const mapSchemaTypeToGoEntities = (
  response: PagedQueryResponse<SchemaTypeResponse>
): GoEntity[] => {
  return response.results.map((schema) => {
    const items = schema.value.attributes.map((attr) => ({
      name: attr.name,
      iskey: attr.name === 'id', // Assuming 'id' is always the key
    }));
    return createGoEntity(schema.key, schema.key, items, 'CustomObject');
  });
};

// Method to map ProductTypeResponse to GoEntity[]
export const mapProductTypeToGoEntities = (
  response: PagedQueryResponse<ProductTypeResponse>
): GoEntity[] => {
  return response.results.map((productType) => {
    const items = productType.attributes.map((attr) => ({
      name: attr.name,
      iskey: attr.name === 'id', // Assuming 'id' is always the key
    }));
    return createGoEntity(
      productType.name ?? productType.key,
      productType.key,
      items,
      'ProductType'
    );
  });
};

// Method to map TypeResponse to GoEntity[]
export const mapTypeToGoEntities = (
  response: PagedQueryResponse<TypeResponse>
): GoEntity[] => {
  return response.results.map((type) => {
    const items = type.fieldDefinitions.map((field) => ({
      name: field.name,
      iskey: field.name === 'id', // Assuming 'id' is always the key
    }));
    return createGoEntity(type.key, type.name, items, 'CustomType');
  });
};
