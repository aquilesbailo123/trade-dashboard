export const routes = {
    login: "/login",
    home: "/",
    transactions: "/transactions",
    users: "/users",
    settings: "/settings",
    notFound: "*",
} as const;

export type RouteKey = keyof typeof routes;
