import React, {useEffect, useState} from 'react';
import './Projects.css';
import {v4 as uuid} from 'uuid';
import Project from '../../components/Project/Project';
import axios from 'axios';

function Projects() {
    const [projects, setProjects] = useState([]);
    useEffect(() => {
        const getProjects = async () => {
            const response = await axios.get('https://dosaki-public-dist.s3.eu-west-1.amazonaws.com/dosaki.net/config/projects.json');
            setProjects(response.data);
        };
        getProjects()
    }, []);
    return <div className="Projects">
        <h1>Stuff I make</h1>
        <ul className="list">
            {projects
            .filter(p => p.status === 'active')
            .sort((a, b) => a.type > b.type ? 1 : a.type < b.type ? -1 : 0)
            .map(p => <Project key={uuid()} detail={p}/>)}
            {projects
            .filter(p => p.status === 'done')
            .sort((a, b) => a.type > b.type ? 1 : a.type < b.type ? -1 : 0)
            .map(p => <Project key={uuid()} detail={p}/>)}
            {projects
            .filter(p => !['active', 'done']
            .includes(p.status))
            .sort((a, b) => a.type > b.type ? 1 : a.type < b.type ? -1 : 0)
            .map(p => <Project key={uuid()} detail={p}/>)}
        </ul>
    </div>;
}

export default Projects;
