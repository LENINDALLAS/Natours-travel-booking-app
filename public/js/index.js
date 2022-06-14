/* eslint-disable */
import '@babel/polyfill';
import { displayMap } from './mapbox';
import {login, logout} from './login';

const openLayers = document.getElementById('map');
const loginForm = document.querySelector('.form--login');
const logOutButton = document.querySelector('.nav__el--logout');


if(openLayers) {
    const locations = JSON.parse(openLayers.dataset.locations);
    displayMap(locations);
}


if(loginForm) {
loginForm.addEventListener('submit', e => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    login(email, password);
});
}

if(logOutButton) logOutButton.addEventListener('click', logout);
