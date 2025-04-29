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
				<el-select v-model="limit" placeholder="选择分析期数" class="select-control">
					<el-option :value="50" label="50期"></el-option>
					<el-option :value="100" label="100期"></el-option>
					<el-option :value="120" label="120期"></el-option>
				</el-select>
			</div>
			<el-button type="primary" @click="fetchAndAnalyze" class="analyze-btn">分析</el-button>
		</div>

		<!-- 分析结果展示区域 -->
		<div class="analysis-results" v-if="!isAnalysisLoading">
			<!-- 百位分析 -->
			<div class="analysis-section position-analysis-section">
				<h3>百位号码分析 ({{ analysisRange }})</h3>
				<p>分析百位号码在历史数据中出现的下一期号码规律</p>
				<p class="selection-note">
					当前分析的百位号码为 <span class="current-digit">{{ selectedHundredDigit }}</span
					>，点击下方数字切换分析
				</p>

				<div class="position-tabs">
					<div
						v-for="num in 10"
						:key="`hundred-${num - 1}`"
						class="position-tab"
						:class="{
							active: selectedHundredDigit === num - 1,
						}"
						@click="selectHundredDigit(num - 1)">
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
					>，点击下方数字切换分析
				</p>

				<div class="position-tabs">
					<div
						v-for="num in 10"
						:key="`ten-${num - 1}`"
						class="position-tab"
						:class="{
							active: selectedTenDigit === num - 1,
						}"
						@click="selectTenDigit(num - 1)">
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
					>，点击下方数字切换分析
				</p>

				<div class="position-tabs">
					<div
						v-for="num in 10"
						:key="`one-${num - 1}`"
						class="position-tab"
						:class="{
							active: selectedOneDigit === num - 1,
						}"
						@click="selectOneDigit(num - 1)">
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
	const caipiaoid = ref(12); // 默认为福彩3D

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

		const draw = historyData.value[0]; // 始终使用最新一期

		if (draw.opencode) {
			return draw.opencode.split(",");
		} else if (draw.number) {
			return draw.number.split(/\s+/);
		}

		return ["-", "-", "-"];
	});

	// ==================== 核心方法 ====================

	/**
	 * 获取彩票历史数据并进行分析
	 */
	function fetchAndAnalyze() {
		// 设置加载状态
		isAnalysisLoading.value = true;
		analysisLoadingText.value = "正在获取数据，请稍候...";

		// 直接使用分析期数作为请求的数据量
		const requestLimit = limit.value;

		// 确定API接口URL
		let apiUrl = "";
		if (caipiaoid.value === 16) {
			// 排列三
			apiUrl = `http://8.152.201.135:5003/api/lottery/pls?size=${requestLimit}`;
		} else if (caipiaoid.value === 12) {
			// 福彩3D
			apiUrl = `http://8.152.201.135:5003/api/lottery/fcsd?size=${requestLimit}`;
		}

		// 发起API请求获取历史数据
		fetch(apiUrl)
			.then((res) => {
				if (!res.ok) {
					throw new Error(`网络请求失败: ${res.status} ${res.statusText}`);
				}
				return res.json();
			})
			.then((data) => {
				if (data.code === 200 && data.data) {
					// 处理返回的数据
					let dataArray = data.data;

					if (dataArray.length > 0) {
						// 规范化数据格式
						const processedData = dataArray.map((item) => {
							return {
								expect: item.issue,
								opencode: item.openCode,
								date: item.date,
								week: item.week,
							};
						});

						// 更新历史数据
						historyData.value = processedData;

						// 直接分析最新数据
						analyzeData();
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
	function getRelatedDigits(digit) {
		digit = parseInt(digit);
		// 只返回中心数字本身，不包含相邻数字
		return [digit];
	}

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
	 * 根据最新开奖号码自动选择分析数字
	 */
	function updateSelectedDigitsFromDrawNumber() {
		// 确保有开奖号码
		if (historyData.value.length === 0) return;

		// 获取最新一期数据
		const latestDraw = historyData.value[0];
		if (!latestDraw) return;

		// 解析最新一期的开奖号码
		let numbers = [];
		if (latestDraw.opencode) {
			numbers = latestDraw.opencode.split(",");
		} else if (latestDraw.number) {
			numbers = latestDraw.number.split(/\s+/);
		}

		// 如果解析成功，更新选中的百位、十位和个位数字
		if (numbers.length >= 3) {
			// 更新百位选中的数字
			selectRelatedDigits(0, parseInt(numbers[0]));

			// 更新十位选中的数字
			selectRelatedDigits(1, parseInt(numbers[1]));

			// 更新个位选中的数字
			selectRelatedDigits(2, parseInt(numbers[2]));
		}
	}

	/**
	 * 判断是否为中心数字（用于表格显示）
	 * @param {number} position 位置索引(0:百位, 1:十位, 2:个位)
	 * @param {number} digit 数字(0-9)
	 * @returns {boolean} 是否为中心数字
	 */
	function isCenterDigit(position, digit) {
		if (position === 0) {
			return parseInt(latestNumbers[0]) === digit;
		} else if (position === 1) {
			return parseInt(latestNumbers[1]) === digit;
		} else if (position === 2) {
			return parseInt(latestNumbers[2]) === digit;
		}
		return false;
	}

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
	 * 选择百位数字进行分析
	 * @param {number} digit 要分析的数字(0-9)
	 */
	function selectHundredDigit(digit) {
		selectedHundredDigit.value = digit;
		// 可以在这里添加额外的处理逻辑，例如滚动到相应的结果区域
	}

	/**
	 * 选择十位数字进行分析
	 * @param {number} digit 要分析的数字(0-9)
	 */
	function selectTenDigit(digit) {
		selectedTenDigit.value = digit;
	}

	/**
	 * 选择个位数字进行分析
	 * @param {number} digit 要分析的数字(0-9)
	 */
	function selectOneDigit(digit) {
		selectedOneDigit.value = digit;
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
	});

	/**
	 * 监听彩票类型变化
	 */
	watch(caipiaoid, () => {
		// 当彩票类型变化时，重新获取数据并分析
		fetchAndAnalyze();
	});

	/**
	 * 监听分析期数变化
	 */
	watch(limit, () => {
		// 当分析期数变化时，重新获取数据并分析
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

	.selection-note {
		color: #e74c3c;
		font-size: 14px;
		font-style: italic;
		margin-bottom: 15px;
	}

	.freq-description {
		color: #606266;
		font-size: 13px;
		font-style: italic;
		margin-top: -5px;
		margin-bottom: 10px;
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
		font-weight: bold;
		transition: all 0.2s ease;
		cursor: pointer;
	}

	.position-tab:hover {
		background-color: #ddd;
	}

	.position-tab.active {
		background-color: #e74c3c;
		color: white;
	}

	.position-tab.related {
		background-color: #f39c8f;
		color: white;
	}

	.current-digit {
		color: #e74c3c;
		font-weight: bold;
		font-size: 18px;
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

	.position-label {
		font-weight: bold;
		background-color: #f2f2f2;
		text-align: center;
	}
</style>
