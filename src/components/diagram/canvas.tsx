import React, { useEffect } from 'react';
import go from 'gojs/release/go';
import styled from 'styled-components';
import { useChange } from '../../providers/changes';

const StyledDiv = styled.div`
  background-color: white;
  border: solid 1px black;
  width: 100%;
  height: 700px;
`;

export const generateUUID = () => {
  const now = new Date();
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (now.getTime() + Math.random() * 16) % 16 | 0;
    now.setMilliseconds(now.getMilliseconds() + 1);
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
  });
};

const Canvas = () => {
  const { linkData, trackLinkChange, nodeData, trackNodeChange } = useChange();

  function init() {
    let myDiagram = new go.Diagram('myDiagramDiv', {
      'undoManager.isEnabled': true, // enable undo & redo
      'themeManager.changesDivBackground': true,
    });

    myDiagram.addDiagramListener('SelectionMoved', (e) => {
      const selection = e.diagram.selection;
      selection.each((part) => {
        if (part instanceof go.Node) {
          trackNodeChange({
            type: 'nodePositionChanged',
            nodeKey: part.key,
            loc: part.data.loc,
          });
        }
      });
    });

    // Track changes to links (add, remove, text changes)
    myDiagram.addDiagramListener('LinkDrawn', (e) => {
      const link = e.subject;

      trackLinkChange({
        type: 'linkAdded',
        key: link.key,
        fromNode: link.fromNode.key,
        toNode: link.toNode.key,
        text: link.data.text,
        toText: link.data.toText,
      });
    });

    myDiagram.addDiagramListener('LinkRelinked', (e) => {
      const link = e.subject;
      trackLinkChange({
        type: 'linkModified',
        oldFromNode: e.oldFromNode ? e.oldFromNode.key : null,
        oldToNode: e.oldToNode ? e.oldToNode.key : null,
        key: link.key,
        newFromNode: link.fromNode.key,
        newToNode: link.toNode.key,
        text: link.data.text,
        toText: link.data.toText,
      });
    });

    myDiagram.addDiagramListener('SelectionDeleted', (e) => {
      e.subject.each((part) => {
        if (part instanceof go.Link) {
          trackLinkChange({
            type: 'linkRemoved',
            key: part.data?.key,
            fromNode: part.fromNode.key,
            toNode: part.toNode.key,
          });
        }
      });
    });

    // *****

    // set up some colors/fonts for the default ('light') and dark Themes
    myDiagram.themeManager.set('light', {
      colors: {
        text: '#000',
        start: '#064e3b',
        step: '#fff',
        conditional: '#6a9a8a',
        end: '#7f1d1d',
        comment: '#a691cc',
        bgText: '#fff',
        link: '#dcb263',
        linkOver: '#cbd5e1',
        div: '#fff',
        primary: '#f7f9fc',
        green: '#62bd8e',
        blue: '#3999bf',
        purple: '#7f36b0',
        red: '#c41000',
      },
    });

    myDiagram.themeManager.set('dark', {
      colors: {
        text: '#fff',
        step: '#414a8d',
        conditional: '#88afa2',
        comment: '#bfb674',
        bgText: '#fff',
        link: '#fdb71c',
        linkOver: '#475569',
        div: '#141e37',
        primary: '#4a4a4a',
        green: '#429e6f',
        blue: '#3f9fc6',
        purple: '#9951c9',
        red: '#ff4d3d',
      },
    });

    // defineFigures();

    // helper definitions for node templates
    function nodeStyle(node) {
      node
        // the Node.location is at the center of each node
        // .set({ locationSpot: go.Spot.Center })
        // The Node.location comes from the "loc" property of the node data,
        // converted by the Point.parse static method.
        // If the Node.location is changed, it updates the "loc" property of the node data,
        // converting back using the Point.stringify static method.
        .bindTwoWay('location', 'loc', go.Point.parse, go.Point.stringify);
    }

    function shapeStyle(shape) {
      // make the whole node shape a port
      shape.set({ strokeWidth: 2, portId: '', cursor: 'pointer' });
    }

    function textStyle(textblock) {
      textblock
        .set({ margin: 6, font: 'bold 11pt Figtree, sans-serif' })
        .theme('stroke', 'text');
    }

    myDiagram.nodeTemplateMap.add(
      'Start',
      new go.Node('Auto')
        .apply(nodeStyle)
        .add(
          new go.Shape('Capsule', { fromLinkable: true })
            .apply(shapeStyle)
            .theme('fill', 'start'),
          new go.TextBlock('Start', { margin: new go.Margin(5, 6) })
            .apply(textStyle)
            .bind('text')
        )
    );

    myDiagram.nodeTemplateMap.add(
      'End',
      new go.Node('Auto')
        .apply(nodeStyle)
        .add(
          new go.Shape('Capsule', { toLinkable: true })
            .apply(shapeStyle)
            .theme('fill', 'end'),
          new go.TextBlock('End', { margin: new go.Margin(5, 6) })
            .apply(textStyle)
            .bind('text')
        )
    );

    // temporary links used by LinkingTool and RelinkingTool are also orthogonal:
    myDiagram.toolManager.linkingTool.temporaryLink.routing =
      go.Routing.Orthogonal;
    myDiagram.toolManager.relinkingTool.temporaryLink.routing =
      go.Routing.Orthogonal;
    //**** */

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

    // define the Node templates for regular nodes
    myDiagram.nodeTemplateMap.add(
      '', // the default category
      new go.Node('Auto')
        .apply(nodeStyle)
        .add(
          new go.Shape('Rectangle', {
            fromLinkable: true,
            toLinkable: true,
            fromSpot: go.Spot.AllSides,
            toSpot: go.Spot.AllSides,
            stroke: '#e8f1ff',
          })

            .apply(shapeStyle)
            .theme('fill', 'step'),
          new go.TextBlock({
            margin: 12,
            maxSize: new go.Size(160, NaN),
            wrap: go.Wrap.Fit,
            editable: true,
          })
            .apply(textStyle)
            .bindTwoWay('text')
        )

        .bindObject(
          'desiredSize',
          'visible',
          (v) => new go.Size(NaN, NaN),
          undefined,
          'LIST'
        )
        .add(
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
            new go.TextBlock({
              row: 0,
              alignment: go.Spot.Center,
              margin: new go.Margin(0, 24, 0, 2), // leave room for Button
              font: 'bold 18px sans-serif',
            })
              .bind('text', 'key')
              .theme('stroke', 'text'),
            new go.TextBlock('Attributes', {
              row: 1,
              alignment: go.Spot.Left,
              margin: new go.Margin(3, 24, 3, 2),
              font: 'bold 15px sans-serif',
            }).theme('stroke', 'text'),
            new go.TextBlock('Attributes', {
              row: 1,
              alignment: go.Spot.Left,
              margin: new go.Margin(3, 24, 3, 2),
              font: 'bold 15px sans-serif',
            }).theme('stroke', 'text'),
            new go.Panel('Vertical', {
              row: 2,
              name: 'NonInherited',
              alignment: go.Spot.TopLeft,
              defaultAlignment: go.Spot.Left,
              itemTemplate: itemTempl,
            }).bind('itemArray', 'items'),
            new go.TextBlock('Inherited Attributes', {
              row: 3,
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
                row: 3,
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
              row: 4,
              name: 'Inherited',
              alignment: go.Spot.TopLeft,
              defaultAlignment: go.Spot.Left,
              itemTemplate: itemTempl,
            }).bind('itemArray', 'inheritedItems')
          )
        )
      ///////
    );

    // replace the default Link template in the linkTemplateMap
    myDiagram.linkTemplate = new go.Link({
      routing: go.Routing.AvoidsNodes,
      curve: go.Curve.JumpOver,
      corner: 5,
      toShortLength: 4,
      relinkableFrom: true,
      relinkableTo: true,
      reshapable: true,
      resegmentable: true,
      // mouse-overs subtly highlight links:
      mouseEnter: (e, link) =>
        (link.findObject('HIGHLIGHT').stroke =
          link.diagram.themeManager.findValue('linkOver', 'colors')),
      mouseLeave: (e, link) =>
        (link.findObject('HIGHLIGHT').stroke = 'transparent'),
      // context-click creates an editable link label
      contextClick: (e, link) => {
        e.diagram.model.commit((m) => {
          m.set(link.data, 'text', 'Label');
          m.set(link.data, 'toText', 'Relation');
        });
      },
    })
      .bindTwoWay('points')
      .add(
        // the highlight shape, normally transparent
        new go.Shape({
          isPanelMain: true,
          strokeWidth: 8,
          stroke: 'transparent',
          name: 'HIGHLIGHT',
        }),
        // the link path shape
        new go.Shape({ isPanelMain: true, strokeWidth: 2 }).theme(
          'stroke',
          'link'
        ),
        // the arrowhead
        new go.Shape({ toArrow: 'standard', strokeWidth: 0, scale: 1.5 }).theme(
          'fill',
          'link'
        ),
        // the link label
        new go.TextBlock({
          // the "from" label
          textAlign: 'center',
          font: 'bold 14px sans-serif',
          stroke: 'black',
          segmentIndex: 0,
          segmentOffset: new go.Point(NaN, NaN),
          segmentOrientation: go.Orientation.Upright,
          editable: true,
          textEdited: (tb, oldValue, newValue) => {
            trackLinkChange({
              type: 'linkTextChanged',
              key: tb.part?.key,
              fromNode: tb.part?.fromNode.key,
              toNode: tb.part?.toNode.key,
              oldText: oldValue,
              newText: newValue,
              isFromText: true, // or false for toText
            });
          },
        }).bindTwoWay('text'),
        new go.TextBlock({
          // the "to" label
          textAlign: 'center',
          font: 'bold 14px sans-serif',
          stroke: 'black',
          segmentIndex: -1,
          segmentOffset: new go.Point(NaN, NaN),
          segmentOrientation: go.Orientation.Upright,
          editable: true,
          textEdited: (tb, oldValue, newValue) => {
            trackLinkChange({
              type: 'linkTextChanged',
              key: tb.part?.key,
              fromNode: tb.part?.fromNode.key,
              toNode: tb.part?.toNode.key,
              oldText: oldValue,
              newText: newValue,
              isFromText: false, // or false for toText
            });
          },
        }).bindTwoWay('text', 'toText')
      );

    // define the Node template, representing an entity
    // myDiagram.nodeTemplate = new go.Node('Auto', {
    //   // the whole node panel
    //   selectionAdorned: true,

    // })
    //   .bindTwoWay('location')
    //   // whenever the PanelExpanderButton changes the visible property of the "LIST" panel,
    //   // clear out any desiredSize set by the ResizingTool.

    myDiagram.model = new go.GraphLinksModel({
      copiesArrays: true,
      copiesArrayObjects: true,
      copiesKeys: true,
      nodeDataArray: nodeData,
      makeUniqueLinkKeyFunction: generateUUID,
      linkKeyProperty: 'key',
      linkDataArray: JSON.parse(JSON.stringify(linkData)),
    });
  }

  useEffect(() => {
    init();
  }, []);

  return <StyledDiv id="myDiagramDiv"></StyledDiv>;
};

export default Canvas;
