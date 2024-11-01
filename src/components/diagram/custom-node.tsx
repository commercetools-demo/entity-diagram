import styled from 'styled-components';
import { Handle, Position, NodeProps, Node } from '@xyflow/react';
import { NodeEntity } from '../../hooks/use-connector/types';
const StyledNode = styled.div`
  background-color: white;
  ${({ color }) => color && `border: solid 2px ${color};`};
  padding: 10px 5px;
  min-width: 150px;
`;

const StyledH3 = styled.h3`
  text-align: center;
  margin: 10px 0 0 10px;
`;

const StyledSpan = styled.span`
  font-weight: 500;
`;

const StyledItemsWrapper = styled.div`
  padding: 0 10px;
  padding-top: 15px;
`;

const StyledUL = styled.ul`
  list-style-type: none;
  padding: 0;
  margin: 0;
`;

const StyledLi = styled.li`
  display: flex;
  align-items: center;
  padding: 0 5px;
`;

const StyledCircle = styled.div`
  width: 10px;
  height: 10px;
  border-radius: 50%;
  margin-right: 5px;
`;

export interface CustomNodeType extends Node {
  data: {
    label: string;
    items: NodeEntity['items'];
    inheritedItems: NodeEntity['inheritedItems'];
  };
}

export const CustomNode: React.FC<NodeProps<CustomNodeType>> = ({ data }) => {
  return (
    <StyledNode color={data.items?.[0]?.color}>
      <Handle type="target" position={Position.Top} style={{width: '10px', height: '10px'}} />
      <Handle type="source" position={Position.Bottom} style={{width: '10px', height: '10px'}} />

      {/* Node Title */}
      <StyledH3>{data.label}</StyledH3>

      {/* Items Section */}
      {data.items && data.items.length > 0 && (
        <StyledItemsWrapper className="border-t pt-2">
          <StyledSpan>Attributes</StyledSpan>
          <StyledUL>
            {data.items.map((item, index) => (
              <StyledLi key={index}>
                <StyledCircle
                  style={{
                    backgroundColor: item.color,
                  }}
                />
                <span className={`text-sm ${item.iskey ? 'italic' : ''}`}>
                  {item.name}
                </span>
              </StyledLi>
            ))}
          </StyledUL>
        </StyledItemsWrapper>
      )}
      {/* Items Section */}
      {data.inheritedItems && data.inheritedItems.length > 0 && (
        <StyledItemsWrapper>
          <StyledSpan>Inherited Attributes</StyledSpan>
          <StyledUL>
            {data.inheritedItems.map((item, index) => (
              <StyledLi key={index}>
                <StyledCircle
                  style={{
                    backgroundColor: 'black',
                  }}
                />
                <span className={`text-sm ${item.iskey ? 'italic' : ''}`}>
                  {item.name}
                </span>
              </StyledLi>
            ))}
          </StyledUL>
        </StyledItemsWrapper>
      )}
    </StyledNode>
  );
};
