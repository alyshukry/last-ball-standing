const views = ['home', 'rooms', 'lobby', 'game']

const showView = (view) => {
    views.forEach(v => document.querySelector(`.view#${v}`).style.display = 'none')
    document.querySelector(`.view#${view}`).style.display = 'block'
}

showView('game')