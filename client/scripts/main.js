export const API_URL = window.location.hostname === 'localhost'
    ? `localhost:${window.location.port || 8000}`
    : `${window.location.hostname}${window.location.port ? `:${window.location.port}` : ''}`

const views = ['home', 'rooms', 'lobby', 'game']

export const ARENAS = [
    {
        "bodies": [
            { "shape": "rect", "x": 500, "y": 468, "width": 980, "height": 24, "options": { "isStatic": 1, "restitution": 0.3 } },
            { "shape": "rect", "x": 500, "y": 300, "width": 480, "height": 24, "options": { "isStatic": 1, "restitution": 0.3 } },
            { "shape": "circle", "x": 260, "y": 300, "radius": 12, "options": { "isStatic": 1, "restitution": 0.3 } },
            { "shape": "circle", "x": 740, "y": 300, "radius": 12, "options": { "isStatic": 1, "restitution": 0.3 } },
            { "shape": "circle", "x": 500, "y": 175, "radius": 32, "options": { "isStatic": 1, "restitution": 0.3 } }
        ],
        "spawns": [
            { "x": 58, "y": 444 },
            { "x": 942, "y": 444 },
            { "x": 692, "y": 264 },
            { "x": 130, "y": 444 },
            { "x": 872, "y": 444 },
            { "x": 308, "y": 264 }
        ]
    },
    {
        "bodies": [
            { "shape": "rect", "x": 150, "y": 468, "width": 200, "height": 24, "options": { "isStatic": 1, "restitution": 0.3 } },
            { "shape": "rect", "x": 350, "y": 378, "width": 200, "height": 24, "options": { "isStatic": 1, "restitution": 0.3 } },
            { "shape": "rect", "x": 650, "y": 288, "width": 200, "height": 24, "options": { "isStatic": 1, "restitution": 0.3 } },
            { "shape": "rect", "x": 850, "y": 198, "width": 200, "height": 24, "options": { "isStatic": 1, "restitution": 0.3 } },
            { "shape": "circle", "x": 850, "y": 450, "radius": 40, "options": { "isStatic": 1, "restitution": 0.9 } },
            { "shape": "circle", "x": 150, "y": 150, "radius": 40, "options": { "isStatic": 1, "restitution": 0.9 } }
        ],
        "spawns": [
            { "x": 80, "y": 430 },
            { "x": 220, "y": 430 },
            { "x": 350, "y": 340 },
            { "x": 650, "y": 250 },
            { "x": 800, "y": 160 },
            { "x": 900, "y": 160 }
        ]
    }
]

export const showView = (view) => {
    views.forEach(v => document.querySelector(`.view#${v}`).classList.add('hidden'))
    document.querySelector(`.view#${view}`).classList.remove('hidden')
}

showView('home')

export const SPRITE_SIZE = 64
const ATLAS_WIDTH = 4
const ATLAS_HEIGHT = 8
export const AVATAR_COLORS = 20
export const AVATAR_EYES = 10
export const AVATAR_MOUTHS = 11

export const renderHtmlBall = (container, color, eyes, mouth, size = `${SPRITE_SIZE}px`) => {
    const normalizedSize = typeof size === 'number' ? `${size}px` : size
    const isPercentageSize = typeof normalizedSize === 'string' && normalizedSize.endsWith('%')
    const layerSize = isPercentageSize ? '100%' : normalizedSize

    container.style.position = 'relative'
    container.style.display = 'block'
    container.style.overflow = 'hidden'
    container.style.aspectRatio = '1 / 1'
    container.style.width = normalizedSize
    container.style.height = isPercentageSize ? 'auto' : normalizedSize

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
        element.style.width = layerSize
        element.style.height = layerSize
        element.style.backgroundSize = `calc(${layerSize} * ${ATLAS_WIDTH}) calc(${layerSize} * ${ATLAS_HEIGHT})`
        element.style.imageRendering = 'crisp-edges'
        element.style.imageRendering = 'pixelated'
    })

    colorElement.style.backgroundImage = 'url(\'/assets/avatar/colors.gif\')'
    eyesElement.style.backgroundImage = 'url(\'/assets/avatar/eyes.gif\')'
    mouthElement.style.backgroundImage = 'url(\'/assets/avatar/mouths.gif\')'

    const colorCol = color % 4
    const colorRow = Math.floor(color / 4)
    colorElement.style.backgroundPosition =
        `calc(-${colorCol} * ${layerSize}) calc(-${colorRow} * ${layerSize})`

    const eyesCol = eyes % 4
    const eyesRow = Math.floor(eyes / 4)
    eyesElement.style.backgroundPosition =
        `calc(-${eyesCol} * ${layerSize}) calc(-${eyesRow} * ${layerSize})`

    const mouthCol = mouth % 4
    const mouthRow = Math.floor(mouth / 4)
    mouthElement.style.backgroundPosition =
        `calc(-${mouthCol} * ${layerSize}) calc(-${mouthRow} * ${layerSize})`
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