module.exports = [
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
"[project]/app/layout.tsx [app-rsc] (ecmascript, Next.js Server Component)", ((__turbopack_context__) => {

__turbopack_context__.n(__turbopack_context__.i("[project]/app/layout.tsx [app-rsc] (ecmascript)"));
}),
"[project]/app/analytics/page.tsx [app-rsc] (ecmascript)", ((__turbopack_context__, module, exports) => {

const { jsxDEV: _jsxDEV } = __turbopack_context__.r("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-jsx-dev-runtime.js [app-rsc] (ecmascript)");
{}/*#__PURE__*/ _jsxDEV("div", {
    className: "rounded-lg border bg-card p-6",
    children: [
        /*#__PURE__*/ _jsxDEV("h2", {
            className: "text-xl font-semibold mb-4",
            children: "Smart Insights"
        }, void 0, false, {
            fileName: "[project]/app/analytics/page.tsx",
            lineNumber: 3,
            columnNumber: 15
        }, /*TURBOPACK member replacement*/ __turbopack_context__.e),
        /*#__PURE__*/ _jsxDEV("div", {
            className: "space-y-3",
            children: [
                /*#__PURE__*/ _jsxDEV("div", {
                    className: "flex items-start p-3 bg-blue-50 dark:bg-blue-900/30 rounded-lg",
                    children: [
                        /*#__PURE__*/ _jsxDEV(LightbulbIcon, {
                            className: "h-5 w-5 text-blue-500 mt-0.5 mr-2"
                        }, void 0, false, {
                            fileName: "[project]/app/analytics/page.tsx",
                            lineNumber: 6,
                            columnNumber: 19
                        }, /*TURBOPACK member replacement*/ __turbopack_context__.e),
                        /*#__PURE__*/ _jsxDEV("div", {
                            children: [
                                /*#__PURE__*/ _jsxDEV("p", {
                                    className: "font-medium",
                                    children: "Savings Analysis"
                                }, void 0, false, {
                                    fileName: "[project]/app/analytics/page.tsx",
                                    lineNumber: 8,
                                    columnNumber: 21
                                }, /*TURBOPACK member replacement*/ __turbopack_context__.e),
                                /*#__PURE__*/ _jsxDEV("p", {
                                    className: "text-sm text-muted-foreground",
                                    children: savingsRate >= 20 ? "Great job! You're saving more than 20% of your income." : savingsRate >= 10 ? "You're saving a healthy amount. Try to increase it to 20%." : "Consider reducing expenses to improve your savings rate."
                                }, void 0, false, {
                                    fileName: "[project]/app/analytics/page.tsx",
                                    lineNumber: 9,
                                    columnNumber: 21
                                }, /*TURBOPACK member replacement*/ __turbopack_context__.e)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/app/analytics/page.tsx",
                            lineNumber: 7,
                            columnNumber: 19
                        }, /*TURBOPACK member replacement*/ __turbopack_context__.e)
                    ]
                }, void 0, true, {
                    fileName: "[project]/app/analytics/page.tsx",
                    lineNumber: 5,
                    columnNumber: 17
                }, /*TURBOPACK member replacement*/ __turbopack_context__.e),
                biggestExpense.category && /*#__PURE__*/ _jsxDEV("div", {
                    className: "flex items-start p-3 bg-amber-50 dark:bg-amber-900/30 rounded-lg",
                    children: [
                        /*#__PURE__*/ _jsxDEV(AlertCircleIcon, {
                            className: "h-5 w-5 text-amber-500 mt-0.5 mr-2"
                        }, void 0, false, {
                            fileName: "[project]/app/analytics/page.tsx",
                            lineNumber: 21,
                            columnNumber: 21
                        }, /*TURBOPACK member replacement*/ __turbopack_context__.e),
                        /*#__PURE__*/ _jsxDEV("div", {
                            children: [
                                /*#__PURE__*/ _jsxDEV("p", {
                                    className: "font-medium",
                                    children: "Spending Alert"
                                }, void 0, false, {
                                    fileName: "[project]/app/analytics/page.tsx",
                                    lineNumber: 23,
                                    columnNumber: 23
                                }, /*TURBOPACK member replacement*/ __turbopack_context__.e),
                                /*#__PURE__*/ _jsxDEV("p", {
                                    className: "text-sm text-muted-foreground",
                                    children: [
                                        "Your biggest expense is ",
                                        biggestExpense.category,
                                        " at $",
                                        biggestExpense.amount.toLocaleString(undefined, {
                                            minimumFractionDigits: 2,
                                            maximumFractionDigits: 2
                                        }),
                                        ". Consider if this aligns with your budget."
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/analytics/page.tsx",
                                    lineNumber: 24,
                                    columnNumber: 23
                                }, /*TURBOPACK member replacement*/ __turbopack_context__.e)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/app/analytics/page.tsx",
                            lineNumber: 22,
                            columnNumber: 21
                        }, /*TURBOPACK member replacement*/ __turbopack_context__.e)
                    ]
                }, void 0, true, {
                    fileName: "[project]/app/analytics/page.tsx",
                    lineNumber: 20,
                    columnNumber: 19
                }, /*TURBOPACK member replacement*/ __turbopack_context__.e),
                /*#__PURE__*/ _jsxDEV("div", {
                    className: "flex items-start p-3 bg-green-50 dark:bg-green-900/30 rounded-lg",
                    children: [
                        /*#__PURE__*/ _jsxDEV(TrendingUpIcon, {
                            className: "h-5 w-5 text-green-500 mt-0.5 mr-2"
                        }, void 0, false, {
                            fileName: "[project]/app/analytics/page.tsx",
                            lineNumber: 33,
                            columnNumber: 19
                        }, /*TURBOPACK member replacement*/ __turbopack_context__.e),
                        /*#__PURE__*/ _jsxDEV("div", {
                            children: [
                                /*#__PURE__*/ _jsxDEV("p", {
                                    className: "font-medium",
                                    children: "Financial Health"
                                }, void 0, false, {
                                    fileName: "[project]/app/analytics/page.tsx",
                                    lineNumber: 35,
                                    columnNumber: 21
                                }, /*TURBOPACK member replacement*/ __turbopack_context__.e),
                                /*#__PURE__*/ _jsxDEV("p", {
                                    className: "text-sm text-muted-foreground",
                                    children: netBalance >= 0 ? "You're in a positive financial position. Keep up the good work!" : "You're spending more than you're earning. Review your expenses."
                                }, void 0, false, {
                                    fileName: "[project]/app/analytics/page.tsx",
                                    lineNumber: 36,
                                    columnNumber: 21
                                }, /*TURBOPACK member replacement*/ __turbopack_context__.e)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/app/analytics/page.tsx",
                            lineNumber: 34,
                            columnNumber: 19
                        }, /*TURBOPACK member replacement*/ __turbopack_context__.e)
                    ]
                }, void 0, true, {
                    fileName: "[project]/app/analytics/page.tsx",
                    lineNumber: 32,
                    columnNumber: 17
                }, /*TURBOPACK member replacement*/ __turbopack_context__.e)
            ]
        }, void 0, true, {
            fileName: "[project]/app/analytics/page.tsx",
            lineNumber: 4,
            columnNumber: 15
        }, /*TURBOPACK member replacement*/ __turbopack_context__.e)
    ]
}, void 0, true, {
    fileName: "[project]/app/analytics/page.tsx",
    lineNumber: 2,
    columnNumber: 13
}, /*TURBOPACK member replacement*/ __turbopack_context__.e);
}),
"[project]/app/analytics/page.tsx [app-rsc] (ecmascript, Next.js Server Component)", ((__turbopack_context__) => {

__turbopack_context__.n(__turbopack_context__.i("[project]/app/analytics/page.tsx [app-rsc] (ecmascript)"));
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__96a541db._.js.map