const USERS = require('../models/USERS');

class UsersService {
    static async getAllUsers() {
        let user = new USERS();
        user = await USERS.getAllUsers();
        return user;
    }
}

module.exports = UsersService;
