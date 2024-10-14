import Pusher, { Channel } from "pusher-js";
import { pusherCluster, pusherKey } from "../variables";

const pusher = new Pusher(pusherKey, {
    cluster: pusherCluster,
});

export const publicChannel = pusher.subscribe('public');

const registered: string[] = [];

export const register = ({ unique, channel, eventName, callback }: { unique: string, channel: Channel, eventName: string, callback: (data: any) => void }) => {
    console.log(unique);
    if (!registered.includes(unique)) {
        channel.bind(eventName, (data: any) => {
            console.log(data);
            console.log(callback);
            callback(data);
        });
    } else {
        registered.push(unique);
    }

}