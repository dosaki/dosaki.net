import React from 'react';
import './About.css';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTwitter, faLinkedin } from '@fortawesome/free-brands-svg-icons'
import { faEnvelope } from '@fortawesome/free-solid-svg-icons';
import LanguageGraph from '../../components/LanguageGraph/LanguageGraph';
import LanguageContext from '../../contexts/LanguageContext';


class About extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      showProjectsBy: 'projects',
      projects: {},
      setProjects: (projects) => {
        this.setState({projects})
      }
    };
  }

  toggleShowProjectsBy() {
    if (this.state.showProjectsBy === 'projects') {
      this.setState({ showProjectsBy: 'years' });
    } else {
      this.setState({ showProjectsBy: 'projects' });
    }
  }

  render() {
    return (
      <div className="About">
        <div>
          <h1>Tiago Correia / Dosaki</h1>
          <div className="social">
            <a href='mailto:tiago.f.a.correia@gmail.com'><FontAwesomeIcon icon={faEnvelope} /></a>
            <a href='https://www.linkedin.com/in/dosaki/'><FontAwesomeIcon icon={faLinkedin} /></a>
            <a href='https://twitter.com/dosaki'><FontAwesomeIcon icon={faTwitter} /></a>
          </div>
        </div>
        <div className="body">
          <div className="text">
            <div>I'm a software developer from Portugal. Currently living in the UK.</div>
            <div>I work <a href="https://keyholding.com/">The Keyholding Company</a> as the Lead Backend Developer.</div>
            <div>Before, I worked as the Software Development Manager at <a href="https://www.panintelligence.com/">Panintelligence</a>, where I got to play with data and mentor our devs.</div>
            <div>Online, I use '<span className="highlight">Dosaki</span>' as my monicker.</div>
            <div className="spacer"></div>
            <div className="no-border trace-under flex space-between">Building things is my passion and I've been doing it for quite some time. <div className="aside">(yes that's me)</div></div>
            <div>I run the python and javascript sessions for my local Code Club to help kids learn how to program and I mentor a promising group at a <a href="https://harrogatecoderdojo.github.io/">CoderDojo</a>.</div>
            <div>You'll find I talk mostly about tech, video, board games... and containers. I talk a lot about containers.</div>

            <LanguageContext.Provider value={this.state}>
              <LanguageGraph />
            </LanguageContext.Provider>
            
            <div className="flex no-top-margin">
              <div className="no-border trace-under trace-right half">
                I find myself making things with {this.state.showProjectsBy === 'projects' ? 'various programming languages' : <button className='link-button' onClick={() => this.toggleShowProjectsBy()}>various programming languages</button>}.
                Some of which, I've worked with for {this.state.showProjectsBy === 'projects' ? <button className='link-button' onClick={() => this.toggleShowProjectsBy()}>a few years</button> : 'a few years'}.
              </div>
            </div>
          </div>
          <img className="trace-around me" src="/images/minime.jpg" alt="Me as a toddler at a computer" />
        </div>
      </div>
    );
  }
}

export default About;
