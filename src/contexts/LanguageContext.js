import React from 'react';

const FilterContext = React.createContext({
    showProjectsBy: 'projects',
    projects: {},
    setProjects: () => {}
});

export default FilterContext;