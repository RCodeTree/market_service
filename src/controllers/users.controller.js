const usersService = require('../services/users.service');

class UsersController {
    static async getAllUsers(req, res) {
        try {
            const users = await usersService.getAllUsers();
            res.status(200).json(users);
        } catch (error) {
            res.status(500).json({error: error.message});
        }
    }
}

module.exports = UsersController;