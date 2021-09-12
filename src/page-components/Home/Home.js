import React from 'react';
import './Home.css';

class Home extends React.Component {
  render() {
    return (
      <div className="splash-holder" style={{ background: "url('/images/t_snow.jpg') no-repeat left center fixed", backgroundSize: "cover", backgroundRepeat: "no-repeat" }}>
        <div className="splash">
          <div>
            Hi! I'm Tiago and I make things!
          </div>
          <div className="small">
            Also I mentor kids with their programming.
          </div>
          <div className="smaller">
            And I talk way too much about containers...
          </div>
        </div>
      </div>
    );
  }
}

export default Home;
