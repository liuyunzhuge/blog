var USERS = [
    {
        id: 1,
        username: 'jim',
        password: 'jim'
    },
    {
        id: 2,
        username: 'tom',
        password: 'tom'
    }
];

module.exports = {
    getUser: function (username, password) {
        var user = USERS.filter(function (item) {
            return item.username == username;
        })[0];

        if (!user) return false;
        if (user.password != password) return false

        return user;
    }
};
