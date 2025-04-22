import NumberSearch from "@/views/NumberSearch/index.vue";
import LotteryAnalysis from "@/views/LotteryAnalysis/index.vue";
import PositionNextAnalysis from "@/views/PositionNextAnalysis/index.vue";

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
	{
		path: "/position-next-analysis",
		name: "position-next-analysis",
		component: PositionNextAnalysis,
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
