import { createRouter, createWebHistory } from "vue-router";
import PositionNextAnalysis from "../views/PositionNextAnalysis/index.vue";

import { routes } from "./routes";

const router = createRouter({
	history: createWebHistory(import.meta.env.BASE_URL),
	routes: [
		...routes,
		{
			path: "/position-next-analysis",
			name: "positionNextAnalysis",
			component: PositionNextAnalysis,
		},
	],
});

export default router;
