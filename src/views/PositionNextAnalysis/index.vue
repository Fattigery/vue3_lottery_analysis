<template>
	<div class="container">
		<div class="control-panel">
			<div class="control-item">
				<label>彩票类型:</label>
				<el-select v-model="caipiaoid" placeholder="选择彩票类型" class="select-control">
					<el-option :value="16" label="排列三"></el-option>
					<el-option :value="12" label="福彩3D"></el-option>
				</el-select>
			</div>
			<div class="control-item">
				<label>分析期数:</label>
				<el-select v-model="limit" placeholder="选择分析期数" class="select-control" disabled>
					<el-option :value="50" label="固定50期"></el-option>
				</el-select>
			</div>
			<el-button type="primary" @click="fetchAndAnalyze" class="analyze-btn">分析</el-button>
		</div>

		<div class="latest-draw">
			<h2>当前分析期号</h2>
			<div class="period-selector">
				<div class="period-label">期号: {{ latestDraw.expect || "--" }}</div>
				<el-select
					v-model="selectedDrawPeriod"
					placeholder="选择期号"
					@change="handleDrawPeriodChange"
					class="period-select">
					<el-option v-for="item in historyData" :key="item.expect" :label="item.expect" :value="item.expect">
					</el-option>
				</el-select>
				<div class="period-tip" :class="{ insufficient: isDataInsufficient }">
					{{ remainCountTip }}
				</div>
			</div>
			<div class="numbers">
				<div v-for="(num, index) in latestNumbers" :key="index" class="number-ball">
					{{ num }}
				</div>
			</div>
		</div>

		<!-- 分析结果展示区域 -->
		<div class="analysis-results" v-if="!isAnalysisLoading">
			<!-- 百位分析 -->
			<div class="analysis-section position-analysis-section">
				<h3>百位号码分析 ({{ analysisRange }})</h3>
				<p>分析百位号码在历史数据中出现的下一期号码规律</p>

				<div class="position-tabs">
					<div
						v-for="num in 10"
						:key="`hundred-${num - 1}`"
						class="position-tab"
						:class="{ active: selectedHundredDigit === num - 1 }"
						@click="selectedHundredDigit = num - 1">
						{{ num - 1 }}
					</div>
				</div>

				<div class="stats-table-container" v-if="hundredNextStats.length > 0">
					<table class="stats-table">
						<thead>
							<tr>
								<th>上期百位为 {{ selectedHundredDigit }} 的开奖期号</th>
								<th>开奖号码</th>
								<th>下一期号码</th>
							</tr>
						</thead>
						<tbody>
							<tr v-for="(item, idx) in getPositionMatchData(0, selectedHundredDigit)" :key="`hundred-match-${idx}`">
								<td>{{ item.expect }}</td>
								<td>{{ item.opencode }}</td>
								<td>{{ item.nextOpencode }}</td>
							</tr>
						</tbody>
					</table>
				</div>

				<h4>下一期号码出现频率统计</h4>
				<div class="stats-table-container">
					<table class="stats-table">
						<thead>
							<tr>
								<th v-for="i in 10" :key="`hundred-header-${i - 1}`">{{ i - 1 }}</th>
							</tr>
						</thead>
						<tbody>
							<tr>
								<td
									v-for="i in 10"
									:key="`hundred-cell-${i - 1}`"
									:class="{ 'zero-count-cell': getPositionNextFrequency(0, selectedHundredDigit, i - 1) === 0 }">
									{{ getPositionNextFrequency(0, selectedHundredDigit, i - 1) }}
								</td>
							</tr>
						</tbody>
					</table>
				</div>
			</div>

			<!-- 十位分析 -->
			<div class="analysis-section position-analysis-section">
				<h3>十位号码分析 ({{ analysisRange }})</h3>
				<p>分析十位号码在历史数据中出现的下一期号码规律</p>

				<div class="position-tabs">
					<div
						v-for="num in 10"
						:key="`ten-${num - 1}`"
						class="position-tab"
						:class="{ active: selectedTenDigit === num - 1 }"
						@click="selectedTenDigit = num - 1">
						{{ num - 1 }}
					</div>
				</div>

				<div class="stats-table-container" v-if="tenNextStats.length > 0">
					<table class="stats-table">
						<thead>
							<tr>
								<th>上期十位为 {{ selectedTenDigit }} 的开奖期号</th>
								<th>开奖号码</th>
								<th>下一期号码</th>
							</tr>
						</thead>
						<tbody>
							<tr v-for="(item, idx) in getPositionMatchData(1, selectedTenDigit)" :key="`ten-match-${idx}`">
								<td>{{ item.expect }}</td>
								<td>{{ item.opencode }}</td>
								<td>{{ item.nextOpencode }}</td>
							</tr>
						</tbody>
					</table>
				</div>

				<h4>下一期号码出现频率统计</h4>
				<div class="stats-table-container">
					<table class="stats-table">
						<thead>
							<tr>
								<th v-for="i in 10" :key="`ten-header-${i - 1}`">{{ i - 1 }}</th>
							</tr>
						</thead>
						<tbody>
							<tr>
								<td
									v-for="i in 10"
									:key="`ten-cell-${i - 1}`"
									:class="{ 'zero-count-cell': getPositionNextFrequency(1, selectedTenDigit, i - 1) === 0 }">
									{{ getPositionNextFrequency(1, selectedTenDigit, i - 1) }}
								</td>
							</tr>
						</tbody>
					</table>
				</div>
			</div>

			<!-- 个位分析 -->
			<div class="analysis-section position-analysis-section">
				<h3>个位号码分析 ({{ analysisRange }})</h3>
				<p>分析个位号码在历史数据中出现的下一期号码规律</p>

				<div class="position-tabs">
					<div
						v-for="num in 10"
						:key="`one-${num - 1}`"
						class="position-tab"
						:class="{ active: selectedOneDigit === num - 1 }"
						@click="selectedOneDigit = num - 1">
						{{ num - 1 }}
					</div>
				</div>

				<div class="stats-table-container" v-if="oneNextStats.length > 0">
					<table class="stats-table">
						<thead>
							<tr>
								<th>上期个位为 {{ selectedOneDigit }} 的开奖期号</th>
								<th>开奖号码</th>
								<th>下一期号码</th>
							</tr>
						</thead>
						<tbody>
							<tr v-for="(item, idx) in getPositionMatchData(2, selectedOneDigit)" :key="`one-match-${idx}`">
								<td>{{ item.expect }}</td>
								<td>{{ item.opencode }}</td>
								<td>{{ item.nextOpencode }}</td>
							</tr>
						</tbody>
					</table>
				</div>

				<h4>下一期号码出现频率统计</h4>
				<div class="stats-table-container">
					<table class="stats-table">
						<thead>
							<tr>
								<th v-for="i in 10" :key="`one-header-${i - 1}`">{{ i - 1 }}</th>
							</tr>
						</thead>
						<tbody>
							<tr>
								<td
									v-for="i in 10"
									:key="`one-cell-${i - 1}`"
									:class="{ 'zero-count-cell': getPositionNextFrequency(2, selectedOneDigit, i - 1) === 0 }">
									{{ getPositionNextFrequency(2, selectedOneDigit, i - 1) }}
								</td>
							</tr>
						</tbody>
					</table>
				</div>
			</div>
		</div>

		<div class="analysis-results" v-else>
			<div class="loading">{{ analysisLoadingText }}</div>
		</div>
	</div>
