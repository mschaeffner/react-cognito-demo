import React from 'react';
import { Auth } from 'aws-amplify';
import { Button } from "react-bootstrap";

export default class Home extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      user: null
    };
  }

  async componentDidMount() {
    if(!this.props.isAuthenticated) {
      this.props.history.push('/login');
    } else {
      const user = await Auth.currentAuthenticatedUser()
      this.setState({user})
    }
  }

  render() {
    if(!this.state.user) {
      return null
    }
    return (
      <div style={{width: '400px', margin: '50px auto'}}>
        <h2>HOME</h2>
        <h3>Hello {this.state.user.attributes.email}</h3>
        <Button
          block
          bsSize="large"
          onClick={() => this.props.handleLogout()}
        >
          Logout
        </Button>
      </div>
    )
  }
}
