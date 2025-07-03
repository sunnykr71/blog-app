function info(...params: string[]) {
  console.log(...params)
}

function error(...params: string[]) {
  console.error(...params)
}

export default {
  info,
  error
}
