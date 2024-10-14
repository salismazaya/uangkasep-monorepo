import Pusher, { Channel } from "pusher-js";
import { pusherCluster, pusherKey } from "../variables";

const pusher = new Pusher(pusherKey, {
    cluster: pusherCluster,
});

export const publicChannel = pusher.subscribe('public');

export const register = ({ channel, eventName, callback }: { channel: Channel, eventName: string, callback: (data: any) => void }) => {
    channel.bind(eventName, (data: any) => {
        callback(data);
    });
}