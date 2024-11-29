import { IoAdapter } from "@nestjs/platform-socket.io";
import { createAdapter } from "@socket.io/redis-adapter";
import { createClient } from "redis";

export class Redisadp extends IoAdapter {
    private adapterConstructor: ReturnType<typeof createAdapter>;


    async connectRedis(): Promise<void>{
        const pubClient = createClient({url: process.env.REDIS_URL});
        const subClient = pubClient.duplicate()

        await Promise.all([pubClient.connect(), subClient.connect()]);
        console.log('redis connected');
        
        this.adapterConstructor = createAdapter(pubClient, subClient);
    }

    createIOServer(port: number, options?: any) {
        const server = super.createIOServer(port, options);
        server.adapter(this.adapterConstructor);
        return server;
    }
}
