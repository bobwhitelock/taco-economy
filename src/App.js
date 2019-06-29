import React, {Component} from 'react';
import logo from './logo.svg';
import './App.css';
import _ from 'lodash';

class LambdaDemo extends Component {
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

      this.setState({users: usersIndexedById, tacos: tacosWithoutNulls});
    });
  }

  render() {
    const {users, tacos} = this.state;

    const nodes = _.map(users, ({id, name}) => {
      return {name: `@${name}`, id};
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
    return <p />;
  }
}

class App extends Component {
  render() {
    return (
      <div className="App">
        <header className="App-header">
          <LambdaDemo />
        </header>
      </div>
    );
  }
}

export default App;
