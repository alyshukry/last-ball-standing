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

const SPRITE_SIZE = 32
const ATLAS_WIDTH = 4
const ATLAS_HEIGHT = 8
export const AVATAR_COLORS = 14
export const AVATAR_EYES = 7
export const AVATAR_MOUTHS = 7
export const renderHtmlBall = (container, color, eyes, mouth, scale = 1) => {
    container.style.position = 'relative'
    container.style.width = `${SPRITE_SIZE * scale}px`
    container.style.height = `${SPRITE_SIZE * scale}px`

    const colorElement = document.createElement('div')
    container.appendChild(colorElement)
    const eyesElement = document.createElement('div')
    container.appendChild(eyesElement)
    const mouthElement = document.createElement('div')
    container.appendChild(mouthElement)

    container.querySelectorAll('div').forEach((element) => {
        element.style.position = 'absolute'
        element.style.top = '0'
        element.style.left = '0'
        element.style.width = `${SPRITE_SIZE * scale}px`
        element.style.height = `${SPRITE_SIZE * scale}px`
        element.style.backgroundSize = `${SPRITE_SIZE * ATLAS_WIDTH * scale}px ${SPRITE_SIZE * ATLAS_HEIGHT * scale}px`
        element.style.imageRendering = 'crisp-edges'
        element.style.imageRendering = 'pixelated'
    })

    colorElement.style.backgroundImage = 'url(\'/assets/avatar/colors.gif\')'
    eyesElement.style.backgroundImage = 'url(\'/assets/avatar/eyes.gif\')'
    mouthElement.style.backgroundImage = 'url(\'/assets/avatar/mouths.gif\')'

    const colorCol = color % 4
    const colorRow = Math.floor(color / 4)
    colorElement.style.backgroundPosition =
        `-${colorCol * 32 * scale}px -${colorRow * 32 * scale}px`

    const eyesCol = eyes % 4
    const eyesRow = Math.floor(eyes / 4)
    eyesElement.style.backgroundPosition =
        `-${eyesCol * 32 * scale}px -${eyesRow * 32 * scale}px`

    const mouthCol = mouth % 4
    const moutRow = Math.floor(mouth / 4)
    mouthElement.style.backgroundPosition =
        `-${mouthCol * 32 * scale}px -${moutRow * 32 * scale}px`
}