export const API_URL = window.location.hostname === 'localhost'
    ? '192.168.1.60:8000'
    : window.location.host

const views = ['home', 'rooms', 'lobby', 'game']

export const showView = (view) => {
    views.forEach(v => document.querySelector(`.view#${v}`).classList.add('hidden'))
    document.querySelector(`.view#${view}`).classList.remove('hidden')
}

showView('home')

const SPRITE_SIZE = 64
const ATLAS_WIDTH = 4
const ATLAS_HEIGHT = 8
export const AVATAR_COLORS = 14
export const AVATAR_EYES = 10
export const AVATAR_MOUTHS = 11
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
        `-${colorCol * SPRITE_SIZE * scale}px -${colorRow * SPRITE_SIZE * scale}px`

    const eyesCol = eyes % 4
    const eyesRow = Math.floor(eyes / 4)
    eyesElement.style.backgroundPosition =
        `-${eyesCol * SPRITE_SIZE * scale}px -${eyesRow * SPRITE_SIZE * scale}px`

    const mouthCol = mouth % 4
    const moutRow = Math.floor(mouth / 4)
    mouthElement.style.backgroundPosition =
        `-${mouthCol * SPRITE_SIZE * scale}px -${moutRow * SPRITE_SIZE * scale}px`
}

const setRandomFavicon = () => {
    const colorIndex = Math.floor(Math.random() * AVATAR_COLORS)
    const eyesIndex = Math.floor(Math.random() * AVATAR_EYES)
    const mouthIndex = Math.floor(Math.random() * AVATAR_MOUTHS)

    const colorsImg = new Image()
    const eyesImg = new Image()
    const mouthsImg = new Image()

    colorsImg.src = '/assets/avatar/colors0.png'
    eyesImg.src = '/assets/avatar/eyes0.png'
    mouthsImg.src = '/assets/avatar/mouths0.png'

    let loaded = 0
    const onLoad = () => {
        loaded++
        if (loaded < 3) return

        const canvas = document.createElement('canvas')
        canvas.width = SPRITE_SIZE
        canvas.height = SPRITE_SIZE
        const ctx = canvas.getContext('2d')

        const draw = (img, index) => {
            const col = index % 4
            const row = Math.floor(index / 4)
            ctx.drawImage(img, col * SPRITE_SIZE, row * SPRITE_SIZE, SPRITE_SIZE, SPRITE_SIZE, 0, 0, SPRITE_SIZE, SPRITE_SIZE)
        }

        draw(colorsImg, colorIndex)
        draw(eyesImg, eyesIndex)
        draw(mouthsImg, mouthIndex)

        let link = document.querySelector('link[rel="icon"]')
        if (!link) {
            link = document.createElement('link')
            link.rel = 'icon'
            document.head.appendChild(link)
        }
        link.href = canvas.toDataURL('image/png')
    }

    colorsImg.onload = onLoad
    eyesImg.onload = onLoad
    mouthsImg.onload = onLoad
}

setRandomFavicon()