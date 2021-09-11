import React from 'react';
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link
} from "react-router-dom";
import About from '../About/About';
import Home from '../Home/Home';
import Projects from '../Projects/Projects';
import Talks from '../Talks/Talks';

import './App.css';

class App extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      selectedTab: window.location.pathname.split('/')[1] || null
    };
  }

  checkSelection(name) {
    return this.state.selectedTab === name ? 'selected' : '';
  }

  render() {
    return (
      <div className="App">
        <Router>
          <div className="header">
            <Link to="/" onClick={() => this.setState({ selectedTab: null })}>Home</Link>
            <ul className="nav">
              <li>
                <Link to="/about" onClick={() => this.setState({ selectedTab: "about" })} className={this.checkSelection("about")}>About me</Link>
              </li>
              <li>
                <Link to="/projects" onClick={() => this.setState({ selectedTab: "projects" })} className={this.checkSelection("projects")}>Stuff I make</Link>
              </li>
              <li>
                <Link to="/talks" onClick={() => this.setState({ selectedTab: "talks" })} className={this.checkSelection("talks")}>Stuff I talk about</Link>
              </li>
            </ul>
          </div>
          <div className="content">
            <Switch>
              <Route path="/about">
                <About />
              </Route>
              <Route path="/projects">
                <Projects />
              </Route>
              <Route path="/talks">
                <Talks />
              </Route>
              <Route path="/">
                <Home />
              </Route>
            </Switch>
          </div>
        </Router>
      </div>
    );
  }
}

export default App;
