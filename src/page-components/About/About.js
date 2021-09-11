import React from 'react';
import './About.css';

import * as echarts from 'echarts/core';
import ReactEcharts from "echarts-for-react";
import {
  TooltipComponent,
  LegendComponent,
  TitleComponent
} from 'echarts/components';
import {
  PieChart
} from 'echarts/charts';
import {
  CanvasRenderer
} from 'echarts/renderers';

echarts.use(
  [TooltipComponent, LegendComponent, PieChart, CanvasRenderer, TitleComponent]
);

class About extends React.Component {

  constructor(props) {
    super(props);
    this.currentYear = new Date().getFullYear();
    const projects = {
      javascript: {
        projects: ["webnog", "pi", "config", "piet", "rend", "svgink", "glitzi"].length,
        years: this.currentYear - 2008
      },
      groovy: {
        projects: ["webn", "pi", "migrations", "parrot"].length,
        years: this.currentYear - 2012
      },
      java: {
        projects: ["webn-proxy", "oldpi"].length,
        years: this.currentYear - 2012
      },
      "c#": {
        projects: 0,
        years: 0
      },
      go: {
        projects: ["config", "sched", "excre", "clinton", "helja"].length,
        years: this.currentYear - 2018
      },
      "lua": {
        projects: 0,
        years: 0
      },
      python: {
        projects: ["et", "portsel", "pirana", "rancher", "zenpull"].length,
        years: this.currentYear - 2006
      },
      shell: {
        projects: ["deploy", "deploy", "scripts", "builders", "hooks"].length,
        years: this.currentYear - 2012
      },
    };
    this.state = {
      showProjectsBy: 'projects',
      projects
    };
  }

  async componentDidMount() {
    const response = await fetch("https://api.github.com/users/dosaki/repos");
    if (response.ok) {
      const repos = await response.json();
      repos.forEach(async repo => {
        if (!repo.fork) {
          const languageResponse = await fetch(repo["languages_url"]);
          if (languageResponse.ok) {
            const languages = await languageResponse.json();
            Object.keys(languages).forEach(language => {
              const lang = language.toLowerCase() === 'vue' ? 'javascript' : language.toLowerCase();
              if (lang in this.state.projects) {
                const projects = JSON.parse(JSON.stringify(this.state.projects));
                projects[lang].projects++;
                projects[lang].years = Math.max(this.currentYear - new Date(repo["created_at"]).getFullYear(), projects[lang].years);
                this.setState({ projects });
              }
            });
          }
        }
      });
    }
  }

  get chartOptions() {
    return {
      title: {
        text: this.state.showProjectsBy === 'projects' ? 'Projects in each language' : 'Years writing in language',
        left: 'center',
        textStyle: {
          color: '#ccc'
        }
      },
      tooltip: {
        trigger: 'item',
        formatter: (params) => {
          return `${params.name}: ${params.value} ${this.state.showProjectsBy}`;
        },
      },
      series: [
        {
          type: 'pie',
          radius: ['40%', '80%'],
          itemStyle: {
            borderRadius: "6px",
            borderColor: '#fff',
            borderWidth: 1
          },
          label: {
            show: true,
            fontSize: '22',
            fontWeight: 'bold'
          },
          emphasis: {
            label: {
              show: true,
              fontSize: '28',
              fontWeight: 'bold'
            }
          },
          data: Object.entries(this.state.projects).map(e => { return { name: e[0], value: e[1][this.state.showProjectsBy] }; })
        }
      ]
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
        <div className="flex">
          <h1>Tiago Correia</h1>
          <a href='mailto:tiago.f.a.correia@gmail.com'>Email</a>
          <a href='https://twitter.com/dosaki'>Twitter</a>
          <a href='https://www.linkedin.com/in/dosaki/'>LinkedIn</a>
        </div>
        <div className="body">
          <div className="text">
            <div>I'm a software developer from Portugal. Currently living in the UK.</div>
            <div>I work as a senior/lead dev at <a href="https://www.panintelligence.com/">Panintelligence</a>, where I get to play with data and mentor our juniors.</div>
            <div>Online, I use '<span className="highlight">Dosaki</span>' as my monicker.</div>
            <div className="spacer"></div>
            <div className="no-border trace-under flex space-between">Building things is my passion and I've been doing it for quite some time. <div className="aside">(yes that's me)</div></div>
            <div>I run the python and javascript sessions for my local Code Club to help kids learn how to program and I mentor a promising group at Coder Dojo.</div>
            <div>You might find I talk mostly about tech, video, board games... and containers. I talk a lot about containers.</div>

            <div className="flex centre no-bottom-margin">
              <ReactEcharts className="trace-around chart" option={this.chartOptions} style={{ height: 400 }} />
            </div>
            <div className="flex no-top-margin">
              <div className="no-border trace-under trace-right half">
                I find myself making things with {this.state.showProjectsBy === 'projects' ? 'various programming languages' : <a href='javascript:void(0)' onClick={() => this.toggleShowProjectsBy()}>various programming languages</a>}. Some of which, I've worked for {this.state.showProjectsBy === 'projects' ? <a href='javascript:void(0)' onClick={() => this.toggleShowProjectsBy()}>a few years</a> : 'a few years'}.
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
