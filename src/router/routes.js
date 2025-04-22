import NumberSearch from "@/views/NumberSearch.vue";
import LotteryAnalysis from "@/views/LotteryAnalysis.vue";

export const routes = [
	{
		path: "/",
		redirect: "/lottery-analysis",
	},
	{
		path: "/number-search",
		name: "number-search",
		component: NumberSearch,
	},
	{
		path: "/lottery-analysis",
		name: "lottery-analysis",
		component: LotteryAnalysis,
	},

	// {
	// 	path: "/about",
	// 	name: "about",
	// 	// route level code-splitting
	// 	// this generates a separate chunk (About.[hash].js) for this route
	// 	// which is lazy-loaded when the route is visited.
	// 	component: () => import("../views/AboutView.vue"),
	// },
];
