import './style.css'

const canvas = document.querySelector('canvas')
const context = canvas.getContext('2d')
const $score = document.querySelector('span')
const $left = document.getElementById('left')
const $right = document.getElementById('right')
const $down = document.getElementById('down')
const $rotate = document.getElementById('rotate')
const $start = document.getElementById('start')
const $pause = document.getElementById('pause')
const $restart = document.getElementById('restart')

const BLOCK_SIZE = 15
const BOARD_WIDTH = 14
const BOARD_HEIGHT = 25

let SCORE = 0
let gamePaused = false
let gameOver = false
let dropCounter = 0
let lastTime = 0
let animationFrameId = null

canvas.width = BLOCK_SIZE * BOARD_WIDTH
canvas.height = BLOCK_SIZE * BOARD_HEIGHT

context.scale(BLOCK_SIZE, BLOCK_SIZE)

const createBoard = (width, height) => {
  return Array(height).fill().map(() => Array(width).fill(0))
}

let board = createBoard(BOARD_WIDTH, BOARD_HEIGHT)

const COLORS = [
  'cyan',
  'orange',
  'purple',
  'red',
  'yellow'
]

let piece = {
  position: { x: 6, y: 5 },
  shape: [
    [1, 1],
    [1, 1]
  ],
  color: COLORS[Math.floor(Math.random() * COLORS.length)]
}

const PIECES = [
  [
    [1, 1],
    [1, 1]
  ],
  [
    [1, 1, 1],
    [0, 1, 0]
  ],
  [
    [1, 1, 1],
    [1, 0, 0]
  ],
  [
    [1, 1, 1, 1]
  ],
  [
    [1, 1, 0],
    [0, 1, 1]
  ],
  [
    [0, 1, 1],
    [1, 1, 0]
  ],
  [
    [1, 1, 1],
    [0, 0, 1]
  ]
]

const update = (time = 0) => {
  if (gamePaused) return

  const deltaTime = time - lastTime
  lastTime = time

  dropCounter += deltaTime

  if (dropCounter > 600) {
    piece.position.y++
    dropCounter = 0
  }

  if (checkCollision()) {
    piece.position.y--
    solidifyPiece()
    removeRow()
  }

  draw()
  animationFrameId = window.requestAnimationFrame(update)
}

const draw = () => {
  context.clearRect(0, 0, canvas.width, canvas.height)

  board.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value) {
        context.fillStyle = COLORS[value - 1]
        context.fillRect(x, y, 1, 1)
        context.lineWidth = 0.1
        context.strokeStyle = '#000'
        context.strokeRect(x, y, 1, 1)
        context.lineJoin = 'round'
      }
    })
  })

  piece.shape.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value) {
        context.fillStyle = piece.color
        context.fillRect(x + piece.position.x, y + piece.position.y, 1, 1)
        context.lineWidth = 0.1
        context.strokeStyle = '#000'
        context.strokeRect(x + piece.position.x, y + piece.position.y, 1, 1)
        context.lineJoin = 'round'
      }
    })
  })

  $score.innerText = SCORE
}

document.addEventListener('click', e => {
  if (e.target.closest('button') === $start) {
    if (!gamePaused && !gameOver) {
      update()
    }
    gamePaused = false
  }

  if (e.target.closest('button') === $pause) {
    gamePaused = true
    cancelAnimationFrame(animationFrameId)
  }

  if (e.target.closest('button') === $restart) {
    gamePaused = false
    gameOver = false
    SCORE = 0
    board = createBoard(BOARD_WIDTH, BOARD_HEIGHT)
    piece.position = { x: 6, y: 5 }
    piece.shape = PIECES[Math.floor(Math.random() * PIECES.length)]
    piece.color = COLORS[Math.floor(Math.random() * COLORS.length)]
    draw()
    update()
  }

  if (e.target.closest('button') === $left) {
    piece.position.x--
    if (checkCollision()) {
      piece.position.x++
    }
  }

  if (e.target.closest('button') === $right) {
    piece.position.x++
    if (checkCollision()) {
      piece.position.x--
    }
  }

  if (e.target.closest('button') === $down) {
    piece.position.y++
    if (checkCollision()) {
      piece.position.y--
      solidifyPiece()
      removeRow()
    }
  }

  if (e.target.closest('button') === $rotate) {
    const rotated = []
    for (let i = 0; i < piece.shape[0].length; i++) {
      const row = []
      for (let j = piece.shape.length - 1; j >= 0; j--) {
        row.push(piece.shape[j][i])
      }
      rotated.push(row)
    }
    const previousPosition = piece.shape
    piece.shape = rotated
    if (checkCollision()) {
      piece.shape = previousPosition
    }
  }
})