</template>

<script setup>
	import { ref, computed, watch, onMounted } from "vue";
	import { ElMessage } from "element-plus";

	// ==================== 响应式数据 ====================

	/**
	 * 彩票类型ID
	 * 16: 排列三
	 * 12: 福彩3D
	 */
	const caipiaoid = ref(16); // 默认为排列三

	/**
	 * 分析期数 - 固定为50期
	 */
	const limit = ref(50);

	/**
	 * 存储所有获取到的历史开奖数据
	 */
	const historyData = ref([]);

	/**
	 * 当前选择的期号，用于确定从哪一期开始分析
	 */
	const selectedDrawPeriod = ref(null);

	/**
	 * 选中的百位数字（0-9）
	 */
	const selectedHundredDigit = ref(0);

	/**
	 * 选中的十位数字（0-9）
	 */
	const selectedTenDigit = ref(0);

	/**
	 * 选中的个位数字（0-9）
	 */
	const selectedOneDigit = ref(0);

	/**
	 * 百位的下一期号码统计
	 */
	const hundredNextStats = ref([]);

	/**
	 * 十位的下一期号码统计
	 */
	const tenNextStats = ref([]);

	/**
	 * 个位的下一期号码统计
	 */
	const oneNextStats = ref([]);

	/**
	 * 分析期号范围描述
	 */
	const analysisRange = ref("");

	/**
	 * 分析结果的加载状态
	 */
	const isAnalysisLoading = ref(true);

	/**
	 * 分析加载状态的提示文本
	 */
	const analysisLoadingText = ref('请点击"分析"按钮开始分析');

	// ==================== 计算属性 ====================

	/**
	 * 获取最新一期开奖数据
	 */
	const latestDraw = computed(() => {
		return historyData.value.length > 0 ? historyData.value[0] : { expect: "--" };
	});

	/**
	 * 获取当前选择期号的开奖号码数组
	 */
	const latestNumbers = computed(() => {
		if (historyData.value.length === 0) return ["-", "-", "-"];

		const draw = historyData.value.find((item) => item.expect === selectedDrawPeriod.value) || historyData.value[0];

		if (draw.opencode) {
			return draw.opencode.split(",");
		} else if (draw.number) {
			return draw.number.split(/\s+/);
		}

		return ["-", "-", "-"];
	});

	/**
	 * 计算所选期号前有多少条数据参与分析的提示文本
	 */
	const remainCountTip = computed(() => {
		if (!selectedDrawPeriod.value || historyData.value.length === 0) return "";

		const idx = historyData.value.findIndex((item) => item.expect === selectedDrawPeriod.value);
		if (idx < 0) return "";

		// 我们需要所选期号往前的49条数据，一共50条
		const dataCount = historyData.value.length - idx;
		// 确保不超过实际数据量
		const participatingData = Math.min(dataCount, limit.value);
		const isInsufficient = participatingData < limit.value;

		return `有 ${participatingData} 条数据参与分析${isInsufficient ? "（不足）" : ""}`;
	});

	/**
	 * 判断所选期号的数据是否不足
	 */
	const isDataInsufficient = computed(() => {
		if (!selectedDrawPeriod.value || historyData.value.length === 0) return false;

		const idx = historyData.value.findIndex((item) => item.expect === selectedDrawPeriod.value);
		if (idx < 0) return false;

		return historyData.value.length - idx < limit.value;
	});

	// ==================== 核心方法 ====================

	/**
	 * 获取彩票历史数据并进行分析
	 */
	function fetchAndAnalyze() {
		// 设置加载状态
		isAnalysisLoading.value = true;
		analysisLoadingText.value = "正在获取数据，请稍候...";

		// 计算需要请求的数据量，至少为分析期数
		let requestLimit = limit.value;

		// 如果已经选择了期号且不是最新一期，计算期号差距
		if (selectedDrawPeriod.value && historyData.value.length > 0) {
			const selectedIndex = historyData.value.findIndex((item) => item.expect === selectedDrawPeriod.value);
			// 如果找到选中的期号
			if (selectedIndex >= 0) {
				// 需要请求的数据量 = 分析期数 + 期号与最新期的差距
				requestLimit = Math.max(limit.value, selectedIndex + limit.value);
				console.log(`需要请求${requestLimit}期数据，确保能分析${limit.value}期`);
			}
		}

		// 发起API请求获取历史数据
		fetch(`https://api.hcaiy.com/api/index/historyList?caipiaoid=${caipiaoid.value}&limit=${requestLimit}&page=1`)
			.then((res) => res.json())
			.then((data) => {
				if (data.code === 1 && data.data) {
					// 处理返回的数据
					let dataArray = [];
					if (data.data.data && Array.isArray(data.data.data)) {
						dataArray = data.data.data;
					} else if (Array.isArray(data.data)) {
						dataArray = data.data;
					}

					if (dataArray.length > 0) {
						// 规范化数据格式
						const processedData = dataArray.map((item) => {
							const processedItem = { ...item };
							// 统一开奖号码格式为逗号分隔
							if (!processedItem.opencode && processedItem.number) {
								processedItem.opencode = processedItem.number.replace(/\s+/g, ",");
							}
							// 统一期号字段为expect
							if (!processedItem.expect && processedItem.issueno) {
								processedItem.expect = processedItem.issueno;
							}
							return processedItem;
						});

						// 更新历史数据
						historyData.value = processedData;

						// 处理期号选择
						if (!selectedDrawPeriod.value) {
							// 默认选中最新一期
							selectedDrawPeriod.value = historyData.value[0].expect;
						} else {
							// 尝试恢复之前选择的期号
							const existingOption = historyData.value.find((item) => item.expect === selectedDrawPeriod.value);
							if (!existingOption) {
								// 如果之前选择的期号不在新数据中，重置为最新一期
								selectedDrawPeriod.value = historyData.value[0].expect;
							}
						}

						// 根据选择的期号进行分析
						analyzeDataBySelectedPeriod();
					} else {
						// 处理空数据情况
						isAnalysisLoading.value = true;
						analysisLoadingText.value = "获取数据失败，请重试";
					}
				} else {
					// 处理API返回错误
					isAnalysisLoading.value = true;
					analysisLoadingText.value = "获取数据失败，请重试";
				}
			})
			.catch((error) => {
				// 处理网络错误
				isAnalysisLoading.value = true;
				analysisLoadingText.value = "获取数据失败，请重试";
				console.error("Error fetching data:", error);
			});
	}

	/**
	 * 期号变化时的处理函数
	 */
	function handleDrawPeriodChange() {
		// 验证数据有效性
		if (!selectedDrawPeriod.value || historyData.value.length === 0) return;

		// 找到选中期号在历史数据中的索引
		const idx = historyData.value.findIndex((item) => item.expect === selectedDrawPeriod.value);
		if (idx === -1) return;

		// 检查是否有足够的数据进行分析
		const availableData = historyData.value.length - idx;

		// 如果数据不足且不是最新一期，则需要重新请求数据
		if (availableData < limit.value && idx > 0) {
			// 数据不足，需要重新获取更多数据
			isAnalysisLoading.value = true;
			analysisLoadingText.value = `所选期号的数据不足${limit.value}期，正在获取更多数据...`;
			fetchAndAnalyze(); // 重新获取数据
		} else {
			// 数据足够或者是最新一期，直接分析
			analyzeDataBySelectedPeriod();
		}
	}

	/**
	 * 根据选中的期号分析数据
	 */
	function analyzeDataBySelectedPeriod() {
		// 验证数据有效性
		if (!selectedDrawPeriod.value || !historyData.value.length) return;

		// 找到选中期号在历史数据中的索引
		const idx = historyData.value.findIndex((item) => item.expect === selectedDrawPeriod.value);
		if (idx === -1) return;

		// 获取有效的分析数据（所选期号及其前面的数据）
		let dataToAnalyze = historyData.value.slice(idx);

		// 如果数据量超过了limit，只取所需的数量
		const maxDataCount = Math.min(dataToAnalyze.length, limit.value);
		dataToAnalyze = dataToAnalyze.slice(0, maxDataCount);

		// 如果数据不足，显示提示
		if (dataToAnalyze.length < 2) {
			// 至少需要2期才能分析前后关系
			isAnalysisLoading.value = true;
			analysisLoadingText.value = "数据不足，无法进行分析";
			return;
		}

		// 更新分析期号范围
		const firstPeriod = dataToAnalyze[dataToAnalyze.length - 1]?.expect || "--";
		const lastPeriod = dataToAnalyze[0]?.expect || "--";
		analysisRange.value = `从${firstPeriod}期到${lastPeriod}期`;

		// 分析各位置数据
		analyzePositionData(dataToAnalyze);

		// 分析完成，更新状态
		isAnalysisLoading.value = false;
	}

	/**
	 * 分析各位置的数据
	 * @param {Array} data 历史数据数组
	 */
	function analyzePositionData(data) {
		// 清空现有分析数据
		hundredNextStats.value = [];
		tenNextStats.value = [];
		oneNextStats.value = [];

		// 初始化三个位置的统计数组
		for (let digit = 0; digit <= 9; digit++) {
			hundredNextStats.value[digit] = { digit, nextDigits: Array(10).fill(0), matchData: [] };
			tenNextStats.value[digit] = { digit, nextDigits: Array(10).fill(0), matchData: [] };
			oneNextStats.value[digit] = { digit, nextDigits: Array(10).fill(0), matchData: [] };
		}

		// 分析数据
		for (let i = 0; i < data.length - 1; i++) {
			// 最后一期没有下一期，所以-1
			const currentDraw = data[i];
			const nextDraw = data[i + 1]; // 注意：数据是按期号倒序排列的

			// 解析当前期号码
			let currentNumbers = [];
			if (currentDraw.opencode) {
				currentNumbers = currentDraw.opencode.split(",").map((num) => parseInt(num));
			} else if (currentDraw.number) {
				currentNumbers = currentDraw.number.split(/\s+/).map((num) => parseInt(num));
			}

			// 解析下一期号码
			let nextNumbers = [];
			if (nextDraw.opencode) {
				nextNumbers = nextDraw.opencode.split(",").map((num) => parseInt(num));
			} else if (nextDraw.number) {
				nextNumbers = nextDraw.number.split(/\s+/).map((num) => parseInt(num));
			}

			// 如果无法解析号码，跳过此期
			if (currentNumbers.length < 3 || nextNumbers.length < 3) {
				continue;
			}

			// 百位分析
			const hundredDigit = currentNumbers[0];
			if (hundredDigit >= 0 && hundredDigit <= 9) {
				// 统计下一期各位置出现的数字
				for (let pos = 0; pos < 3; pos++) {
					if (nextNumbers[pos] >= 0 && nextNumbers[pos] <= 9) {
						hundredNextStats.value[hundredDigit].nextDigits[nextNumbers[pos]]++;
					}
				}

				// 添加匹配数据
				hundredNextStats.value[hundredDigit].matchData.push({
					expect: currentDraw.expect,
					opencode: currentDraw.opencode || currentDraw.number,
					nextOpencode: nextDraw.opencode || nextDraw.number,
				});
			}

			// 十位分析
			const tenDigit = currentNumbers[1];
			if (tenDigit >= 0 && tenDigit <= 9) {
				// 统计下一期各位置出现的数字
				for (let pos = 0; pos < 3; pos++) {
					if (nextNumbers[pos] >= 0 && nextNumbers[pos] <= 9) {
						tenNextStats.value[tenDigit].nextDigits[nextNumbers[pos]]++;
					}
				}

				// 添加匹配数据
				tenNextStats.value[tenDigit].matchData.push({
					expect: currentDraw.expect,
					opencode: currentDraw.opencode || currentDraw.number,
					nextOpencode: nextDraw.opencode || nextDraw.number,
				});
			}

			// 个位分析
			const oneDigit = currentNumbers[2];
			if (oneDigit >= 0 && oneDigit <= 9) {
				// 统计下一期各位置出现的数字
				for (let pos = 0; pos < 3; pos++) {
					if (nextNumbers[pos] >= 0 && nextNumbers[pos] <= 9) {
						oneNextStats.value[oneDigit].nextDigits[nextNumbers[pos]]++;
					}
				}

				// 添加匹配数据
				oneNextStats.value[oneDigit].matchData.push({
					expect: currentDraw.expect,
					opencode: currentDraw.opencode || currentDraw.number,
					nextOpencode: nextDraw.opencode || nextDraw.number,
				});
			}
		}
	}

	/**
	 * 获取指定位置和数字的匹配数据
	 * @param {number} position 位置索引(0:百位, 1:十位, 2:个位)
	 * @param {number} digit 要查询的数字(0-9)
	 * @returns {Array} 匹配数据数组
	 */
	function getPositionMatchData(position, digit) {
		if (position === 0) {
			return hundredNextStats.value[digit]?.matchData || [];
		} else if (position === 1) {
			return tenNextStats.value[digit]?.matchData || [];
		} else if (position === 2) {
			return oneNextStats.value[digit]?.matchData || [];
		}
		return [];
	}

	/**
	 * 获取指定位置特定数字的下一期号码频率
	 * @param {number} position 位置索引(0:百位, 1:十位, 2:个位)
	 * @param {number} fromDigit 当前位数字(0-9)
	 * @param {number} toDigit 下一期数字(0-9)
	 * @returns {number} 频率数值
	 */
	function getPositionNextFrequency(position, fromDigit, toDigit) {
		if (position === 0) {
			return hundredNextStats.value[fromDigit]?.nextDigits[toDigit] || 0;
		} else if (position === 1) {
			return tenNextStats.value[fromDigit]?.nextDigits[toDigit] || 0;
		} else if (position === 2) {
			return oneNextStats.value[fromDigit]?.nextDigits[toDigit] || 0;
		}
		return 0;
	}

	// ==================== 生命周期钩子 ====================

	/**
	 * 组件挂载时自动获取数据并进行分析
	 */
	onMounted(() => {
		fetchAndAnalyze();
	});

	/**
	 * 监听彩票类型变化
	 */
	watch(caipiaoid, () => {
		// 当彩票类型变化时，重新获取数据并分析
		selectedDrawPeriod.value = null; // 重置选中的期号
		fetchAndAnalyze();
	});
