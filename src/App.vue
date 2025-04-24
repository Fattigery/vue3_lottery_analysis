<script setup>
	import { RouterLink, RouterView, useRoute, useRouter } from "vue-router";
	import { ref, computed, watch, onMounted } from "vue";
	import NumberSearch from "./views/NumberSearch/index.vue";

	const route = useRoute();
	const router = useRouter();

	// 根据当前路由路径设置活动菜单项
	const activeIndex = ref("/");

	// 监听路由变化，更新活动菜单项
	watch(
		() => route.path,
		(newPath) => {
			activeIndex.value = newPath;
		},
		{ immediate: true }
	);

	// 初始化时设置活动菜单项
	onMounted(() => {
		activeIndex.value = route.path;
	});
</script>

<template>
	<header>
		<div class="header-container">
			<el-menu
				:default-active="activeIndex"
				mode="horizontal"
				router
				background-color="#545c64"
				text-color="#fff"
				active-text-color="#ffd04b"
				class="main-nav">
				<el-menu-item index="/home">首页</el-menu-item>
				<el-menu-item index="/number-search">000-999号码查询</el-menu-item>
				<el-menu-item index="/lottery-analysis">下一期开奖号码分析</el-menu-item>
				<el-menu-item index="/p3-next-issue-analysis">下一期P3号码推测</el-menu-item>
				<el-menu-item index="/fc3d-next-issue-analysis">下一期3D号码推测</el-menu-item>
			</el-menu>
		</div>
	</header>

	<div class="content-container">
		<RouterView />
	</div>
</template>

<style scoped>
	.header-container {
		width: 100%;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
	}

	.main-nav {
		display: flex;
		justify-content: flex-start;
	}

	.content-container {
		padding: 20px;
		max-width: 1200px;
		margin: 0 auto;
	}

	/* 适配移动设备 */
	@media (max-width: 768px) {
		.content-container {
			padding: 10px;
		}
	}
</style>
