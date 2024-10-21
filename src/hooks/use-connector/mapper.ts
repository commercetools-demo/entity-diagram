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

const getRandomPosition = (x?: number, y?: number): go.Point => {
  // Adjust these values based on your diagram size
  const maxX = 1000;
  const maxY = 1000;
  return new go.Point(
    x ?? Math.floor(Math.random() * maxX),
    y ?? Math.floor(Math.random() * maxY)
  );
};

// Helper function to create a GoEntity
const createGoEntity = (
  key: string,
  name: string,
  items: { name: string; iskey: boolean }[]
): GoEntity => {
  return {
    key,
    location: new go.Point(1,300), // You may want to set a specific location or randomize it
    items: items.map((item) => ({
      name: item.name,
      iskey: item.iskey,
      figure: 'Rectangle',
      color: getRandomColor(),
    })),
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
    return createGoEntity(schema.key, schema.key, items);
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
    return createGoEntity(productType.key, productType.name, items);
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
    return createGoEntity(type.key, type.name, items);
  });
};
