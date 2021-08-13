import Requester from "./requester";
import config from "../config/config";
import Redis from "../config/redis";

export default class QuaverApi {
    public static async getFullUser(id: number): Promise<any> {
        if (!id) return null;

        const redisKey = `quaver:user:${id}`;

        const cached = await Redis.get(redisKey);
        if (cached) {
            console.info(`Using cached Quaver user data for ${id}`);
            return JSON.parse(cached);
        }

        console.info("Requesting Quaver user data for " + id);
        const response: any = await Requester.GET(`${config.quaverApiBaseUrl}/v1/users/full/${id}`);
        if (response.status != 200) return null;

        await Redis.setex(redisKey, 60 * 60, JSON.stringify(response.user));
        console.log(`Saved Quaver user data for ${id} to Redis`);

        return response.user;
    }

    static async getRecentUserScores(id: number, mode: number = 1): Promise<any> {
        // No need to cache since the most recent data is required at all times
        const url = `${config.quaverApiBaseUrl}/v1/users/scores/recent?id=${id}&mode=${mode}&limit=5`;
        const response: any = await Requester.GET(url);
        if (response.status != 200) return null;
        return response.scores;
    }
}
