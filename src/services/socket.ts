import {Server} from "socket.io"
import {Redis} from "ioredis";

const pub=new Redis({
    host: 'redis-14439.crce182.ap-south-1-1.ec2.redns.redis-cloud.com',
    port:14439,
    username:"default",
    password:"LxeLyc2qyEN6pnKKKRliepB0gDLoCUq6"
})

const sub=new Redis({
    host: 'redis-14439.crce182.ap-south-1-1.ec2.redns.redis-cloud.com',
    port:14439,
    username:"default",
    password:"LxeLyc2qyEN6pnKKKRliepB0gDLoCUq6"
})


class SocketService{
    private _io:Server;
    
    get io(){
        return this._io
    }
    
    constructor(){
        console.log("Init Socket Service ....")
        sub.subscribe("MESSAGES")
        this._io=new Server({
            cors:{
                allowedHeaders:"*",
                origin:"*"
            }
        })
    }

    public initListeners(){
        const io=this.io;
        console.log("Initialize Socket Listeners")
        io.on('connect',socket=>{
            console.log("New socket connected :",socket.id)
            socket.on('event:message',async ({message}:{message:string})=>{
                console.log("New message Rec",message)
                await pub.publish("MESSAGES",JSON.stringify({message}))

            })  
        })

        sub.on('message',(channel,message)=>{
            if(channel==="MESSAGES"){
                io.emit('message',message)
            }
        })
    }
}

export default SocketService