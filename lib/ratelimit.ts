import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL!,
    token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

export const loginRateLimit = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(3, "5 m"),
    analytics: true,
    prefix: "@upstash/ratelimit/login",
});

export const buyDataRateLimit = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(1, "60 s"),
    analytics: true,
    prefix: "@upstash/ratelimit/buyData", 
});

export const buyAfaDataRateLimit = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(1, "60 s"),
    analytics: true,
    prefix: "@upstash/ratelimit/buyAfaData",
});


export const topUpRateLimit = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(2, "10 m"),
    analytics: true,
    prefix: "@upstash/ratelimit/topUp",
});

export const afaRegisterRateLimit = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(2, "10 m"),
    analytics: true,
    prefix: "@upstash/ratelimit/afaTopUp",
});