</script>

<style scoped>
	.container {
		max-width: 1000px;
		margin: 0 auto;
		background-color: #fff;
		padding: 20px;
		border-radius: 8px;
		box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
	}

	.control-panel {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 20px;
		padding: 20px;
		background-color: #f6f8fa;
		border-radius: 10px;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
		flex-wrap: wrap;
		gap: 15px;
	}

	.control-item {
		display: flex;
		align-items: center;
		flex: 1;
		min-width: 250px;
	}

	.control-item label {
		margin-right: 10px;
		font-weight: 600;
		font-size: 15px;
		color: #333;
		white-space: nowrap;
	}

	/* 选择框样式 */
	.select-control {
		width: 100%;
		max-width: 180px;
	}

	/* 期号选择框 */
	.period-select {
		width: auto;
		min-width: 120px;
		max-width: 150px;
	}

	/* 文本居中类 */
	.text-center {
		text-align: center !important;
	}

	.latest-draw {
		margin-bottom: 20px;
		padding: 20px;
		background-color: #fffdf7;
		border-radius: 10px;
		border-left: 4px solid #ffa500;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
	}

	.latest-draw h2 {
		margin-bottom: 15px;
		color: #333;
		font-size: 18px;
	}

	.period-selector {
		display: flex;
		align-items: center;
		flex-wrap: wrap;
		gap: 15px;
		margin-bottom: 15px;
	}

	.period-label {
		font-weight: 600;
		color: #333;
		min-width: 80px;
	}

	.period-tip {
		font-size: 14px;
		color: #666;
	}

	.period-tip.insufficient {
		color: #e74c3c;
		font-weight: 600;
	}

	.numbers {
		display: flex;
		justify-content: center;
		margin: 15px 0;
	}

	.number-ball {
		width: 45px;
		height: 45px;
		background-color: #e74c3c;
		color: white;
		border-radius: 50%;
		display: flex;
		justify-content: center;
		align-items: center;
		margin: 0 8px;
		font-weight: bold;
		font-size: 20px;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
	}

	.analysis-section {
		margin-bottom: 30px;
		padding: 20px;
		background-color: #f9f9f9;
		border-radius: 10px;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
	}

	.position-analysis-section h3 {
		margin-bottom: 10px;
		color: #333;
		border-bottom: 1px solid #ddd;
		padding-bottom: 10px;
		font-size: 18px;
	}

	.position-analysis-section h4 {
		margin: 20px 0 10px;
		color: #333;
		font-size: 16px;
	}

	.position-analysis-section p {
		margin-bottom: 20px;
		color: #666;
		font-size: 14px;
	}

	.position-tabs {
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
		margin-bottom: 20px;
	}

	.position-tab {
		width: 40px;
		height: 40px;
		display: flex;
		align-items: center;
		justify-content: center;
		background-color: #eee;
		border-radius: 5px;
		cursor: pointer;
		font-weight: bold;
		transition: all 0.2s ease;
	}

	.position-tab:hover {
		background-color: #e0e0e0;
	}

	.position-tab.active {
		background-color: #e74c3c;
		color: white;
	}

	.loading {
		text-align: center;
		padding: 20px;
		font-style: italic;
		color: #666;
	}

	.analyze-btn {
		height: 40px;
		min-width: 100px;
		font-weight: 600;
		font-size: 15px;
		border-radius: 6px;
		box-shadow: 0 2px 4px rgba(76, 175, 80, 0.2);
	}

	@media (max-width: 768px) {
		.position-tabs {
			justify-content: center;
		}
	}
