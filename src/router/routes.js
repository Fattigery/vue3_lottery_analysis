import NumberSearch from "@/views/NumberSearch/index.vue";
import LotteryAnalysis from "@/views/LotteryAnalysis/index.vue";
import P3NextIssueAnalysis from "@/views/P3NextIssueAnalysis/index.vue";
import FC3DNextIssueAnalysis from "@/views/FC3DNextIssueAnalysis/index.vue";
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
		component: P3NextIssueAnalysis,
	},
	{
		path: "/fc3d-next-issue-analysis",
		name: "fc3d-next-issue-analysis",
		component: FC3DNextIssueAnalysis,
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
