export const lengths = {
    user: {
        password: {
            min: 8,
            max: 63,
        },
        email: {
            min: 5,
            max: 124,
        },
        username: {
            min: 3,
            max: 63,
        },
        name: {
            min: 3,
            max: 127,
        },
    },
    post: {
        title: {
            min: 0,
            max: 255,
        },
        description: {
            min: 0,
            max: 4095,
        },
    },
    achievements: {
        title: {
            min: 0,
            max: 255,
        },
    },
    notifications: {
        title: {
            min: 0,
            max: 255,
        },
    },
    reports: {
        text: {
            min: 0,
            max: 4095,
        },
    },
};