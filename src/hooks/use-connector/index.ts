import {
  useAsyncDispatch,
  actions,
  TSdkAction,
} from '@commercetools-frontend/sdk';
import { MC_API_PROXY_TARGETS } from '@commercetools-frontend/constants';
import { useApplicationContext } from '@commercetools-frontend/application-shell-connectors';
import {
  LinkDataResponse,
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
import { LinkData } from '../../components/diagram/useTrackChanges';

const SCHEMA_CONTAINER = 'mc-custom-object-schema';
const LINK_DATA_CONTAINER = 'mc-link-data';
const LINK_DATA_KEY = 'linkDataList';

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
  const dispatchLinkData = useAsyncDispatch<
    TSdkAction,
    PagedQueryResponse<LinkDataResponse>
  >();

  const fetchAllSchemas = async (limit: number = 200, page: number = 1) => {
    const offset = (page - 1) * limit;

    const result = await dispatchSchemaRead(
      actions.get({
        mcApiProxyTarget: MC_API_PROXY_TARGETS.COMMERCETOOLS_PLATFORM,
        uri: buildUrlWithParams(
          `/${context?.project?.key}/custom-objects/${SCHEMA_CONTAINER}`,
          {
            ...(limit && { limit: limit.toString() }),
            ...(offset && { offset: offset.toString() }),
          }
        ),
      })
    );
    return result;
  };
  const fetchLinkData = async (limit: number = 200, page: number = 1) => {
    const offset = (page - 1) * limit;

    const result = await dispatchLinkData(
      actions.get({
        mcApiProxyTarget: MC_API_PROXY_TARGETS.COMMERCETOOLS_PLATFORM,
        uri: buildUrlWithParams(
          `/${context?.project?.key}/custom-objects/${LINK_DATA_CONTAINER}`,
          {
            ...(limit && { limit: limit.toString() }),
            ...(offset && { offset: offset.toString() }),
          }
        ),
      })
    );
    if (!result || result.count === 0) return [];
    return result.results[0] || [];
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
  const saveLinkData = async (linkDataList: LinkData[]) => {
    const result = await dispatchLinkData(
      actions.post({
        mcApiProxyTarget: MC_API_PROXY_TARGETS.COMMERCETOOLS_PLATFORM,
        uri: buildUrlWithParams(`/${context?.project?.key}/custom-objects`, {}),
        payload: {
          container: LINK_DATA_CONTAINER,
          key: LINK_DATA_KEY,
          value: linkDataList,
        },
      })
    );
    return result;
  };

  const fetchAll = async () => {
    const [schemas, productTypes, types, linkData] = await Promise.all([
      fetchAllSchemas().then((result) => mapSchemaTypeToGoEntities(result)),
      fetchAllProductTypes().then((result) =>
        mapProductTypeToGoEntities(result)
      ),
      fetchAllTypes().then((result) => mapTypeToGoEntities(result)),
      fetchLinkData().then((result) => result?.value),
    ]);
    return { schemas, productTypes, types, linkData };
  };

  return {
    saveLinkData,
    fetchAll,
    fetchLinkData,
  };
};
