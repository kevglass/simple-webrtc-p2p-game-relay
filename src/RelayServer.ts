import { Server, Socket } from "socket.io";
import { createServer as createHttpServer, Server as HttpServer } from "http";

/**
 * Represents a client of the relay server with its username and the web socket
 * that can be used to communicate with it
 */
interface RelayClient {
    name: string;
    socket: Socket;
}

/**
 * A very very very simple relay server. This server's job is to pass text messages
 * between clients based on the username that they registered with. Note that 
 * there is no authentication, no handling for timed out clients, no dealing with
 * duplicate names. It's also HTTP only - it'd need to be fronted by a HTTPS terminating
 * proxy/firewall.
 * 
 * This is not for production use, it's just a simple example to support the WebRTC
 * sample. 
 */
export class RelayServer {
    /** The socket.io instance of the server used to manage connections */
    io: Server;
    /** The basic http server that the web socket implementation wraps round */
    http: HttpServer;
    /** The list of clients connected to the server */
    clients: RelayClient[] = [];
    /** A map from client username to server - for easy lookup */
    clientsByName: Record<string, RelayClient> = {};
    /** The port number we're running on - 8080 because thats the default expectation on nodejs AWS beanstalk */
    port: number = 8080;

    constructor() {
        console.log("Starting Relay Server");

        // create the nodejs http server and just respond to anything
        // we receive with an empty payload 200 for health check purposes
        this.http = createHttpServer((request, response) => {
            response.writeHead(200);
            response.end("");

        });

        // create the socket.io server, we're going to let anyone
        // connect from anywhere. Free for all baby!
        this.io = new Server(this.http, {
            pingTimeout: 20000,
            cors: {
                origin: "*",
                methods: ["GET", "POST"]
            }
        });

        // when we get a connection register it with this server so
        // we can send it messages later
        this.io.on('connection', (socket) => {
            this.register(socket);
        });

        // start the server running by listening on the port. This keeps
        // the nodejs process alive.
        this.http.listen(this.port, () => {
            console.log("[DEV MODE] Socket server running: " + this.port);
        });
    }

    private register(socket: Socket): boolean {
        // When we receive a new connection check the username
        // presented against existing clients. If it's already in 
        // use just kick the connection
        const name = socket.handshake.auth.name;
        if (this.clientsByName[name]) {
            console.log("Relay client already registered against: " + name);
            socket.disconnect();
            return false;
        }
        
        // otherwise we've got a new valid connection, store a 
        // record describing the client
        console.log("Relay client connect: " + name);
        const client: RelayClient = {
            name,
            socket
        };

        this.clients.push(client);
        this.clientsByName[name] = client;

        // if a socket is dropped then remove it from 
        // the list we hold for the server
        socket.on('disconnect', () => {
            this.unregister(socket);
        });

        // if we receive a message from a client forward
        // it to whoever the message is addressed to
        // Messages are of the format:
        // {
        //    to: "username",
        //    message: "your content here"
        // }
        socket.on('message', (data) => {
            if (data.to) {
                this.sendMessage(data.to, name, data.message);
            }
        });

        return true;
    }

    private unregister(socket: Socket): void {
        // a socket has been closed so find the related client (if any) 
        // and remove it from our list 
        const client = this.clients.find(client => client.socket === socket);
        if (client) {
            console.log("Relay client disconnect: " + client.name);
            delete this.clientsByName[client.name];
            this.clients.splice(this.clients.indexOf(client), 1);
        }
    }

    private sendMessage(target: string, from: string,  message: string): void {
        // A client has sent a message, we've received it, now we need to relay
        // it on to the right client. Look up the client based on the target/to
        // that was provided and send the message on include the from
        // username 
        const client = this.clients.find(client => client.name === target);
        if (client) {
            console.log("Sending message to " + client.name);
            client.socket.emit('message', {
                from,
                message
            });
        } else {
            console.log("Couldn't find relay target: " + target);
        }

    }
}