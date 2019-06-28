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

      this.setState({users: usersIndexedById, tacos});
    });
  }

  render() {
    const {users, tacos} = this.state;
    console.log('users:', users);
    console.log('tacos:', tacos);
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
