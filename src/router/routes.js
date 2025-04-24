import NumberSearch from "@/views/NumberSearch/index.vue";
import LotteryAnalysis from "@/views/LotteryAnalysis/index.vue";
import pl3NextIssueAnalysis from "@/views/pl3NextIssueAnalysis/index.vue";
import pl5NextIssueAnalysis from "@/views/pl5NextIssueAnalysis/index.vue";
import fc3dNextIssueAnalysis from "@/views/fc3dNextIssueAnalysis/index.vue";
import Home from "@/views/Home/index.vue";

export const routes = [
	{
		path: "/",
		redirect: "/home",
	},
	{
		path: "/home",
		name: "home",
		component: Home,
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
		path: "/p3-next-issue-analysis",
		name: "p3-next-issue-analysis",
		component: pl3NextIssueAnalysis,
	},
	{
		path: "/fc3d-next-issue-analysis",
		name: "fc3d-next-issue-analysis",
		component: fc3dNextIssueAnalysis,
	},
	{
		path: "/pl5-next-issue-analysis",
		name: "pl5-next-issue-analysis",
		component: pl5NextIssueAnalysis,
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
