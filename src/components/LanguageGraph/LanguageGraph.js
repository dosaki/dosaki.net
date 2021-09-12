import React from 'react';

import * as echarts from 'echarts/core';
import ReactEcharts from "echarts-for-react";
import LanguageContext from '../../contexts/LanguageContext';
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

const calculateChartValue = {
  projects: (v) => {
    return v.projects.length;
  },
  years: (v) => {
    return (v.years.endYear - v.years.startYear) || 1;
  }
};

class LanguageGraph extends React.Component {
  constructor(props) {
    super(props);

    this.currentYear = new Date().getFullYear();
    this.projects = {
      javascript: {
        projects: ["webnog", "pi", "config", "piet", "rend", "svgink", "glitzi", "wowdnd", "octometrist"],
        years: {
          startYear: 2008,
          endYear: this.currentYear
        }
      },
      groovy: {
        projects: ["webn", "pi", "migrations", "parrot"],
        years: {
          startYear: 2012,
          endYear: this.currentYear
        }
      },
      java: {
        projects: ["webn-proxy", "oldpi"],
        years: {
          startYear: 2012,
          endYear: this.currentYear
        }
      },
      "c#": {
        projects: [],
        years: {
          startYear: null,
          endYear: null
        }
      },
      go: {
        projects: ["config", "sched", "excre", "clinton", "helja"],
        years: {
          startYear: 2018,
          endYear: this.currentYear
        }
      },
      "lua": {
        projects: [],
        years: {
          startYear: null,
          endYear: null
        }
      },
      terraform: {
        projects: ["octometrist", "rancher"],
        years: {
          startYear: 2020,
          endYear: this.currentYear
        }
      },
      sql: {
        projects: ["webn", "rancher", "pi", "sched"],
        years: {
          startYear: 2009,
          endYear: this.currentYear
        }
      },
      python: {
        projects: ["et", "portsel", "pirana", "rancher", "zenpull", "octometrist"],
        years: {
          startYear: 2012,
          endYear: this.currentYear
        }
      },
      shell: {
        projects: ["deploy", "deploy", "scripts", "builders", "hooks"],
        years: {
          startYear: 2012,
          endYear: this.currentYear
        }
      },
    };
  }
  get chartOptions() {
    return {
      title: {
        text: this.context.showProjectsBy === 'projects' ? 'Languages used (by project)' : 'Languages used (by years used)',
        left: 'center',
        textStyle: {
          color: '#ccc'
        }
      },
      tooltip: {
        trigger: 'item',
        formatter: (params) => {
          return `${params.name}: ${params.value} ${this.context.showProjectsBy}`;
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
            fontSize: window.innerWidth > 615 ? '22' : '12',
            fontWeight: 'bold',
            position: window.innerWidth > 615 ? 'outside' : 'inner',
          },
          emphasis: {
            label: {
              show: true,
              fontSize: window.innerWidth > 615 ? '28' : '18',
              fontWeight: 'bold'
            }
          },
          data: Object.entries(this.context.projects).map(e => {
            return {
              name: e[0],
              value: calculateChartValue[this.context.showProjectsBy](e[1])
            };
          })
        }
      ]
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
              if (lang in this.projects) {
                this.projects[lang].projects.push(repo.name);
                this.projects[lang].years.startYear = Math.min(new Date(repo["created_at"]).getFullYear(), this.projects[lang].years.startYear || 9999);
                this.projects[lang].years.endYear = Math.max(new Date(repo["created_at"]).getFullYear(), this.projects[lang].years.endYear || 0);
                this.context.setProjects(this.projects);
              }
            });
          }
        }
      });
    }
  }

  render() {
    return (
      <div className="flex centre no-bottom-margin">
        <ReactEcharts className="trace-around chart" option={this.chartOptions} style={{ height: 400 }} />
      </div>
    );
  }
}
LanguageGraph.contextType = LanguageContext;

export default LanguageGraph;
