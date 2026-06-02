export const players = new Map()
export const bodies = [
    { shape: 'rect', x: 500, y: 490, width: 1000, height: 20, options: { isStatic: 1, restitution: .5 }, color: 'rgb(255, 255, 0)' },
    { shape: 'rect', x: 500, y: 100, width: 500, height: 20, options: { angle: Math.PI / 4, isStatic: 1, restitution: .99 }, color: 'rgb(255, 0, 0)' }
]
export const round = {
    status: '',
    winner: null,
    wins: new Map()
}