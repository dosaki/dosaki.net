import React, {useEffect, useState} from 'react';
import './Talks.css';
import {v4 as uuid} from 'uuid';
import Talk from '../../components/Talk/Talk';
import axios from 'axios';

function Talks() {
    const [talks, setTalks] = useState([]);
    useEffect(() => {
        const getTalks = async () => {
            const response = await axios.get('https://dosaki-public-dist.s3.eu-west-1.amazonaws.com/dosaki.net/config/talks.json');
            setTalks(response.data);
        };
        getTalks();
    }, []);

    return <div className="Talks">
        <h1>Stuff I talk about</h1>
        <ul className="list">
            {talks.sort((a, b) => a.date > b.date ? -1 : a.date < b.date ? 1 : 0).map(p => <Talk key={uuid()}
                                                                                                 detail={p}/>)}
        </ul>
    </div>;
}

export default Talks;
