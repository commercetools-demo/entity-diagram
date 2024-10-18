import {
  useAsyncDispatch,
  actions,
  TSdkAction,
} from '@commercetools-frontend/sdk';
import { MC_API_PROXY_TARGETS } from '@commercetools-frontend/constants';
import { useApplicationContext } from '@commercetools-frontend/application-shell-connectors';
import {
  PagedQueryResponse,
  ProductTypeResponse,
  SchemaTypeResponse,
  TypeResponse,
} from './types';
import { buildUrlWithParams } from '../../utils/utils';
import {
  mapProductTypeToGoEntities,
  mapSchemaTypeToGoEntities,
  mapTypeToGoEntities,
} from './mapper';

const CONTAINER = 'mc-custom-object-schema';

export const useConnector = () => {
  const context = useApplicationContext((context) => context);
  const dispatchSchemaRead = useAsyncDispatch<
    TSdkAction,
    PagedQueryResponse<SchemaTypeResponse>
  >();
  const dispatchProductTypeRead = useAsyncDispatch<
    TSdkAction,
    PagedQueryResponse<ProductTypeResponse>
  >();
  const dispatchTypeRead = useAsyncDispatch<
    TSdkAction,
    PagedQueryResponse<TypeResponse>
  >();

  const fetchAllSchemas = async (limit: number = 200, page: number = 1) => {
    const offset = (page - 1) * limit;

    const result = await dispatchSchemaRead(
      actions.get({
        mcApiProxyTarget: MC_API_PROXY_TARGETS.COMMERCETOOLS_PLATFORM,
        uri: buildUrlWithParams(
          `/${context?.project?.key}/custom-objects/${CONTAINER}`,
          {
            ...(limit && { limit: limit.toString() }),
            ...(offset && { offset: offset.toString() }),
          }
        ),
      })
    );
    return result;
  };

  const fetchAllProductTypes = async (
    limit: number = 200,
    page: number = 1
  ) => {
    const offset = (page - 1) * limit;

    const result = await dispatchProductTypeRead(
      actions.get({
        mcApiProxyTarget: MC_API_PROXY_TARGETS.COMMERCETOOLS_PLATFORM,
        uri: buildUrlWithParams(`/${context?.project?.key}/product-types`, {
          ...(limit && { limit: limit.toString() }),
          ...(offset && { offset: offset.toString() }),
        }),
      })
    );
    return result;
  };

  const fetchAllTypes = async (limit: number = 200, page: number = 1) => {
    const offset = (page - 1) * limit;

    const result = await dispatchTypeRead(
      actions.get({
        mcApiProxyTarget: MC_API_PROXY_TARGETS.COMMERCETOOLS_PLATFORM,
        uri: buildUrlWithParams(`/${context?.project?.key}/types`, {
          ...(limit && { limit: limit.toString() }),
          ...(offset && { offset: offset.toString() }),
        }),
      })
    );
    return result;
  };

  const fetchAll = async () => {
    const [schemas, productTypes, types] = await Promise.all([
      fetchAllSchemas().then((result) => mapSchemaTypeToGoEntities(result)),
      fetchAllProductTypes().then((result) =>
        mapProductTypeToGoEntities(result)
      ),
      fetchAllTypes().then((result) => mapTypeToGoEntities(result)),
    ]);
    return { schemas, productTypes, types };
  };

  return {
    fetchAll,
  };
};