</style>

<!-- 使用全局样式覆盖Element Plus组件样式 -->
<style>
	/* 零出现次数的单元格样式 */
	.zero-count-cell {
		background-color: #ff0000 !important;
		color: #ffffff !important;
		font-weight: bold !important;
	}

	/* 统计表格样式 */
	.stats-table-container {
		overflow-x: auto;
		margin-bottom: 20px;
	}

	.stats-table {
		width: 100%;
		border-collapse: collapse;
		table-layout: fixed;
		border: 1px solid #ddd;
	}

	.stats-table th,
	.stats-table td {
		border: 1px solid #ddd;
		text-align: center;
		padding: 8px;
		height: 40px;
	}

	.stats-table th {
		background-color: #f2f2f2;
		font-weight: bold;
	}

	.stats-table tbody tr:nth-child(even) {
		background-color: #f9f9f9;
	}

	/* 简化表格样式，去除所有不必要的样式 */
	.el-table {
		margin-bottom: 15px !important;
	}

	/* 移除滚动条 */
	.el-table__body-wrapper {
		overflow: visible !important;
	}

	/* 防止表格边框重叠 */
	.el-table--border .el-table__inner-wrapper::after {
		display: none;
	}

	/* 表格单元格规范高度 */
	.el-table td.el-table__cell {
		padding: 6px 0;
	}

	/* 设置表格行高度统一 */
	.el-table__row {
		height: auto !important;
	}

	/* 修复单元格内容边距 */
	.el-table .cell {
		line-height: normal;
		padding: 5px;
	}
</style>
