import React, { Component } from 'react';
import { Table } from '@finos/perspective';
import { ServerRespond } from './DataStreamer';
import { DataManipulator } from './DataManipulator';
import './Graph.css';

interface IProps {
  data: ServerRespond[],
}

interface PerspectiveViewerElement extends HTMLElement {
  load: (table: Table) => void,
}

class Graph extends Component<IProps, {}> {
  table: Table | undefined;

  render() {
    return React.createElement('perspective-viewer');
  }

  componentDidMount() {
    // Get element from the DOM.
    const elem = document.getElementsByTagName('perspective-viewer')[0] as unknown as PerspectiveViewerElement;

    const schema = {
      timestamp: 'date',
      ratio: 'float',
      upper_bound: 'float',
      lower_bound: 'float',
      trigger_alert: 'float',
      price_abc: 'float',
      price_def: 'float',
    };

    if (window.perspective && window.perspective.worker()) {
      this.table = window.perspective.worker().table(schema);
    }
    
    if (this.table) {
      elem.load(this.table);
      elem.setAttribute('view', 'y_line');
      elem.setAttribute('row-pivots', '["timestamp"]');
      elem.setAttribute('columns', '["ratio", "upper_bound", "lower_bound", "trigger_alert"]');
      elem.setAttribute('aggregates', JSON.stringify({
        timestamp: 'distinct count',
        ratio: 'avg',
        upper_bound: 'avg',
        lower_bound: 'avg',
        trigger_alert: 'avg',
        price_abc: 'avg',
        price_def: 'avg',
      }));
    }
  }

  componentDidUpdate() {
    if (this.table) {
      this.table.update(
        [DataManipulator.generateRow(this.props.data)],  // Note: generateRow now returns a single object, so we wrap it in an array here.
      );
    }
  }
}

export default Graph;
