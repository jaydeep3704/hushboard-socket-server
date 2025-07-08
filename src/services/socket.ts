import { Server } from "socket.io"
import { Redis } from "ioredis"

// ✅ Redis connections
const pub = new Redis({
    host: 'redis-14439.crce182.ap-south-1-1.ec2.redns.redis-cloud.com',
    port: 14439,
    username: "default",
    password: "LxeLyc2qyEN6pnKKKRliepB0gDLoCUq6"
})

const sub = new Redis({
    host: 'redis-14439.crce182.ap-south-1-1.ec2.redns.redis-cloud.com',
    port: 14439,
    username: "default",
    password: "LxeLyc2qyEN6pnKKKRliepB0gDLoCUq6"
})

interface RoomMessageProps {
    message: string
    timeStamp: string
    roomId: string
    anonUser: string
}

class SocketService {
    private _io: Server

    get io() {
        return this._io
    }

    constructor() {
        console.log("Initializing Socket Service...")
        sub.subscribe("MESSAGES")  // ✅ Subscribe to global messages
        this._io = new Server({
            cors: {
                allowedHeaders: "*",
                origin: "*"
            }
        })
    }

    public initListeners() {
        const io = this.io
        console.log("Initializing Socket Listeners...")

        io.on("connect", (socket) => {
            console.log("✅ New socket connected:", socket.id)

            // Global message (optional)
            socket.on("event:message", async ({ message, timeStamp }: { message: string; timeStamp: string }) => {
                await pub.publish("MESSAGES", JSON.stringify({ message, timeStamp }))
            })

            // Join room
            socket.on("event:join-room", async ({ roomId }: { roomId: string }) => {
                await socket.join(roomId)
                console.log(`Socket ${socket.id} joined room ${roomId}`)
            })

            // Leave room
            socket.on("leave-room", (roomId: string) => {
                console.log(`Socket ${socket.id} left room ${roomId}`)
                socket.leave(roomId)
            })

            // Room message
            socket.on("event:room-message", async ({ message, timeStamp, roomId, anonUser }: RoomMessageProps) => {
                console.log(`Message "${message}" sent by ${anonUser} in room ${roomId}`)
                io.to(roomId).emit("recieve-room-message", { message, timeStamp, anonUser })
            })
        })

        // Redis pub/sub for global messages
        sub.on("message", (channel, message) => {
            if (channel === "MESSAGES") {
                io.emit("message", message)
            }
        })
    }
}

export default SocketService