document.addEventListener('keydown', event => {
  if (event.key === 'ArrowLeft') {
    piece.position.x--
    if (checkCollision()) {
      piece.position.x++
    }
  }

  if (event.key === 'ArrowRight') {
    piece.position.x++
    if (checkCollision()) {
      piece.position.x--
    }
  }

  if (event.key === 'ArrowDown') {
    piece.position.y++
    if (checkCollision()) {
      piece.position.y--
      solidifyPiece()
      removeRow()
    }
  }

  if (event.key === 'ArrowUp') {
    const rotated = []
    for (let i = 0; i < piece.shape[0].length; i++) {
      const row = []
      for (let j = piece.shape.length - 1; j >= 0; j--) {
        row.push(piece.shape[j][i])
      }
      rotated.push(row)
    }
    const previousPosition = piece.shape
    piece.shape = rotated
    if (checkCollision()) {
      piece.shape = previousPosition
    }
  }
})

const checkCollision = () => {
  return piece.shape.some((row, y) => {
    return row.some((value, x) => {
      return (
        value !== 0 &&
        (board[y + piece.position.y]?.[x + piece.position.x] !== 0 ||
          x + piece.position.x < 0 ||
          x + piece.position.x >= BOARD_WIDTH ||
          y + piece.position.y >= BOARD_HEIGHT)
      )
    })
  })
}

const solidifyPiece = () => {
  piece.shape.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value) {
        board[y + piece.position.y][x + piece.position.x] = COLORS.indexOf(piece.color) + 1
      }
    })
  })
  piece.position.x = Math.floor(BOARD_WIDTH / 2 - 2)
  piece.position.y = 0
  piece.shape = PIECES[Math.floor(Math.random() * PIECES.length)]
  piece.color = COLORS[Math.floor(Math.random() * COLORS.length)]

  if (checkCollision()) {
    window.alert('El juego ha terminado')
    board.forEach((row) => row.fill(0))
    gameOver = true
    cancelAnimationFrame(animationFrameId)
  }
}

const removeRow = () => {
  const rowsToRemove = []

  board.forEach((row, y) => {
    if (row.every(value => value !== 0)) {
      rowsToRemove.push(y)
    }
  })

  if (rowsToRemove.length > 0) {
    animateRowRemoval(rowsToRemove)
  }
}

const animateRowRemoval = (rowsToRemove) => {
  const animationDuration = 500
  const steps = 10
  const stepDuration = animationDuration / steps
  let currentStep = 0

  const animateStep = () => {
    currentStep++
    rowsToRemove.forEach(y => {
      context.globalAlpha = 1 - (currentStep / steps)
      board[y].forEach((value, x) => {
        if (value) {
          context.fillStyle = COLORS[value - 1]
          context.clearRect(x, y, 1, 1)
          context.fillRect(x, y, 1, 1)
        }
      })
    })

    if (currentStep < steps) {
      setTimeout(animateStep, stepDuration)
    } else {
      context.globalAlpha = 1
      rowsToRemove.forEach(y => {
        board.splice(y, 1)
        const newRow = Array(BOARD_WIDTH).fill(0)
        board.unshift(newRow)
        SCORE += 10
      })
    }
  }

  animateStep()
}

draw()
