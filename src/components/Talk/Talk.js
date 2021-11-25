import React from 'react';
import './Talk.css';
import { v4 as uuid } from 'uuid';
import { faChalkboardTeacher, faComment, faPenFancy, faMicrophoneAlt } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const icons = {
  "talk": faComment,
  "blog": faPenFancy,
  "workshop": faChalkboardTeacher,
  "podcast": faMicrophoneAlt
};

class Talk extends React.Component {
  constructor(props) {
    super(props);
    this.detail = props.detail;
  }

  get isInactive() {
    return this.detail.status === 'inactive';
  }

  render() {
    return (
      <li className={`Talk ${this.detail.type} ${this.detail.status}`}>
        <div className='holder'>
          <div className='content'>
            <h2 className='name'>
              <FontAwesomeIcon className="icon" icon={icons[this.detail.type]} />
              {this.detail.link ? <a href={this.detail.link}>{this.detail.name}</a> : this.detail.name}{this.isInactive ? <small><br />{this.detail.status}</small> : ''}
            </h2>
            <div className='date'>{this.detail.status ? this.detail.status : this.detail.date}</div>
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

export default Talk;
