<script setup>
	import { RouterLink, RouterView } from "vue-router";
	import NumberSearch from "./views/NumberSearch.vue";
</script>

<template>
	<header>
		<div class="wrapper">
			<nav>
				<RouterLink to="/">Home</RouterLink>
				<RouterLink to="/number-search">Number Search</RouterLink>
				<RouterLink to="/lottery-analysis">lottery-analysis</RouterLink>
				<!-- <RouterLink to="/">Home</RouterLink>
				<RouterLink to="/about">About</RouterLink> -->
			</nav>
		</div>
	</header>

	<RouterView />
</template>

<style scoped></style>
