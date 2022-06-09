/* eslint-disable no-undef */

const login = async(email, password) => {
try {
    const res = await axios.post('http://localhost:3000/api/v1/users/login', { email, password });
    alert(JSON.stringify(res.data));
} catch (error) {
    alert(error.response.data);
}
};

document.querySelector('.form').addEventListener('submit', e => {
    e.preventDefault();
    const email =  document.getElementById('email').value;
    const password = document.getElementById('password').value;
    login(email, password);
})