import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import Routes from './Routes';
import { Auth } from 'aws-amplify';

class App extends Component {

  constructor(props) {
    super(props);
    this.state = {
      isAuthenticated: false,
      isAuthenticating: true
    };
  }

  async componentDidMount() {
    try {
      await Auth.currentSession();
      this.userHasAuthenticated(true);
    } catch(e) {
      if (e !== 'No current user') {
        alert(e);
      }
    }
    this.setState({ isAuthenticating: false });
  }

  userHasAuthenticated = isAuthenticated => {
    this.setState({ isAuthenticated });
  }

  async handleLogout() {
    await Auth.signOut();
    this.userHasAuthenticated(false);
    this.props.history.push('/login');
  }

  render() {
    const childProps = {
      isAuthenticated: this.state.isAuthenticated,
      userHasAuthenticated: this.userHasAuthenticated,
      handleLogout: () => this.handleLogout()
    };
    return (
      <Routes childProps={childProps} />
    );
  }

}

export default withRouter(App);
