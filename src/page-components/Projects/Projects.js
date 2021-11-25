import React from 'react';
import './Projects.css';
import { v4 as uuid } from 'uuid';
import Project from '../../components/Project/Project';
import projects from '../../data/projects.json'

class Projects extends React.Component {
  render() {
    return (
      <div className="Projects">
        <h1>Stuff I make</h1>
        <ul className="list">
          {projects.filter(p=>p.status === "active").sort((a,b)=>a.type > b.type ? 1 : a.type < b.type ? -1 : 0).map(p => <Project key={uuid()} detail={p} />)}
          {projects.filter(p=>p.status === "done").sort((a,b)=>a.type > b.type ? 1 : a.type < b.type ? -1 : 0).map(p => <Project key={uuid()} detail={p} />)}
          {projects.filter(p=>!["active", "done"].includes(p.status)).sort((a,b)=>a.type > b.type ? 1 : a.type < b.type ? -1 : 0).map(p => <Project key={uuid()} detail={p} />)}
        </ul>
      </div>
    );
  }
}

export default Projects;
