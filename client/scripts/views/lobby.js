import { on } from '../events.js'
import { renderHtmlBall, showView } from '../main.js'
import { state } from '../state.js'

const playerList = document.querySelector('#players-list')

const renderPlayers = () => {
    playerList.innerHTML = ''
    for (const [id, info] of Object.entries(state.playersInfo)) {
        const li = document.createElement('li')
        li.textContent = info.username || 'guest'
        const ball = document.createElement('div')
        li.appendChild(ball)
        renderHtmlBall(ball, info.color, info.eyes, info.mouth)
        playerList.appendChild(li)
    }
}

on('joined', () => {
    showView('lobby')
    renderPlayers()
})
on('player_info', () => renderPlayers())
on('player_left', () => renderPlayers())
on('back_to_lobby', () => {
    showView('lobby')
    renderPlayers()
})
on('round_start', () => showView('game'))