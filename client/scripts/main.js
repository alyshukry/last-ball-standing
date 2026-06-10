export const API_URL = window.location.hostname === 'localhost'
    ? '192.168.1.44:8000'
    : window.location.host

const views = ['home', 'rooms', 'lobby', 'game']

export const showView = (view) => {
    views.forEach(v => document.querySelector(`.view#${v}`).style.display = 'none')
    document.querySelector(`.view#${view}`).style.display = 'block'
}

//init
showView('home')
document.querySelector('body').style.display = 'flex'