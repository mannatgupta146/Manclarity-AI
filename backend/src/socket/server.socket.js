import { Server } from "socket.io"

let io

export function initSocket(hhtpServer) {
  io = new Server(hhtpServer, {
    cores: {
      origin: "http://localhost:5173",
      methods: ["GET", "POST", "PUT", "DELETE"],
      credentials: true,
    },
  })

  console.log('socket io server is running')

  io.on("connection", (socket) => {
    console.log("user connected" + socket.id)
  })
}

export function getIO() {
    if(!io){
        throw new Error("Socket.io not initialized")
    }
    return io
}