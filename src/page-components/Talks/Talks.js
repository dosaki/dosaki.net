import React from 'react';
import './Talks.css';
import { v4 as uuid } from 'uuid';
import talks from '../../data/talks.json'
import Talk from '../../components/Talk/Talk';

class Talks extends React.Component {
  render() {
    return (
      <div className="Talks">
        <h1>Stuff I talk about</h1>
        <ul className="list">
          {talks.sort((a,b)=>a.date > b.date ? -1 : a.date < b.date ? 1 : 0).map(p => <Talk key={uuid()} detail={p} />)}
        </ul>
      </div>
    );
  }
}

export default Talks;
