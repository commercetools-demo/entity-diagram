import React, { useEffect, useState } from 'react';
import { useConnector } from '../../hooks/use-connector';
import {
  GoEntity,
  ProductTypeResponse,
  SchemaTypeResponse,
  TypeResponse,
} from '../../hooks/use-connector/types';
import Canvas from './canvas';

type Props = {};

const Diagram = (props: Props) => {
  const { fetchAll } = useConnector();

  const [data, setData] = useState<GoEntity[]>();

  useEffect(() => {
    fetchAll().then((result) => {
      const { schemas, productTypes, types } = result;
      setData([...schemas, ...productTypes, ...types]);
    });
  }, []);

  if (!data) {
    return null;
  }
  return <Canvas data={data} />;
};

export default Diagram;
