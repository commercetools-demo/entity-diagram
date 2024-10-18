import React, { useEffect } from 'react';
import go from 'gojs/release/go-debug';
import styled from 'styled-components';
import { GoEntity } from '../../hooks/use-connector/types';
type Props = {
  data: {
    schemas: GoEntity[];
    productTypes: GoEntity[];
    types: GoEntity[];
  };
};

const StyledDiv = styled.div`
  background-color: white;
  border: solid 1px black;
  width: 100%;
  height: 700px;
`;

const Canvas = (props: Props) => {
  function init() {
    let myDiagram = new go.Diagram('myDiagramDiv', {
      allowDelete: false,
      allowCopy: false,
      layout: new go.ForceDirectedLayout({ isInitial: false }),
      'undoManager.isEnabled': true,
      // use "Modern" themes from extensions/Themes
      'themeManager.changesDivBackground': true,
    });

    myDiagram.themeManager.set('light', {
      colors: {
        primary: '#f7f9fc',
        green: '#62bd8e',
        blue: '#3999bf',
        purple: '#7f36b0',
        red: '#c41000',
      },
    });
    myDiagram.themeManager.set('dark', {
      colors: {
        primary: '#4a4a4a',
        green: '#429e6f',
        blue: '#3f9fc6',
        purple: '#9951c9',
        red: '#ff4d3d',
      },
    });

    // the template for each attribute in a node's array of item data
    const itemTempl = new go.Panel('Horizontal', {
      margin: new go.Margin(2, 0),
    }).add(
      new go.Shape({
        desiredSize: new go.Size(15, 15),
        strokeWidth: 0,
        margin: new go.Margin(0, 5, 0, 0),
      })
        .bind('figure')
        .themeData('fill', 'color'),
      new go.TextBlock({
        font: '14px sans-serif',
        stroke: 'black',
      })
        .bind('text', 'name')
        .bind('font', 'iskey', (k) =>
          k ? 'italic 14px sans-serif' : '14px sans-serif'
        )
        .theme('stroke', 'text')
    );

    // define the Node template, representing an entity
    myDiagram.nodeTemplate = new go.Node('Auto', {
      // the whole node panel
      selectionAdorned: true,
      resizable: true,
      layoutConditions:
        go.LayoutConditions.Standard & ~go.LayoutConditions.NodeSized,
      fromSpot: go.Spot.LeftRightSides,
      toSpot: go.Spot.LeftRightSides,
    })
      .bindTwoWay('location')
      // whenever the PanelExpanderButton changes the visible property of the "LIST" panel,
      // clear out any desiredSize set by the ResizingTool.
      .bindObject(
        'desiredSize',
        'visible',
        (v) => new go.Size(NaN, NaN),
        undefined,
        'LIST'
      )
      .add(
        // define the node's outer shape, which will surround the Table
        new go.Shape('RoundedRectangle', {
          stroke: '#e8f1ff',
          strokeWidth: 3,
        }).theme('fill', 'primary'),
        new go.Panel('Table', {
          margin: 8,
          stretch: go.Stretch.Fill,
        })
          .addRowDefinition(0, { sizing: go.Sizing.None })
          .add(
            // the table header
            new go.TextBlock({
              row: 0,
              alignment: go.Spot.Center,
              margin: new go.Margin(0, 24, 0, 2), // leave room for Button
              font: 'bold 18px sans-serif',
            })
              .bind('text', 'key')
              .theme('stroke', 'text'),
            // the collapse/expand button
            go.GraphObject.build(
              'PanelExpanderButton',
              {
                row: 0,
                alignment: go.Spot.TopRight,
              },
              'LIST'
            ) // the name of the element whose visibility this button toggles
              .theme('ButtonIcon.stroke', 'text'),
            new go.Panel('Table', {
              name: 'LIST',
              row: 1,
              alignment: go.Spot.TopLeft,
            }).add(
              new go.TextBlock('Attributes', {
                row: 0,
                alignment: go.Spot.Left,
                margin: new go.Margin(3, 24, 3, 2),
                font: 'bold 15px sans-serif',
              }).theme('stroke', 'text'),
              go.GraphObject.build(
                'PanelExpanderButton',
                {
                  row: 0,
                  alignment: go.Spot.Right,
                },
                'NonInherited'
              ).theme('ButtonIcon.stroke', 'text'),
              new go.Panel('Vertical', {
                row: 1,
                name: 'NonInherited',
                alignment: go.Spot.TopLeft,
                defaultAlignment: go.Spot.Left,
                itemTemplate: itemTempl,
              }).bind('itemArray', 'items'),
              new go.TextBlock('Inherited Attributes', {
                row: 2,
                alignment: go.Spot.Left,
                margin: new go.Margin(3, 24, 3, 2), // leave room for Button
                font: 'bold 15px sans-serif',
              })
                .bind(
                  'visible',
                  'inheritedItems',
                  (arr) => Array.isArray(arr) && arr.length > 0
                )
                .theme('stroke', 'text'),
              go.GraphObject.build(
                'PanelExpanderButton',
                {
                  row: 2,
                  alignment: go.Spot.Right,
                },
                'Inherited'
              )
                .bind(
                  'visible',
                  'inheritedItems',
                  (arr) => Array.isArray(arr) && arr.length > 0
                )
                .theme('ButtonIcon.stroke', 'text'),
              new go.Panel('Vertical', {
                row: 3,
                name: 'Inherited',
                alignment: go.Spot.TopLeft,
                defaultAlignment: go.Spot.Left,
                itemTemplate: itemTempl,
              }).bind('itemArray', 'inheritedItems')
            )
          )
      );

    // define the Link template, representing a relationship
    myDiagram.linkTemplate = new go.Link({
      // the whole link panel
      selectionAdorned: true,
      layerName: 'Background',
      reshapable: true,
      routing: go.Routing.AvoidsNodes,
      corner: 5,
      curve: go.Curve.JumpOver,
    }).add(
      new go.Shape({
        // the link shape
        stroke: '#f7f9fc',
        strokeWidth: 3,
      }).theme('stroke', 'link'),
      new go.TextBlock({
        // the "from" label
        textAlign: 'center',
        font: 'bold 14px sans-serif',
        stroke: 'black',
        segmentIndex: 0,
        segmentOffset: new go.Point(NaN, NaN),
        segmentOrientation: go.Orientation.Upright,
      })
        .bind('text')
        .theme('stroke', 'text'),
      new go.TextBlock({
        // the "to" label
        textAlign: 'center',
        font: 'bold 14px sans-serif',
        stroke: 'black',
        segmentIndex: -1,
        segmentOffset: new go.Point(NaN, NaN),
        segmentOrientation: go.Orientation.Upright,
      })
        .bind('text', 'toText')
        .theme('stroke', 'text')
    );

    // create the model for the E-R diagram
    // const nodeDataArray = [
    //   {
    //     key: 'Products',
    //     location: new go.Point(250, 250),
    //     items: [
    //       {
    //         name: 'ProductID',
    //         iskey: true,
    //         figure: 'Rectangle',
    //         color: 'purple',
    //       },
    //       {
    //         name: 'ProductName',
    //         iskey: false,
    //         figure: 'Rectangle',
    //         color: 'blue',
    //       },
    //       {
    //         name: 'ItemDescription',
    //         iskey: false,
    //         figure: 'Rectangle',
    //         color: 'blue',
    //       },
    //       {
    //         name: 'WholesalePrice',
    //         iskey: false,
    //         figure: 'Circle',
    //         color: 'green',
    //       },
    //       {
    //         name: 'ProductPhoto',
    //         iskey: false,
    //         figure: 'TriangleUp',
    //         color: 'red',
    //       },
    //     ],
    //     inheritedItems: [
    //       {
    //         name: 'SupplierID',
    //         iskey: false,
    //         figure: 'Rectangle',
    //         color: 'purple',
    //       },
    //       {
    //         name: 'CategoryID',
    //         iskey: false,
    //         figure: 'Rectangle',
    //         color: 'purple',
    //       },
    //     ],
    //   },
    //   {
    //     key: 'Suppliers',
    //     location: new go.Point(500, 0),
    //     items: [
    //       {
    //         name: 'SupplierID',
    //         iskey: true,
    //         figure: 'Rectangle',
    //         color: 'purple',
    //       },
    //       {
    //         name: 'CompanyName',
    //         iskey: false,
    //         figure: 'Rectangle',
    //         color: 'blue',
    //       },
    //       {
    //         name: 'ContactName',
    //         iskey: false,
    //         figure: 'Rectangle',
    //         color: 'blue',
    //       },
    //       { name: 'Address', iskey: false, figure: 'Rectangle', color: 'blue' },
    //       {
    //         name: 'ShippingDistance',
    //         iskey: false,
    //         figure: 'Circle',
    //         color: 'green',
    //       },
    //       { name: 'Logo', iskey: false, figure: 'TriangleUp', color: 'red' },
    //     ],
    //     inheritedItems: [],
    //   },
    //   {
    //     key: 'Categories',
    //     location: new go.Point(0, 30),
    //     items: [
    //       {
    //         name: 'CategoryID',
    //         iskey: true,
    //         figure: 'Rectangle',
    //         color: 'purple',
    //       },
    //       {
    //         name: 'CategoryName',
    //         iskey: false,
    //         figure: 'Rectangle',
    //         color: 'blue',
    //       },
    //       {
    //         name: 'Description',
    //         iskey: false,
    //         figure: 'Rectangle',
    //         color: 'blue',
    //       },
    //       { name: 'Icon', iskey: false, figure: 'TriangleUp', color: 'red' },
    //     ],
    //     inheritedItems: [
    //       {
    //         name: 'SupplierID',
    //         iskey: false,
    //         figure: 'Rectangle',
    //         color: 'purple',
    //       },
    //     ],
    //   },
    //   {
    //     key: 'Order Details',
    //     location: new go.Point(600, 350),
    //     items: [
    //       {
    //         name: 'OrderID',
    //         iskey: true,
    //         figure: 'Rectangle',
    //         color: 'purple',
    //       },
    //       { name: 'UnitPrice', iskey: false, figure: 'Circle', color: 'green' },
    //       { name: 'Quantity', iskey: false, figure: 'Circle', color: 'green' },
    //       { name: 'Discount', iskey: false, figure: 'Circle', color: 'green' },
    //     ],
    //     inheritedItems: [
    //       {
    //         name: 'ProductID',
    //         iskey: false,
    //         figure: 'Rectangle',
    //         color: 'purple',
    //       },
    //     ],
    //   },
    // ];
    // const linkDataArray = [
    //   { from: 'Products', to: 'Suppliers', text: '0..N', toText: '1' },
    //   { from: 'Products', to: 'Categories', text: '0..N', toText: '1' },
    //   { from: 'Order Details', to: 'Products', text: '0..N', toText: '1' },
    //   { from: 'Categories', to: 'Suppliers', text: '0..N', toText: '1' },
    // ];
    myDiagram.model = new go.GraphLinksModel({
      copiesArrays: true,
      copiesArrayObjects: true,
      nodeDataArray: props.data,
      // linkDataArray: linkDataArray,
    });
  }

  useEffect(() => {
    init();
  }, []);

  return <StyledDiv id="myDiagramDiv"></StyledDiv>;
};

export default Canvas;
