import { api } from "./api";

export interface LeaderboardUserResponse {
    id: number;
    name: string;
    nick: string;
    avatar?: string;
    score: number;
    rank: number;
    isOnline: boolean;
    gang: 'potatoes' | 'tomatoes';
}

export const leaderboardService = {
    getLeaderboard: (): Promise<LeaderboardUserResponse[]> =>
        api.get<LeaderboardUserResponse[]>("/leaderboards"),
};