import { Server } from "socket.io"
import { Redis } from "ioredis"

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

class SocketService {
    private _io: Server

    get io() {
        return this._io
    }

    constructor() {
        console.log("Initializing Socket Service...")
        sub.subscribe("MESSAGES")
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
            console.log("New socket connected:", socket.id)

            socket.on("event:message", async ({ message, timeStamp }: { message: string; timeStamp: string }) => {
                console.log("New message received:", message, timeStamp)
                await pub.publish("MESSAGES", JSON.stringify({ message, timeStamp }))
            })
            
            socket.on("event:join-room",async({roomId}:{roomId:string})=>{
                console.log("ROOM :",roomId)
                await socket.join(roomId)
            })

            socket.on("event:room-message",async({message,timeStamp,roomId}:{ message: string; timeStamp: string,roomId:string})=>{
                io.to(roomId).emit("recieve-room-message",{message,timeStamp})
            })
        })

        sub.on("message", (channel, message) => {
            if (channel === "MESSAGES") {
                io.emit("message", message)
            }
        })
    }
}

export default SocketService
