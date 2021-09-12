import React from 'react';
import './Project.css';
import { v4 as uuid } from 'uuid';

class Project extends React.Component {
  constructor(props) {
    super(props);
    this.detail = props.detail;
  }

  get isInactive() {
    return this.detail.status === 'inactive';
  }

  render() {
    return (
      <li className={`Project ${this.detail.type} ${this.detail.status}`}>
        {this.detail.source ? <div className='ribbon-holder'><div className="ribbon"><a href={this.detail.source}>source</a></div></div> : ''}
        <div className='holder'>
          <div className='content'>
            <div className='image-container'>
              <img alt={`${this.detail.name} icon`} className={this.detail.pixelatedImage ? 'pixelated' : ''} src={this.detail.icon} />
            </div>
            <h2 className='name'>{this.detail.link ? <a href={this.detail.link}>{this.detail.name}</a> : this.detail.name}{this.isInactive ? <small><br />{this.detail.status}</small> : ''}</h2>
            <div className='description' dangerouslySetInnerHTML={{ __html: this.detail.description }}></div>
          </div>
          <div className='footer'>
            <div className='tags'>
              {[this.detail.type, ...this.detail.tags].map(t => <div key={uuid()}>#{t}</div>)}
            </div>
          </div>
        </div>
      </li>
    );
  }
}

export default Project;
