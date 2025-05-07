<template>
	<div class="container">
		<div class="control-panel">
			<div class="control-item">
				<label>彩票类型:</label>
				<el-select v-model="caipiaoid" placeholder="选择彩票类型" class="select-control">
					<el-option value="pls" label="排列三"></el-option>
					<el-option value="fcsd" label="福彩3D"></el-option>
				</el-select>
			</div>
			<div class="control-item">
				<label>分析期数:</label>
				<el-select v-model="limit" placeholder="选择分析期数" class="select-control">
					<el-option :value="50" label="50期"></el-option>
					<el-option :value="100" label="100期"></el-option>
					<el-option :value="120" label="120期"></el-option>
				</el-select>
			</div>
		</div>

		<!-- 新增分析期号选择区域 -->
		<div class="latest-draw">
			<h2>当前分析期号</h2>
			<div class="period-selector">
				<div class="period-label">
					期号: <b>{{ latestDraw.expect || "--" }}</b>
				</div>
				<el-select
					v-model="selectedDrawPeriod"
					placeholder="选择期号"
					@change="handleDrawPeriodChange"
					class="period-select"
					:disabled="historyData.length === 0">
					<el-option
						v-for="item in historyData"
						:key="item.expect"
						:label="item.expect"
						:value="item.expect"></el-option>
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
				<p class="selection-note">
					当前分析的百位号码为 <span class="current-digit">{{ selectedHundredDigit }}</span
					>（自动与所选期号同步）
				</p>
				<div class="position-tabs">
					<div
						v-for="num in 10"
						:key="`hundred-${num - 1}`"
						class="position-tab"
						:class="{ active: selectedHundredDigit === num - 1 }">
						{{ num - 1 }}
					</div>
				</div>

				<div class="stats-table-container" v-if="hundredNextStats.length > 0">
					<table class="stats-table">
						<thead>
							<tr>
								<th>期号</th>
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
				<p class="freq-description">
					统计当前百位号码为 {{ selectedHundredDigit }} 时，下一期号码各个位置数字出现的频率
				</p>
				<div class="stats-table-container">
					<table class="stats-table">
						<thead>
							<tr>
								<th>位置</th>
								<th v-for="i in 10" :key="`hundred-header-${i - 1}`">{{ i - 1 }}</th>
							</tr>
						</thead>
						<tbody>
							<tr>
								<td class="position-label">百位</td>
								<td
									v-for="i in 10"
									:key="`hundred-cell-${i - 1}`"
									:class="{
										'zero-count-cell': getPositionNextFrequency(0, selectedHundredDigit, i - 1) === 0,
									}">
									{{ getPositionNextFrequency(0, selectedHundredDigit, i - 1) }}
								</td>
							</tr>
							<tr>
								<td class="position-label">十位</td>
								<td
									v-for="i in 10"
									:key="`hundred-ten-cell-${i - 1}`"
									:class="{
										'zero-count-cell': getAllPositionsNextFrequency(0, selectedHundredDigit, 1, i - 1) === 0,
									}">
									{{ getAllPositionsNextFrequency(0, selectedHundredDigit, 1, i - 1) }}
								</td>
							</tr>
							<tr>
								<td class="position-label">个位</td>
								<td
									v-for="i in 10"
									:key="`hundred-one-cell-${i - 1}`"
									:class="{
										'zero-count-cell': getAllPositionsNextFrequency(0, selectedHundredDigit, 2, i - 1) === 0,
									}">
									{{ getAllPositionsNextFrequency(0, selectedHundredDigit, 2, i - 1) }}
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
				<p class="selection-note">
					当前分析的十位号码为 <span class="current-digit">{{ selectedTenDigit }}</span
					>（自动与所选期号同步）
				</p>
				<div class="position-tabs">
					<div
						v-for="num in 10"
						:key="`ten-${num - 1}`"
						class="position-tab"
						:class="{ active: selectedTenDigit === num - 1 }">
						{{ num - 1 }}
					</div>
				</div>

				<div class="stats-table-container" v-if="tenNextStats.length > 0">
					<table class="stats-table">
						<thead>
							<tr>
								<th>期号</th>
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
				<p class="freq-description">统计当前十位号码为 {{ selectedTenDigit }} 时，下一期号码各个位置数字出现的频率</p>
				<div class="stats-table-container">
					<table class="stats-table">
						<thead>
							<tr>
								<th>位置</th>
								<th v-for="i in 10" :key="`ten-header-${i - 1}`">{{ i - 1 }}</th>
							</tr>
						</thead>
						<tbody>
							<tr>
								<td class="position-label">百位</td>
								<td
									v-for="i in 10"
									:key="`ten-hundred-cell-${i - 1}`"
									:class="{
										'zero-count-cell': getAllPositionsNextFrequency(1, selectedTenDigit, 0, i - 1) === 0,
									}">
									{{ getAllPositionsNextFrequency(1, selectedTenDigit, 0, i - 1) }}
								</td>
							</tr>
							<tr>
								<td class="position-label">十位</td>
								<td
									v-for="i in 10"
									:key="`ten-cell-${i - 1}`"
									:class="{
										'zero-count-cell': getPositionNextFrequency(1, selectedTenDigit, i - 1) === 0,
									}">
									{{ getPositionNextFrequency(1, selectedTenDigit, i - 1) }}
								</td>
							</tr>
							<tr>
								<td class="position-label">个位</td>
								<td
									v-for="i in 10"
									:key="`ten-one-cell-${i - 1}`"
									:class="{
										'zero-count-cell': getAllPositionsNextFrequency(1, selectedTenDigit, 2, i - 1) === 0,
									}">
									{{ getAllPositionsNextFrequency(1, selectedTenDigit, 2, i - 1) }}
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
				<p class="selection-note">
					当前分析的个位号码为 <span class="current-digit">{{ selectedOneDigit }}</span
					>（自动与所选期号同步）
				</p>
				<div class="position-tabs">
					<div
						v-for="num in 10"
						:key="`one-${num - 1}`"
						class="position-tab"
						:class="{ active: selectedOneDigit === num - 1 }">
						{{ num - 1 }}
					</div>
				</div>

				<div class="stats-table-container" v-if="oneNextStats.length > 0">
					<table class="stats-table">
						<thead>
							<tr>
								<th>期号</th>
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
				<p class="freq-description">统计当前个位号码为 {{ selectedOneDigit }} 时，下一期号码各个位置数字出现的频率</p>
				<div class="stats-table-container">
					<table class="stats-table">
						<thead>
							<tr>
								<th>位置</th>
								<th v-for="i in 10" :key="`one-header-${i - 1}`">{{ i - 1 }}</th>
							</tr>
						</thead>
						<tbody>
							<tr>
								<td class="position-label">百位</td>
								<td
									v-for="i in 10"
									:key="`one-hundred-cell-${i - 1}`"
									:class="{
										'zero-count-cell': getAllPositionsNextFrequency(2, selectedOneDigit, 0, i - 1) === 0,
									}">
									{{ getAllPositionsNextFrequency(2, selectedOneDigit, 0, i - 1) }}
								</td>
							</tr>
							<tr>
								<td class="position-label">十位</td>
								<td
									v-for="i in 10"
									:key="`one-ten-cell-${i - 1}`"
									:class="{
										'zero-count-cell': getAllPositionsNextFrequency(2, selectedOneDigit, 1, i - 1) === 0,
									}">
									{{ getAllPositionsNextFrequency(2, selectedOneDigit, 1, i - 1) }}
								</td>
							</tr>
							<tr>
								<td class="position-label">个位</td>
								<td
									v-for="i in 10"
									:key="`one-cell-${i - 1}`"
									:class="{
										'zero-count-cell': getPositionNextFrequency(2, selectedOneDigit, i - 1) === 0,
									}">
									{{ getPositionNextFrequency(2, selectedOneDigit, i - 1) }}
								</td>
							</tr>
						</tbody>
					</table>
				</div>
			</div>

			<!-- 总和统计 -->
			<div class="analysis-section" v-if="!isAnalysisLoading">
				<h3>总和统计 ({{ analysisRange }})</h3>
				<div class="stats-table-container">
					<table class="stats-table">
						<thead>
							<tr>
								<th>位置</th>
								<th v-for="i in 10" :key="`total-header-${i - 1}`">{{ i - 1 }}</th>
							</tr>
						</thead>
						<tbody>
							<tr>
								<td class="position-label">百位</td>
								<td
									v-for="i in 10"
									:key="`total-hundred-cell-${i - 1}`"
									:class="{ 'zero-count-cell': totalNextFrequencyStats.hundred[i - 1] === 0 }">
									{{ totalNextFrequencyStats.hundred[i - 1] }}
								</td>
							</tr>
							<tr>
								<td class="position-label">十位</td>
								<td
									v-for="i in 10"
									:key="`total-ten-cell-${i - 1}`"
									:class="{ 'zero-count-cell': totalNextFrequencyStats.ten[i - 1] === 0 }">
									{{ totalNextFrequencyStats.ten[i - 1] }}
								</td>
							</tr>
							<tr>
								<td class="position-label">个位</td>
								<td
									v-for="i in 10"
									:key="`total-one-cell-${i - 1}`"
									:class="{ 'zero-count-cell': totalNextFrequencyStats.one[i - 1] === 0 }">
									{{ totalNextFrequencyStats.one[i - 1] }}
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
	 * pls: 排列三
	 * fcsd: 福彩3D
	 */
	const caipiaoid = ref("fcsd"); // 默认为福彩3D

	/**
	 * 分析期数 - 默认为120期
	 */
	const limit = ref(100);

	/**
	 * 存储所有获取到的历史开奖数据
	 */
	const historyData = ref([]);

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

	/**
	 * 当前分析期号
	 */
	const selectedDrawPeriod = ref(null);

	// ==================== 计算属性 ====================

	/**
	 * 获取最新一期开奖数据
	 */
	const latestDraw = computed(() => {
		return historyData.value.length > 0 ? historyData.value[0] : { expect: "--" };
	});

	/**
	 * 获取最新一期的开奖号码数组
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
	 * 统计三个分析区频率统计表格的三行之和
	 */
	const totalNextFrequencyStats = computed(() => {
		// 统计百位
		const hundred = Array(10).fill(0);
		for (let i = 0; i < 10; i++) {
			hundred[i] =
				getPositionNextFrequency(0, selectedHundredDigit.value, i) +
				getAllPositionsNextFrequency(1, selectedTenDigit.value, 0, i) +
				getAllPositionsNextFrequency(2, selectedOneDigit.value, 0, i);
		}
		// 统计十位
		const ten = Array(10).fill(0);
		for (let i = 0; i < 10; i++) {
			ten[i] =
				getAllPositionsNextFrequency(0, selectedHundredDigit.value, 1, i) +
				getPositionNextFrequency(1, selectedTenDigit.value, i) +
				getAllPositionsNextFrequency(2, selectedOneDigit.value, 1, i);
		}
		// 统计个位
		const one = Array(10).fill(0);
		for (let i = 0; i < 10; i++) {
			one[i] =
				getAllPositionsNextFrequency(0, selectedHundredDigit.value, 2, i) +
				getAllPositionsNextFrequency(1, selectedTenDigit.value, 2, i) +
				getPositionNextFrequency(2, selectedOneDigit.value, i);
		}
		return { hundred, ten, one };
	});

	/**
	 * 分析期号范围描述和数据条数提示
	 */
	const remainCountTip = computed(() => {
		if (!selectedDrawPeriod.value || historyData.value.length === 0) return "";
		const idx = historyData.value.findIndex((item) => item.expect === selectedDrawPeriod.value);
		if (idx < 0) return "";
		const dataCount = historyData.value.length - idx;
		const participatingData = Math.min(dataCount, limit.value);
		const isInsufficient = participatingData < limit.value;
		return `有 ${participatingData} 条数据参与分析${isInsufficient ? "（不足）" : ""}`;
	});

	/**
	 * 判断数据是否不足
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
	function fetchAndAnalyze(options = {}) {
		isAnalysisLoading.value = true;
		analysisLoadingText.value = "正在获取数据，请稍候...";
		let requestLimit = limit.value;
		if (options.minSize) {
			requestLimit = Math.max(requestLimit, options.minSize);
		}
		let apiUrl = `http://8.152.201.135:5003/api/lottery/${caipiaoid.value}?size=${requestLimit}`;
		fetch(apiUrl)
			.then((res) => {
				if (!res.ok) {
					throw new Error(`网络请求失败: ${res.status} ${res.statusText}`);
				}
				return res.json();
			})
			.then((data) => {
				if (data.code === 200 && data.data) {
					let dataArray = data.data;
					if (dataArray.length > 0) {
						const processedData = dataArray.map((item) => {
							return {
								expect: item.issue,
								opencode: item.openCode,
								date: item.date,
								week: item.week,
							};
						});
						if (options.append && historyData.value.length > 0) {
							// 合并新老数据，去重（以期号为唯一键）
							const map = {};
							[...processedData, ...historyData.value].forEach((item) => {
								map[item.expect] = item;
							});
							historyData.value = Object.values(map).sort((a, b) => b.expect.localeCompare(a.expect));
						} else {
							historyData.value = processedData;
						}
						if (!selectedDrawPeriod.value) {
							selectedDrawPeriod.value = historyData.value[0].expect;
						} else {
							const existingOption = historyData.value.find((item) => item.expect === selectedDrawPeriod.value);
							if (!existingOption) {
								selectedDrawPeriod.value = historyData.value[0].expect;
							}
						}
						analyzeDataBySelectedPeriod();
					} else {
						isAnalysisLoading.value = true;
						analysisLoadingText.value = "获取数据失败，请重试";
					}
				} else {
					isAnalysisLoading.value = true;
					analysisLoadingText.value = "获取数据失败，请重试";
				}
			})
			.catch((error) => {
				isAnalysisLoading.value = true;
				analysisLoadingText.value = "获取数据失败，请重试";
				console.error("Error fetching data:", error);
			});
	}

	/**
	 * 分析数据
	 */
	function analyzeData() {
		// 验证数据有效性
		if (!historyData.value.length) return;

		// 获取要分析的数据（最多limit期）
		const dataToAnalyze = historyData.value.slice(0, limit.value);

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

		// 根据最新开奖号码更新选中的数字
		updateSelectedDigitsFromDrawNumber();

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

		// 创建期号到数据的映射，以便快速查找
		const periodMap = {};
		data.forEach((item) => {
			// 将期号作为键，对应的数据作为值
			periodMap[item.expect] = item;
		});

		// 分析数据
		for (const currentDraw of data) {
			// 计算下一期期号
			const currentPeriod = parseInt(currentDraw.expect);
			const nextPeriod = (currentPeriod + 1).toString();

			// 查找下一期数据
			const nextDraw = periodMap[nextPeriod];

			// 如果找不到下一期数据，跳过此期
			if (!nextDraw) continue;

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
				// 只统计下一期百位的数字
				const nextHundredDigit = nextNumbers[0];
				if (nextHundredDigit >= 0 && nextHundredDigit <= 9) {
					hundredNextStats.value[hundredDigit].nextDigits[nextHundredDigit]++;
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
				// 只统计下一期十位的数字
				const nextTenDigit = nextNumbers[1];
				if (nextTenDigit >= 0 && nextTenDigit <= 9) {
					tenNextStats.value[tenDigit].nextDigits[nextTenDigit]++;
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
				// 只统计下一期个位的数字
				const nextOneDigit = nextNumbers[2];
				if (nextOneDigit >= 0 && nextOneDigit <= 9) {
					oneNextStats.value[oneDigit].nextDigits[nextOneDigit]++;
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
		// 根据位置选择对应的统计数据
		let statsArray = [];
		if (position === 0) {
			statsArray = hundredNextStats.value;
		} else if (position === 1) {
			statsArray = tenNextStats.value;
		} else if (position === 2) {
			statsArray = oneNextStats.value;
		}

		// 只收集当前数字的匹配数据
		let matchData = [];
		if (statsArray[digit] && statsArray[digit].matchData) {
			// 所有匹配数据都标记为中心数字
			matchData = statsArray[digit].matchData.map((item) => ({
				...item,
				matchDigit: digit,
				matchType: "center",
			}));
		}

		// 按期号排序
		return matchData.sort((a, b) => b.expect.localeCompare(a.expect));
	}

	/**
	 * 获取数字及其相邻数字
	 * @param {number} digit 中心数字(0-9)
	 * @returns {Array} 数字及其相邻数字数组
	 */
	// function getRelatedDigits(digit) {
	// 	digit = parseInt(digit);
	// 	// 只返回中心数字本身，不包含相邻数字
	// 	return [digit];
	// }

	/**
	 * 获取指定位置特定数字的下一期号码频率
	 * @param {number} position 位置索引(0:百位, 1:十位, 2:个位)
	 * @param {number} fromDigit 当前位数字(0-9)
	 * @param {number} toDigit 下一期数字(0-9)
	 * @returns {number} 频率数值
	 */
	function getPositionNextFrequency(position, fromDigit, toDigit) {
		// 获取对应位置的统计数据
		let statsArray = [];
		if (position === 0) {
			statsArray = hundredNextStats.value;
		} else if (position === 1) {
			statsArray = tenNextStats.value;
		} else if (position === 2) {
			statsArray = oneNextStats.value;
		}

		// 只返回当前数字的下一期频率
		if (statsArray[fromDigit]) {
			return statsArray[fromDigit].nextDigits[toDigit] || 0;
		}

		return 0;
	}

	/**
	 * 选中号码相关的位置
	 * @param {number} position 位置索引（0=百位，1=十位，2=个位）
	 * @param {number} digit 要选中的数字
	 */
	function selectRelatedDigits(position, digit) {
		// 数字转为整数确保计算正确
		digit = parseInt(digit);

		// 根据位置选择对应的状态变量
		switch (position) {
			case 0: // 百位
				selectedHundredDigit.value = digit;
				break;
			case 1: // 十位
				selectedTenDigit.value = digit;
				break;
			case 2: // 个位
				selectedOneDigit.value = digit;
				break;
		}
	}

	/**
	 * 根据所选期号自动选择分析数字
	 */
	function updateSelectedDigitsFromDrawNumber() {
		// 确保有开奖号码
		if (historyData.value.length === 0 || !selectedDrawPeriod.value) return;
		// 获取所选期号的数据
		const selectedDraw = historyData.value.find((item) => item.expect === selectedDrawPeriod.value);
		if (!selectedDraw) return;
		// 解析所选期号的开奖号码
		let numbers = [];
		if (selectedDraw.opencode) {
			numbers = selectedDraw.opencode.split(",");
		} else if (selectedDraw.number) {
			numbers = selectedDraw.number.split(/\s+/);
		}
		// 如果解析成功，更新选中的百位、十位和个位数字
		if (numbers.length >= 3) {
			selectRelatedDigits(0, parseInt(numbers[0]));
			selectRelatedDigits(1, parseInt(numbers[1]));
			selectRelatedDigits(2, parseInt(numbers[2]));
		}
	}

	/**
	 * 判断是否为中心数字（用于表格显示）
	 * @param {number} position 位置索引(0:百位, 1:十位, 2:个位)
	 * @param {number} digit 数字(0-9)
	 * @returns {boolean} 是否为中心数字
	 */
	// function isCenterDigit(position, digit) {
	// 	if (position === 0) {
	// 		return parseInt(latestNumbers[0]) === digit;
	// 	} else if (position === 1) {
	// 		return parseInt(latestNumbers[1]) === digit;
	// 	} else if (position === 2) {
	// 		return parseInt(latestNumbers[2]) === digit;
	// 	}
	// 	return false;
	// }

	/**
	 * 判断两个数字是否相关
	 * @param {number} selected 选中的数字(0-9)
	 * @param {number} current 当前遍历到的数字(0-9)
	 * @returns {boolean} 是否相关
	 */
	function isRelatedDigit(selected, current) {
		// 只考虑相等的情况，不再处理相邻数字
		return selected === current;
	}

	/**
	 * 切换期号时处理
	 */
	function handleDrawPeriodChange() {
		if (!selectedDrawPeriod.value || historyData.value.length === 0) return;
		const idx = historyData.value.findIndex((item) => item.expect === selectedDrawPeriod.value);
		if (idx === -1) return;
		const availableData = historyData.value.length - idx;
		if (availableData < limit.value) {
			// 需要补充数据
			isAnalysisLoading.value = true;
			analysisLoadingText.value = `所选期号的数据不足${limit.value}期，正在自动补充数据...`;
			fetchAndAnalyze({ append: true, minSize: limit.value + idx });
		} else {
			analyzeDataBySelectedPeriod();
			updateSelectedDigitsFromDrawNumber();
		}
	}

	/**
	 * 按期号分析数据
	 */
	function analyzeDataBySelectedPeriod() {
		if (!selectedDrawPeriod.value || !historyData.value.length) return;
		const idx = historyData.value.findIndex((item) => item.expect === selectedDrawPeriod.value);
		if (idx === -1) return;
		let dataToAnalyze = historyData.value.slice(idx);
		const maxDataCount = Math.min(dataToAnalyze.length, limit.value);
		dataToAnalyze = dataToAnalyze.slice(0, maxDataCount);
		if (dataToAnalyze.length < 2) {
			isAnalysisLoading.value = true;
			analysisLoadingText.value = "数据不足，无法进行分析";
			return;
		}
		const firstPeriod = dataToAnalyze[dataToAnalyze.length - 1]?.expect || "--";
		const lastPeriod = dataToAnalyze[0]?.expect || "--";
		analysisRange.value = `从${firstPeriod}期到${lastPeriod}期`;
		analyzePositionData(dataToAnalyze);
		updateSelectedDigitsFromDrawNumber();
		isAnalysisLoading.value = false;
	}

	/**
	 * 获取指定位置特定数字的下一期不同位置号码频率
	 * @param {number} fromPosition 当前位置索引(0:百位, 1:十位, 2:个位)
	 * @param {number} fromDigit 当前位数字(0-9)
	 * @param {number} toPosition 下一期位置索引(0:百位, 1:十位, 2:个位)
	 * @param {number} toDigit 下一期数字(0-9)
	 * @returns {number} 频率数值
	 */
	function getAllPositionsNextFrequency(fromPosition, fromDigit, toPosition, toDigit) {
		// 获取对应位置的统计数据
		let statsArray = [];
		if (fromPosition === 0) {
			statsArray = hundredNextStats.value;
		} else if (fromPosition === 1) {
			statsArray = tenNextStats.value;
		} else if (fromPosition === 2) {
			statsArray = oneNextStats.value;
		}
		// 如果没有匹配数据，返回 0
		if (!statsArray[fromDigit] || !statsArray[fromDigit].matchData) {
			return 0;
		}
		// 计算下一期特定位置的数字频率
		let count = 0;
		const matchData = statsArray[fromDigit].matchData;
		for (const item of matchData) {
			// 解析下一期号码
			let nextNumbers = [];
			if (item.nextOpencode) {
				nextNumbers = item.nextOpencode.split(",").map((num) => parseInt(num));
			} else if (item.nextNumber) {
				nextNumbers = item.nextNumber.split(/\s+/).map((num) => parseInt(num));
			}
			// 如果解析失败或数字不足，跳过
			if (nextNumbers.length <= toPosition) {
				continue;
			}
			// 检查下一期指定位置的数字是否匹配
			if (nextNumbers[toPosition] === toDigit) {
				count++;
			}
		}
		return count;
	}

	// ==================== 生命周期钩子 ====================

	/**
	 * 组件挂载时自动获取数据并进行分析
	 */
	onMounted(() => {
		fetchAndAnalyze();
		setTimeout(() => {
			updateSelectedDigitsFromDrawNumber();
		}, 1000);
	});

	/**
	 * 监听彩票类型变化
	 */
	watch(caipiaoid, () => {
		// 当彩票类型变化时，重新获取数据并分析
		selectedDrawPeriod.value = null;
		fetchAndAnalyze();
	});

	/**
	 * 监听分析期数变化
	 */
	watch(limit, () => {
		// 当分析期数变化时，重新获取数据并分析
		selectedDrawPeriod.value = null;
		fetchAndAnalyze();
	});

	// 监听所选期号变化，自动同步号码分析下方数字条
	watch(selectedDrawPeriod, () => {
		updateSelectedDigitsFromDrawNumber();
	});
</script>

<style scoped>
	@import url("./style/index.css");
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

	.position-label {
		font-weight: bold;
		background-color: #f2f2f2;
		text-align: center;
	}
</style>
