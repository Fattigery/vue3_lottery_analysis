import NumberSearch from "@/views/NumberSearch/index.vue";
// 下一期开奖号码分析
import LotteryAnalysis from "@/views/LotteryAnalysis/index.vue";
// 开奖号码与相邻号码推测下一期号码
import pl3NextIssueAnalysis from "@/views/pl3NextIssueAnalysis/index.vue";
// 只开奖号码推测下一期号码
import fc3dNextIssueAnalysis from "@/views/fc3dNextIssueAnalysis/index.vue";
// 排列五号码推测
import pl5NextIssueAnalysis from "@/views/pl5NextIssueAnalysis/index.vue";
// 杀码
import killCode from "@/views/killCode/index.vue";

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
	{
		path: "/kill-code",
		name: "kill-code",
		component: killCode,
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
