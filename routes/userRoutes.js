const express = require('express');
const { getAllUsers, createUser, getUser, updateUser, deleteUser, updateMe, deleteMe, getMe } = require('../controllers/userController');
const { signup, login, protect, restrictTo, forgotPassword, resetPassword, updatePassword } = require('../controllers/authController');

const router = express.Router();

// open routes no authentication required
router.post('/signup', signup);
router.post('/login', login);
// user forget password
router.post('/forgot-password', forgotPassword);
router.patch('/reset-password/:token', resetPassword);

//authentication required
//router.use acts as a middleware so each time a request is made it passes this middleware.
//NOTE router.use(protect) - will protect all the routes below it 
router.use(protect);
// user updates password
router.patch('/update-password', updatePassword);

// update user data 
router.patch('/update-me', updateMe);
// delete user by setting active state to false
router.delete('/delete-me', deleteMe);

//restrict below routes ro admin by using middleware
router.use(restrictTo('admin'))

router.route('/me').get(getMe, getUser);
router.route('/').get(getAllUsers).post(createUser);

router.route('/:id').get(getUser).patch(updateUser).delete(deleteUser);

module.exports = router;