import {
  useAsyncDispatch,
  actions,
  TSdkAction,
} from '@commercetools-frontend/sdk';
import { MC_API_PROXY_TARGETS } from '@commercetools-frontend/constants';
import { useApplicationContext } from '@commercetools-frontend/application-shell-connectors';
import {
  CustomObject,
  LinkData,
  LinkDataResponse,
  LocationData,
  LocationDataResponse,
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

const SCHEMA_CONTAINER = 'mc-custom-object-schema';
const LINK_DATA_CONTAINER = 'mc-link-data';
const LINK_DATA_KEY = 'linkDataList';
const LOCATION_DATA_KEY = 'locationDataList';

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
  const dispatchLocationData = useAsyncDispatch<
    TSdkAction,
    PagedQueryResponse<LocationDataResponse>
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
            where: `key = "${LINK_DATA_KEY}"`,
          }
        ),
      })
    );
    if (!result || result.count === 0) return {} as CustomObject<LinkData[]>;
    return result.results[0] || ({} as CustomObject<LinkData[]>);
  };
  const fetchLocationData = async (limit: number = 200, page: number = 1) => {
    const offset = (page - 1) * limit;

    const result = await dispatchLocationData(
      actions.get({
        mcApiProxyTarget: MC_API_PROXY_TARGETS.COMMERCETOOLS_PLATFORM,
        uri: buildUrlWithParams(
          `/${context?.project?.key}/custom-objects/${LINK_DATA_CONTAINER}`,
          {
            ...(limit && { limit: limit.toString() }),
            ...(offset && { offset: offset.toString() }),
            where: `key = "${LOCATION_DATA_KEY}"`,
          }
        ),
      })
    );
    if (!result || result.count === 0)
      return {} as CustomObject<LocationData[]>;
    return result.results[0] || ({} as CustomObject<LocationData[]>);
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
  const saveLocationData = async (locationDataList: LocationData[]) => {
    const result = await dispatchLocationData(
      actions.post({
        mcApiProxyTarget: MC_API_PROXY_TARGETS.COMMERCETOOLS_PLATFORM,
        uri: buildUrlWithParams(`/${context?.project?.key}/custom-objects`, {}),
        payload: {
          container: LINK_DATA_CONTAINER,
          key: LOCATION_DATA_KEY,
          value: locationDataList,
        },
      })
    );
    return result;
  };

  const fetchAll = async () => {
    const locationData = await fetchLocationData().then(
      (result) => result?.value
    );
    const [schemas, productTypes, types, linkData] = await Promise.all([
      fetchAllSchemas().then((result) =>
        mapSchemaTypeToGoEntities(result, locationData)
      ),
      fetchAllProductTypes().then((result) =>
        mapProductTypeToGoEntities(result, locationData)
      ),
      fetchAllTypes().then((result) =>
        mapTypeToGoEntities(result, locationData)
      ),
      fetchLinkData().then((result) => result?.value),
    ]);
    return { schemas, productTypes, types, linkData, locationData };
  };

  return {
    saveLinkData,
    saveLocationData,
    fetchAll,
    fetchLinkData,
  };
};
