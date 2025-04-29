<template>
	<div class="container">
		<h1>000-999号码查找</h1>
		<div class="input-group">
			<input type="text" v-model="searchInput1" placeholder="输入第一个数字" maxlength="3" />
			<input type="text" v-model="searchInput2" placeholder="输入第二个数字" maxlength="3" />
			<button @click="searchNumbers">查找</button>
		</div>
		<div class="numbers-container">
			<div
				v-for="number in numbers"
				:key="number"
				class="number"
				:class="{ highlight: matchedNumbers.includes(number) }">
				{{ number }}
			</div>
		</div>
		<div class="input-group" style="margin-top: 15px; margin-bottom: 20px">
			<textarea v-model="matchedResult" placeholder="匹配的号码" readonly style="height: 300px"></textarea>
		</div>
	</div>
</template>

<script setup>
	import { ref, onMounted } from "vue";

	const searchInput1 = ref("");
	const searchInput2 = ref("");
	const numbers = ref([]);
	const matchedNumbers = ref([]);
	const matchedResult = ref("");

	const generateNumbers = () => {
		const nums = [];
		for (let i = 0; i <= 999; i++) {
			nums.push(i.toString().padStart(3, "0"));
		}
		numbers.value = nums;
	};

	const searchNumbers = () => {
		matchedNumbers.value = [];

		if (!searchInput1.value && !searchInput2.value) return;

		matchedNumbers.value = numbers.value.filter((number) => {
			const matchInput1 = !searchInput1.value || number.includes(searchInput1.value);
			const matchInput2 = !searchInput2.value || number.includes(searchInput2.value);
			return matchInput1 && matchInput2;
		});

		matchedResult.value = matchedNumbers.value.join(", ");
	};

	onMounted(() => {
		generateNumbers();
	});
</script>

<style scoped>
	body {
		font-family: Arial, sans-serif;
		max-width: 800px;
		margin: 0 auto;
		padding: 10px;
		background-color: #f5f5f5;
	}
	.container {
		background-color: white;
		padding: 15px;
		border-radius: 8px;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
	}
	h1 {
		color: #333;
		text-align: center;
		font-size: 24px;
		margin: 10px 0;
	}
	.input-group {
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
		margin-bottom: 15px;
		justify-content: center;
	}
	.input-group input {
		padding: 8px;
		border: 1px solid #ddd;
		border-radius: 4px;
		font-size: 14px;
		width: 100px;
	}
	.numbers-container {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(60px, 1fr));
		gap: 10px;
		margin-top: 15px;
		min-height: 0;
		overflow: auto;
	}
	.number {
		padding: 8px 4px;
		text-align: center;
		background-color: #f0f0f0;
		border-radius: 4px;
		font-family: monospace;
		font-size: 14px;
		min-width: 50px;
		box-sizing: border-box;
		white-space: nowrap;
		overflow: hidden;
	}
	.number.highlight {
		background-color: #ffd700;
		font-weight: bold;
	}
	button {
		background-color: #4caf50;
		color: white;
		border: none;
		padding: 8px 16px;
		border-radius: 4px;
		cursor: pointer;
		font-size: 14px;
		display: inline-block;
	}
	button:hover {
		background-color: #45a049;
	}

	/* 移动端适配 */
	@media screen and (max-width: 480px) {
		body {
			padding: 5px;
		}
		.container {
			padding: 10px;
		}
		h1 {
			font-size: 20px;
		}
		.input-group {
			flex-direction: column;
			align-items: stretch;
		}
		.input-group input {
			width: 30%;
			padding: 10px;
		}
		.numbers-container {
			grid-template-columns: repeat(auto-fit, minmax(45px, 1fr));
			gap: 6px;
		}
		.number {
			padding: 6px 3px;
			font-size: 13px;
			min-width: 40px;
		}
		button {
			width: 30%;
			margin-top: 5px;
		}
	}
</style>
