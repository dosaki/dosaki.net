const store = {
    get: (item) => {
        const expiry = localStorage.getItem(`${item}_expiresAt`);
        const isExpired = new Date(expiry) < new Date();
        if(!expiry || isExpired){
            return null;
        }
        const reposWithLanguagesCache = localStorage.getItem(item);
        if(reposWithLanguagesCache){
            return JSON.parse(reposWithLanguagesCache);
        }
        return null;
    },
    put: (item, value, daysToLive) => {
        localStorage.setItem(`${item}_expiresAt`,new Date(new Date().getTime()+(daysToLive*24*60*60*1000)));
        localStorage.setItem(item, JSON.stringify(value));
    }
}

export default store;