import React, {Component} from 'react';
import './App.css';
import _ from 'lodash';
const d3 = require('d3');

const WIDTH = '4000';
const HEIGHT = '2000';
const GRAPH_ROOT_ID = 'graph-root';

// All force-directed graph stuff copied and adapted from
// https://observablehq.com/@d3/force-directed-graph?collection=@d3/d3-force.

const drag = simulation => {
  function dragstarted(d) {
    if (!d3.event.active) simulation.alphaTarget(0.3).restart();
    d.fx = d.x;
    d.fy = d.y;
  }

  function dragged(d) {
    d.fx = d3.event.x;
    d.fy = d3.event.y;
  }

  function dragended(d) {
    if (!d3.event.active) simulation.alphaTarget(0);
    d.fx = null;
    d.fy = null;
  }

  return d3
    .drag()
    .on('start', dragstarted)
    .on('drag', dragged)
    .on('end', dragended);
};

function drawD3Graph({nodes, links}) {
  const svg = d3.select(`#${GRAPH_ROOT_ID}`);
  if (!svg) {
    return;
  }

  const manyBody = d3.forceManyBody().strength(-1000);

  const simulation = d3
    .forceSimulation(nodes)
    .force('link', d3.forceLink(links).id(d => d.id))
    .force('charge', manyBody)
    .force('center', d3.forceCenter(WIDTH / 2, HEIGHT / 2));

  svg.attr('viewBox', [0, 0, WIDTH, HEIGHT]);

  const link = svg
    .append('g')
    .attr('stroke', '#999')
    .attr('stroke-opacity', 0.6)
    .selectAll('line')
    .data(links)
    .join('line')
    .attr('stroke-width', d => 1 + Math.sqrt(d.occurences));

  const node = svg
    .append('g')
    .attr('stroke', '#fff')
    .attr('stroke-width', 1.5)
    .selectAll('circle')
    .data(nodes)
    .join('circle')
    .attr('r', d => {
      return 5 + Math.sqrt(d.tacosCount);
    })
    // XXX colours
    .attr('fill', 'gray')
    .attr('tabindex', 0)
    .call(drag(simulation));

  node
    .append('title')
    .text(
      d => `${d.name} - ${d.tacosCount} taco${d.tacosCount === 1 ? '' : 's'}`,
    );

  simulation.on('tick', () => {
    link
      .attr('x1', d => d.source.x)
      .attr('y1', d => d.source.y)
      .attr('x2', d => d.target.x)
      .attr('y2', d => d.target.y);

    node.attr('cx', d => d.x).attr('cy', d => d.y);
  });

  // invalidation.then(() => simulation.stop());
}

class DrawGraph extends Component {
  constructor(props) {
    super(props);
    this.state = {users: {}, tacos: {}};
  }

  componentDidMount() {
    // XXX Do this better (and with async?), and maybe move some stuff to
    // functions rather than doing on client

    const request = endpoint =>
      fetch(`/.netlify/functions/${endpoint}`).then(response =>
        response.json(),
      );

    Promise.all([request('users'), request('tacos')]).then(([users, tacos]) => {
      users = users['users'];
      tacos = tacos['tacos'];

      const usersIndexedById = _(users)
        .groupBy('id')
        .mapValues(us => us[0])
        .value();

      const unknownUserName = 'Unknown';

      const tacosWithoutNulls = _.map(tacos, t => {
        const userFrom = t.userFrom || unknownUserName;
        const userTo = t.userTo || unknownUserName;
        return {...t, userFrom, userTo};
      });

      usersIndexedById.unknownUserName = {
        id: unknownUserName,
        name: unknownUserName,
      };

      const usersWithNoTacosYet = _.mapValues(usersIndexedById, u => {
        u.tacosCount = 0;
        return u;
      });

      const usersWithTacos = _.reduce(
        tacosWithoutNulls,
        (accumulator, taco) => {
          const userToId = taco.userTo;
          const userTo = accumulator[userToId];
          if (userTo) {
            userTo.tacosCount += 1;
          }
          return accumulator;
        },
        usersWithNoTacosYet,
      );

      this.setState({users: usersWithTacos, tacos: tacosWithoutNulls});
    });
  }

  render() {
    const {users, tacos} = this.state;

    const nodes = _.map(users, user => {
      return {...user, name: `@${user.name}`};
    });

    const links_ = _(tacos)
      .map(({userFrom, userTo}) => {
        return {
          source: userFrom,
          target: userTo,
        };
      })
      .reduce((accumulator, tacoEvent) => {
        if (!accumulator[tacoEvent.source]) {
          accumulator[tacoEvent.source] = {};
        }

        if (!accumulator[tacoEvent.source][tacoEvent.target]) {
          accumulator[tacoEvent.source][tacoEvent.target] = {
            ...tacoEvent,
            occurences: 1,
          };
        } else {
          const existingEvent = accumulator[tacoEvent.source][tacoEvent.target];
          existingEvent.occurences += 1;
        }

        return accumulator;
      }, {});

    const links = _(links_)
      .values()
      .map(_.values)
      .flattenDeep()
      .value();

    console.log('users:', users);
    console.log('tacos:', tacos);
    console.log('nodes:', nodes);
    console.log('links:', links);

    drawD3Graph({nodes, links});

    return null;
  }
}

class App extends Component {
  render() {
    return (
      <div className="App">
        <header className="App-header">
          <svg id={GRAPH_ROOT_ID} width="100%" height="100%" />
          <DrawGraph />
        </header>
      </div>
    );
  }
}

export default App;
