import { on } from '../events.js'
import { showView } from '../main.js'
import { state } from '../state.js'

const playerList = document.querySelector('#players-list')

const renderPlayers = () => {
    playerList.innerHTML = ''
    for (const [id, info] of Object.entries(state.playersInfo)) {
        const li = document.createElement('li')
        li.textContent = info.username || 'guest'
        playerList.appendChild(li)
    }
}

on('joined', () => { showView('lobby'); renderPlayers() })
on('player_info', () => renderPlayers())
on('back_to_lobby', () => { showView('lobby'); renderPlayers() })
on('round_start', () => showView('game'))