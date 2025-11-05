import fs from 'fs'
import path from 'path'
import { fork } from 'child_process'
import { fileURLToPath } from 'url'

console.log('Starting...\n')

const __dirname = path.dirname(fileURLToPath(import.meta.url))

;['session', 'temp'].forEach(d => {
  const dir = path.join(__dirname, d)
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
})

const start = () => {
  const child = fork(
    path.join(__dirname, 'main.js'),
    process.argv.slice(2),
    { stdio: ['inherit', 'inherit', 'inherit', 'ipc'] }
  )

  child.on('message', msg => {
    if (msg === 'reset') {
      console.log('Restarting...')
      child.kill()
    }
    if (msg === 'uptime') {
      child.send(process.uptime())
    }
  })

  child.on('exit', code => {
    console.log('Exited with code:', code)
    start()
  })
}

start()
