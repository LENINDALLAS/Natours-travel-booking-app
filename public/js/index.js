/* eslint-disable */
import '@babel/polyfill';
import { displayMap } from './mapbox';
import { login, logout } from './login';
import { updateSettings } from './updateSettings';
import { showAlert } from './alert';
import { bookTour } from './stripe';
var FormData = require('form-data');


const openLayers = document.getElementById('map');
const loginForm = document.querySelector('.form--login');
const logOutButton = document.querySelector('.nav__el--logout');
const updateDataForm = document.querySelector('.form-user-data');
const updatePasswordForm = document.querySelector('.form-user-password');
const bookButton = document.getElementById('book-tour');

if (openLayers) {
    const locations = JSON.parse(openLayers.dataset.locations);
    displayMap(locations);
}


if (loginForm) {
    loginForm.addEventListener('submit', e => {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        login(email, password);
    });
}

if (logOutButton) logOutButton.addEventListener('click', logout);

if (updateDataForm) {
    updateDataForm.addEventListener('submit', e => {
        e.preventDefault();
        const form = new FormData();
        form.append('name', document.getElementById('name').value);
        form.append('email', document.getElementById('email').value);
        form.append('photo', document.getElementById('photo').files[0]);
        //  const name = document.getElementById('name').value

        // const data = {
        //   form
        // };
        updateSettings(form, 'data');
    });
};

if (updatePasswordForm) {
    updatePasswordForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        document.getElementById('btn-save-password').textContent = 'Updating ...'
        const oldPassword = document.getElementById('password-current').value;
        const password = document.getElementById('password').value;
        const passwordConfirm = document.getElementById('password-confirm').value;
        if (!oldPassword || !password || !passwordConfirm) {
            showAlert('error', `Password field is required`);
            return;
        } else if (password !== passwordConfirm) {
            showAlert('error', `New password and Confirm password do not match`);
            return;
        }
        const data = {
            oldPassword,
            password,
            passwordConfirm
        };
        await updateSettings(data, 'password');

        document.getElementById('btn-save-password').textContent = 'Save Password'
        document.getElementById('password-current').value = '';
        document.getElementById('password').value = '';
        document.getElementById('password-confirm').value = '';
    });
}

if (bookButton) {
    bookButton.addEventListener('click', (e) => {
        e.target.textContent = 'Processing...'
        const { tourid } = e.target.dataset;
        bookTour(tourid);
    })

}

let alertMessage = document.querySelector("body").dataset("alert");
if (alertMessage) showAlert("success", alertMessage, 5);
alertMessage = "";
