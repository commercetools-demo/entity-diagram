import React, { useEffect, useState } from 'react';
import { useConnector } from '../../hooks/use-connector';
import { GoEntity } from '../../hooks/use-connector/types';
import Canvas from './canvas';
import { LinkData } from './useTrackChanges';

type Props = {};

const Diagram = (props: Props) => {
  const { fetchAll } = useConnector();

  const [data, setData] = useState<GoEntity[]>();
  const [links, setLinks] = useState<LinkData[]>();

  useEffect(() => {
    fetchAll().then((result) => {
      const { schemas, productTypes, types, linkData } = result;
      setData([...schemas, ...productTypes, ...types]);
      setLinks(linkData);
    });
  }, []);

  if (!data || !links) {
    return null;
  }
  return <Canvas data={data} links={links} />;
};

export default Diagram;
