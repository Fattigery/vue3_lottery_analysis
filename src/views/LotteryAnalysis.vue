<template>
	<!--
	  彩票数据分析组件
	  功能：
	  1. 支持排列三和福彩3D两种彩票类型的数据分析
	  2. 可选择不同分析期数（7-50期）
	  3. 展示最新开奖号码和历史数据
	  4. 提供百位、十位、个位的号码分析
	  5. 支持定位复式号码分析功能
	  6. 提供各位置号码的频率统计
	  7. 查看历史开奖号码
	-->
	<div class="container">
		<div class="control-panel">
			<div class="control-item">
				<label>彩票类型:</label>
				<el-select
					v-model="caipiaoid"
					placeholder="选择彩票类型"
					class="custom-select"
					popper-class="custom-dropdown"
					align="center"
					:popper-options="{
						modifiers: [
							{
								name: 'offset',
								options: {
									offset: [0, 10],
								},
							},
						],
					}">
					<el-option :value="16" label="排列三" class="text-center"></el-option>
					<el-option :value="12" label="福彩3D" class="text-center"></el-option>
				</el-select>
			</div>
			<div class="control-item">
				<label>分析期数:</label>
				<el-select
					v-model="limit"
					placeholder="选择分析期数"
					class="custom-select"
					popper-class="custom-dropdown"
					align="center"
					:popper-options="{
						modifiers: [
							{
								name: 'offset',
								options: {
									offset: [0, 10],
								},
							},
						],
					}">
					<el-option :value="7" label="往前7期" class="text-center"></el-option>
					<el-option :value="10" label="往前10期" class="text-center"></el-option>
					<el-option :value="14" label="往前14期" class="text-center"></el-option>
					<el-option :value="20" label="往前20期" class="text-center"></el-option>
					<el-option :value="30" label="往前30期" class="text-center"></el-option>
					<el-option :value="40" label="往前40期" class="text-center"></el-option>
					<el-option :value="50" label="往前50期" class="text-center"></el-option>
				</el-select>
			</div>
			<el-button type="primary" @click="fetchAndAnalyze" class="analyze-btn">分析</el-button>
		</div>

		<div class="latest-draw">
			<h2>最新开奖号码</h2>
			<div class="period-selector">
				<div class="period-label">期号: {{ latestDraw.expect || "--" }}</div>
				<el-select
					v-model="selectedDrawPeriod"
					placeholder="选择期号"
					@change="handleDrawPeriodChange"
					class="custom-select period-select"
					popper-class="custom-dropdown"
					align="center"
					:popper-options="{
						modifiers: [
							{
								name: 'offset',
								options: {
									offset: [0, 10],
								},
							},
						],
					}">
					<el-option
						v-for="item in historyData"
						:key="item.expect"
						:label="item.expect"
						:value="item.expect"
						class="text-center">
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
			<div class="history-btn-container">
				<el-button type="primary" @click="showHistoryData" class="history-btn">查看历史开奖号码</el-button>
			</div>
		</div>

		<div class="analysis-section" id="complex-number-section">
			<h3>定位复式号码分析</h3>
			<div class="complex-inputs">
				<div class="input-group">
					<label>百位号码:</label>
					<el-input v-model="complexInputs.hundred" placeholder="如: 123" class="complex-input" />
				</div>
				<div class="input-group">
					<label>十位号码:</label>
					<el-input v-model="complexInputs.ten" placeholder="如: 456" class="complex-input" />
				</div>
				<div class="input-group">
					<label>个位号码:</label>
					<el-input v-model="complexInputs.one" placeholder="如: 789" class="complex-input" />
				</div>
				<div class="input-group btn-container">
					<el-button type="danger" @click="analyzeComplexNumbers" class="complex-btn">分析复式号码</el-button>
				</div>
			</div>
			<div v-html="complexResultHTML"></div>
		</div>

		<!-- 改用Vue模板和Element Plus表格组件显示分析结果 -->
		<div class="analysis-results" v-if="!isAnalysisLoading">
			<div v-for="(position, index) in positionAnalysis" :key="`position-${index}`" class="analysis-section">
				<h3>{{ position.title }}</h3>
				<p>{{ position.description }}</p>

				<!-- 历史匹配表格 -->
				<div class="stats-table-container">
					<table class="stats-table with-row-headers match-table">
						<thead>
							<tr>
								<th>期号</th>
								<th>开奖号码</th>
								<th>下一期号码</th>
							</tr>
						</thead>
						<tbody>
							<tr v-for="(item, idx) in position.matchData" :key="`match-row-${idx}`">
								<td>{{ item.expect }}</td>
								<td>{{ item.opencode }}</td>
								<td>{{ item.nextOpencode }}</td>
							</tr>
						</tbody>
					</table>
				</div>

				<!-- 下一期号码统计表格 -->
				<h3>下一期号码统计 ({{ position.periodRange }})</h3>
				<div class="stats-table-container">
					<table class="stats-table">
						<thead>
							<tr>
								<th v-for="i in 10" :key="`header-${i - 1}`">{{ i - 1 }}</th>
							</tr>
						</thead>
						<tbody>
							<tr>
								<td
									v-for="i in 10"
									:key="`cell-${i - 1}`"
									:class="{ 'zero-count-cell': position.digitStatsData[0][`digit${i - 1}`] === 0 }">
									{{ position.digitStatsData[0][`digit${i - 1}`] }}
								</td>
							</tr>
						</tbody>
					</table>
				</div>

				<!-- 位置频率统计表格 -->
				<h3>{{ position.positionName }}号码频率统计 ({{ position.freqPeriodRange }})</h3>
				<div class="stats-table-container">
					<table class="stats-table">
						<thead>
							<tr>
								<th v-for="i in 10" :key="`freq-header-${i - 1}`">{{ i - 1 }}</th>
							</tr>
						</thead>
						<tbody>
							<tr>
								<td
									v-for="i in 10"
									:key="`freq-cell-${i - 1}`"
									:class="{ 'zero-count-cell': position.freqStatsData[0][`digit${i - 1}`] === 0 }">
									{{ position.freqStatsData[0][`digit${i - 1}`] }}
								</td>
							</tr>
						</tbody>
					</table>
				</div>
			</div>

			<!-- 三个位置总和统计 -->
			<div class="analysis-section" v-if="totalStats.length > 0">
				<h3>三个位置总和统计 ({{ totalStatsRange }})</h3>
				<div class="stats-table-container">
					<table class="stats-table">
						<thead>
							<tr>
								<th v-for="i in 10" :key="`total-header-${i - 1}`">{{ i - 1 }}</th>
							</tr>
						</thead>
						<tbody>
							<tr>
								<td
									v-for="i in 10"
									:key="`total-cell-${i - 1}`"
									:class="{ 'zero-count-cell': totalStats[0][`digit${i - 1}`] === 0 }">
									{{ totalStats[0][`digit${i - 1}`] }}
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

		<!-- 号码频率总统计表 -->
		<div class="analysis-section" id="number-frequency-section">
			<h3>号码频率总统计表 ({{ freqTotalPeriodRange }})</h3>
			<div v-if="!isFrequencyLoading">
				<div class="stats-table-container">
					<table class="stats-table with-row-headers">
						<thead>
							<tr>
								<th class="row-header">号码</th>
								<th v-for="i in 10" :key="`freq-total-header-${i - 1}`">{{ i - 1 }}</th>
							</tr>
						</thead>
						<tbody>
							<tr v-for="(row, index) in frequencyStats" :key="`freq-row-${index}`">
								<th class="row-header">{{ row.position }}</th>
								<td
									v-for="i in 10"
									:key="`freq-total-cell-${i - 1}-${index}`"
									:class="{ 'zero-count-cell': row[`digit${i - 1}`] === 0 }">
									{{ row[`digit${i - 1}`] }}
								</td>
							</tr>
						</tbody>
					</table>
				</div>
			</div>
			<div v-else>
				<div class="loading">{{ frequencyLoadingText }}</div>
			</div>
		</div>

		<!-- 历史开奖号码模态窗口 -->
		<el-dialog v-model="historyModalVisible" title="历史开奖号码" width="80%" :before-close="closeHistoryModal">
			<div v-html="historyContentHTML"></div>
		</el-dialog>
	</div>
</template>

<script setup>
	import { ref, onMounted, computed, watch } from "vue";
	import { ElMessage } from "element-plus";

	// ==================== 响应式数据 ====================

	/**
	 * 彩票类型ID
	 * 16: 排列三
	 * 12: 福彩3D
	 */
	const caipiaoid = ref(16); // 默认为排列三

	/**
	 * 分析期数 - 决定分析往前多少期的数据
	 * 可选值: 7, 10, 14, 20, 30, 40, 50
	 */
	const limit = ref(7); // 默认获取7期数据

	/**
	 * 存储所有获取到的历史开奖数据
	 * 数据格式: [{expect: "期号", opencode: "开奖号码(逗号分隔)", ...}, ...]
	 * 注意: 数据是按期号倒序排列的，最新的期号在数组第一位
	 */
	const historyData = ref([]);

	/**
	 * 存储最新50期数据用于频率统计
	 * 与historyData格式相同，但固定只保存最新的50期数据
	 */
	const latestFrequencyData = ref([]);

	/**
	 * 当前选择的期号，用于确定从哪一期开始分析
	 * 默认为null，获取数据后会设置为最新一期
	 */
	const selectedDrawPeriod = ref(null);

	/**
	 * 定位复式号码分析的输入值
	 * 用户可以在百位、十位、个位分别输入多个数字进行组合分析
	 */
	const complexInputs = ref({
		hundred: "", // 百位输入
		ten: "", // 十位输入
		one: "", // 个位输入
	});

	/**
	 * 控制是否在请求数据时多请求一条
	 * true: 多请求一条数据
	 * false: 精确请求指定数量
	 */
	const isPlusOne = ref(false);

	/**
	 * 切换是否多请求一条数据的状态
	 */
	function togglePlusOne() {
		isPlusOne.value = !isPlusOne.value;
	}

	// ==================== Element Plus表格数据 ====================

	/**
	 * 各位置分析数据 (百位、十位、个位)
	 * 包含每个位置的分析结果、匹配数据、统计数据等
	 */
	const positionAnalysis = ref([]);

	/**
	 * 三个位置总和统计
	 * 将百位、十位、个位的数字出现次数汇总
	 */
	const totalStats = ref([]);

	/**
	 * 频率统计表格数据
	 * 记录每个位置0-9出现的频率
	 */
	const frequencyStats = ref([]);

	/**
	 * 总和统计的期号范围描述
	 * 例如: "从25095期到25101期"
	 */
	const totalStatsRange = ref("");

	/**
	 * 频率总统计的期号范围描述
	 * 例如: "最新50期: 从25052期到25101期"
	 */
	const freqTotalPeriodRange = ref("");

	// ==================== 加载状态 ====================

	/**
	 * 分析结果的加载状态
	 * true: 正在加载/未加载
	 * false: 加载完成，显示分析结果
	 */
	const isAnalysisLoading = ref(true);

	/**
	 * 频率统计的加载状态
	 * true: 正在加载/未加载
	 * false: 加载完成，显示频率统计
	 */
	const isFrequencyLoading = ref(true);

	/**
	 * 分析加载状态的提示文本
	 * 用于在UI中显示当前加载状态或错误信息
	 */
	const analysisLoadingText = ref('请点击"分析"按钮开始分析');

	/**
	 * 频率统计加载状态的提示文本
	 * 用于在UI中显示当前加载状态或错误信息
	 */
	const frequencyLoadingText = ref('请点击"分析"按钮获取数据');

	// ==================== HTML内容与模态窗口 ====================

	/**
	 * 复式分析结果的HTML内容
	 * 直接通过v-html渲染到页面上
	 */
	const complexResultHTML = ref('<div class="loading">请输入复式号码并点击分析按钮</div>');

	/**
	 * 历史数据模态窗口的HTML内容
	 * 包含历史开奖号码表格
	 */
	const historyContentHTML = ref("");

	/**
	 * 历史数据模态窗口的显示状态
	 * true: 显示
	 * false: 隐藏
	 */
	const historyModalVisible = ref(false);

	// ==================== 计算属性 ====================

	/**
	 * 获取最新一期开奖数据
	 * 如果没有数据，则返回期号为"--"的空对象
	 * @returns {Object} 最新一期开奖数据
	 */
	const latestDraw = computed(() => {
		return historyData.value.length > 0 ? historyData.value[0] : { expect: "--" };
	});

	/**
	 * 获取当前选择期号的开奖号码数组
	 * 如果未选择期号或没有数据，则返回["-", "-", "-"]
	 * @returns {Array<string>} 开奖号码数组，例如["1", "2", "3"]
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
	 * @returns {string} 提示文本
	 */
	const remainCountTip = computed(() => {
		if (!selectedDrawPeriod.value || historyData.value.length === 0) return "";

		const idx = historyData.value.findIndex((item) => item.expect === selectedDrawPeriod.value);
		if (idx < 0) return "";

		// 分析的数据是从选中期号之前开始的数据
		const dataCount = historyData.value.length - idx - 1;
		// 实际参与分析的数据数量取决于分析期数，确保不超过可用数据量
		const participatingData = Math.min(dataCount, limit.value);
		const isInsufficient = participatingData < limit.value;

		return `有 ${participatingData} 条数据参与分析${isInsufficient ? "（不足）" : ""}`;
	});

	/**
	 * 判断所选期号前的数据是否不足
	 * 用于控制提示文本的样式
	 * @returns {boolean} 数据是否不足
	 */
	const isDataInsufficient = computed(() => {
		if (!selectedDrawPeriod.value || historyData.value.length === 0) return false;

		const idx = historyData.value.findIndex((item) => item.expect === selectedDrawPeriod.value);
		if (idx < 0) return false;

		// 需要有至少limit.value条数据
		return historyData.value.length - idx - 1 < limit.value;
	});

	// ==================== 核心方法 ====================

	/**
	 * 获取彩票历史数据并进行分析
	 * 主要流程:
	 * 1. 计算需要请求的数据量
	 * 2. 从API获取历史开奖数据
	 * 3. 处理数据格式
	 * 4. 更新响应式数据
	 * 5. 根据选择的期号进行分析
	 */
	function fetchAndAnalyze() {
		// 设置加载状态
		isAnalysisLoading.value = true;
		analysisLoadingText.value = "正在获取数据，请稍候...";

		// 计算需要请求的数据量
		// 修改：始终多请求一条数据，确保分析数据与分析期数一致
		let requestLimit = limit.value + 1; // 多请求一条数据

		// 如果已经选择了期号且不是最新一期，计算期号差距
		if (selectedDrawPeriod.value && historyData.value.length > 0) {
			const selectedIndex = historyData.value.findIndex((item) => item.expect === selectedDrawPeriod.value);
			// 如果找到选中的期号，且不是第一期
			if (selectedIndex > 0) {
				// 计算选中期号与最新期号的差距
				const periodDiff = selectedIndex;
				// 需要请求的数据量 = 分析期数 + 期号差距 + 1
				requestLimit = limit.value + periodDiff + 1;
				console.log(`选中期号与最新期相差${periodDiff}期，需要请求${requestLimit}期数据`);
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

						// 立即更新latestFrequencyData，避免位置频率统计显示错误
						if (processedData.length >= 50) {
							latestFrequencyData.value = processedData.slice(0, 50);
						} else {
							latestFrequencyData.value = processedData;
						}

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

						// 获取最新50期数据并更新号码频率统计
						fetchLatestFrequencyData();
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
	 * 当用户选择不同的期号时触发分析
	 * 修改：确保分析逻辑与新需求一致，截至到所选期号的上一期
	 * 并确保数据量与分析期数一致
	 * 同时更新号码频率统计表
	 */
	function handleDrawPeriodChange() {
		// 验证数据有效性
		if (!selectedDrawPeriod.value || historyData.value.length === 0) {
			analyzeDataBySelectedPeriod();
			return;
		}

		// 找到选中期号在历史数据中的索引
		const idx = historyData.value.findIndex((item) => item.expect === selectedDrawPeriod.value);
		if (idx === -1) {
			analyzeDataBySelectedPeriod();
			return;
		}

		// 检查是否有前面的历史数据
		if (idx >= historyData.value.length - 1) {
			isAnalysisLoading.value = true;
			analysisLoadingText.value = "所选期号之前没有历史数据，无法分析";
			return;
		}

		// 检查是否有足够的数据进行分析
		// 现在考虑到额外一条数据的需求，要确保有limit.value + 1条数据
		const availableData = historyData.value.length - idx - 1;

		// 如果数据不足且不是最新一期，则需要重新请求数据
		if (availableData < limit.value && idx > 0) {
			// 数据不足，需要重新获取更多数据
			isAnalysisLoading.value = true;
			analysisLoadingText.value = `所选期号之前的数据不足${limit.value}期，正在获取更多数据...`;
			fetchAndAnalyze(); // 重新获取数据
		} else {
			// 数据足够或者是最新一期，直接分析
			analyzeDataBySelectedPeriod();
		}

		// 无论如何，当期号变化时都要更新频率统计表
		fetchLatestFrequencyData();
	}

	/**
	 * 根据选中的期号分析数据
	 * 主要流程:
	 * 1. 找到选中期号在历史数据中的位置
	 * 2. 确定分析的数据范围（获取该期号之前的指定期数数据）
	 * 3. 获取选中期号的开奖号码
	 * 4. 调用analyzeData进行具体分析
	 * 5. 如果数据不足，自动触发获取更多数据
	 *
	 * 该函数是分析流程的核心枢纽，连接用户的期号选择与实际的数据分析
	 * 修改：分析时截至到所选期号的上一期，所选期号不参与历史数据查找但参与号码统计
	 */
	function analyzeDataBySelectedPeriod() {
		// 验证数据有效性
		if (!selectedDrawPeriod.value || !historyData.value.length) return;

		// 找到选中期号在历史数据中的索引
		const idx = historyData.value.findIndex((item) => item.expect === selectedDrawPeriod.value);
		let selectedNumbers = [];

		if (idx !== -1) {
			// 找到了选中的期号
			// 检查是否有前面的历史数据用于分析
			if (idx >= historyData.value.length - 1) {
				// 如果选中的是最后一期，没有前面的数据可分析
				isAnalysisLoading.value = true;
				analysisLoadingText.value = "所选期号之前没有历史数据，无法分析";
				return;
			}

			// 检查是否有足够的数据进行分析
			const availableData = historyData.value.length - idx - 1;

			// 如果数据不足但仍有数据，使用可用数据进行分析
			if (availableData < limit.value && availableData > 0) {
				// 只在直接调用analyzeDataBySelectedPeriod时显示提示，避免重复提示
				if (!isAnalysisLoading.value) {
					ElMessage.warning(`所选期号之前的数据不足${limit.value}期，将使用可用的${availableData}期数据进行分析`);
				}
			} else if (availableData <= 0) {
				// 如果没有可用数据，则显示提示信息
				isAnalysisLoading.value = true;
				analysisLoadingText.value = "所选期号之前没有数据，请选择其他期号";
				return;
			}

			// 获取当前选中期号的开奖号码
			selectedNumbers = historyData.value[idx].opencode
				? historyData.value[idx].opencode.split(",")
				: historyData.value[idx].number
				? historyData.value[idx].number.split(/\s+/)
				: [];
		} else {
			// 没找到选中的期号，使用最新期号
			selectedNumbers = historyData.value[0].opencode
				? historyData.value[0].opencode.split(",")
				: historyData.value[0].number
				? historyData.value[0].number.split(/\s+/)
				: [];
		}

		// 使用选中的期号及其开奖号码进行分析
		// 传递实际的分析期数，analyzeData会限制使用的数据量
		analyzeData(selectedNumbers, historyData.value, limit.value);
	}

	/**
	 * 分析数据核心函数
	 * 根据选定的开奖号码和历史数据执行以下分析:
	 * 1. 对每个位置(万、千、百、十、个)的数字进行分析
	 * 2. 收集号码在不同期数后出现的频率统计
	 * 3. 计算综合数据统计和趋势
	 * 4. 更新UI显示分析结果
	 *
	 * @param {Array} selectedNumbers - 选中的期号的开奖号码
	 * @param {Array} historyData - 用于分析的历史数据集
	 * @param {number} periodCount - 分析的期数范围
	 */
	function analyzeData(selectedNumbers, historyData, periodCount) {
		// 检查数据有效性
		if (historyData.length < 1 || !selectedNumbers || selectedNumbers.length < 3) {
			isAnalysisLoading.value = true;
			analysisLoadingText.value = "数据不足，无法分析";
			return;
		}

		// 清空现有分析数据
		positionAnalysis.value = [];
		totalStats.value = [];

		// 找到当前选中期号的索引
		const idx = historyData.findIndex((item) => item.expect === selectedDrawPeriod.value);
		if (idx === -1) {
			isAnalysisLoading.value = true;
			analysisLoadingText.value = "未找到所选期号";
			return;
		}

		// 获取用于分析的历史数据（不包含当前选中期号）
		// 修改：截至分析的期号应该是所选期号的上一期，所选期号不参与历史数据的查找
		// 注意：historyData是按期号倒序排列的（最新的在前）
		const dataToAnalyze = historyData.slice(idx + 1);

		// 如果没有足够的历史数据，显示提示
		if (dataToAnalyze.length === 0) {
			isAnalysisLoading.value = true;
			analysisLoadingText.value = "所选期号之前没有历史数据，无法分析";
			return;
		}

		// 确保只使用所需的期数数据（限制为请求的期数）
		const limitedData = dataToAnalyze.length > periodCount ? dataToAnalyze.slice(0, periodCount) : dataToAnalyze;

		// 获取分析数据的第一期和最后一期的期号
		const firstPeriod = limitedData[limitedData.length - 1]?.expect || "--";
		const lastPeriod = limitedData[0]?.expect || "--";
		const periodRange = `从${firstPeriod}期到${lastPeriod}期`;
		totalStatsRange.value = periodRange;

		// 初始化总和统计数组
		const allPositionCounts = Array(10).fill(0);
		const currentNumbers = selectedNumbers.map(Number);

		// 分析每个位置(百位、十位、个位)
		for (let i = 0; i < 3; i++) {
			const positionData = analyzePositionForTable(
				i,
				currentNumbers[i],
				limitedData,
				allPositionCounts,
				selectedNumbers
			);
			positionAnalysis.value.push(positionData);
		}

		// 准备总和统计数据
		const digitRow = {};
		for (let i = 0; i <= 9; i++) {
			digitRow[`digit${i}`] = allPositionCounts[i];
		}
		totalStats.value = [digitRow];

		// 分析完成，更新状态
		isAnalysisLoading.value = false;
	}

	/**
	 * 分析特定位置上的数字在历史数据中的情况
	 * 主要功能:
	 * 1. 查找历史数据中包含指定数字的期数
	 * 2. 统计下一期号码出现的次数
	 * 3. 生成位置频率统计
	 * 4. 整合分析结果
	 *
	 * 注意: 传入的data不包含当前选中的期号，只包含之前的历史数据
	 * 修改: 所选期号不参与历史数据的查找，但其开奖号码要参与统计
	 *
	 * @param {number} position 位置索引(0:百位, 1:十位, 2:个位)
	 * @param {number} digit 要分析的数字(0-9)
	 * @param {Array} data 历史数据数组（不包含当前选中期号）
	 * @param {Array} allPositionCounts 用于累计各数字出现次数的数组
	 * @param {Array} selectedNumbers 当前选中期号的开奖号码（用于统计）
	 * @returns {Object} 包含分析结果的对象
	 */
	function analyzePositionForTable(position, digit, data, allPositionCounts, selectedNumbers) {
		const positionNames = ["百位", "十位", "个位"];
		// 获取分析数据的第一期和最后一期的期号
		const firstPeriod = data[data.length - 1]?.expect || "--";
		const lastPeriod = data[0]?.expect || "--";
		const periodRange = `从${firstPeriod}期到${lastPeriod}期`;

		// 准备表格数据和统计数组
		const matchData = [];
		const nextDigitCounts = Array(10).fill(0);

		// 获取当前选中期号的开奖号码用于统计
		const currentNumbers = selectedNumbers.map(Number);

		// 查找历史数据中包含指定数字的期数
		for (let i = 0; i < data.length; i++) {
			// 当前期数据
			const currentDraw = data[i];

			// 获取当前期号码
			let currentNumbers = [];
			if (currentDraw.opencode) {
				currentNumbers = currentDraw.opencode.split(",");
			} else if (currentDraw.number) {
				currentNumbers = currentDraw.number.split(/\s+/);
			}

			// 如果无法解析号码，跳过此期
			if (currentNumbers.length < 3) {
				continue;
			}

			// 检查当前位置的号码是否等于我们要分析的数字
			if (parseInt(currentNumbers[position]) === digit) {
				// 获取下一期的号码
				let nextDraw, nextNumbers;

				// 判断是否有下一期数据
				if (i > 0) {
					// 下一期是历史数据中的前一项
					nextDraw = data[i - 1];
					nextNumbers = nextDraw.opencode
						? nextDraw.opencode.split(",").map(Number)
						: nextDraw.number
						? nextDraw.number.split(/\s+/).map(Number)
						: [];
				} else {
					// 如果是历史数据中的第一条记录，则下一期是所选期号
					// 重要修改：所选期号不参与历史数据的查找，但其开奖号码参与统计
					nextDraw = { expect: selectedDrawPeriod.value, opencode: selectedNumbers.join(",") };
					nextNumbers = selectedNumbers.map(Number);
				}

				// 添加到表格数据
				matchData.push({
					expect: currentDraw.expect,
					opencode: currentDraw.opencode || currentDraw.number,
					nextOpencode: nextDraw.opencode || nextDraw.number || "待开奖",
				});

				// 统计下一期号码出现次数
				nextNumbers.forEach((nextDigit) => {
					if (!isNaN(nextDigit)) {
						nextDigitCounts[nextDigit]++;
					}
				});
			}
		}

		// 准备数字统计行数据
		const digitStatsRow = {};
		for (let i = 0; i <= 9; i++) {
			digitStatsRow[`digit${i}`] = nextDigitCounts[i];
			if (allPositionCounts) {
				allPositionCounts[i] += nextDigitCounts[i];
			}
		}

		// 获取位置频率统计 - 使用latestFrequencyData.value中的数据
		// 这些数据是从所选期号开始的50期数据
		const positionStats = calculatePositionStats(position, latestFrequencyData.value);

		// 返回完整的分析结果
		return {
			positionName: positionNames[position],
			title: `${positionNames[position]}分析 (当前号码: ${digit})`,
			description: `查找历史数据中包含 ${digit} 的期数，并统计下一期出现的号码：`,
			matchData,
			digitStatsData: [digitStatsRow],
			periodRange,
			freqPeriodRange: positionStats.periodRange,
			freqStatsData: [positionStats.data],
		};
	}

	/**
	 * 计算指定位置的号码频率统计
	 * 使用从所选期号开始的50期数据
	 *
	 * @param {number} position 位置索引(0:百位, 1:十位, 2:个位)
	 * @param {Array} data 用于统计的数据数组
	 * @returns {Object} 包含统计数据和期号范围的对象
	 */
	function calculatePositionStats(position, data) {
		if (!data || data.length === 0) {
			// 返回空对象但确保所有数字属性都已初始化
			const emptyRow = {};
			for (let i = 0; i <= 9; i++) {
				emptyRow[`digit${i}`] = 0;
			}

			return {
				data: emptyRow,
				periodRange: "暂无数据",
			};
		}

		// 获取数据的第一期和最后一期的期号
		const freqFirstPeriod = data[data.length - 1]?.expect || "--";
		const freqLastPeriod = data[0]?.expect || "--";
		const periodRange = `${data.length}期: 从${freqFirstPeriod}期到${freqLastPeriod}期`;

		// 初始化统计数组
		const digitCounts = Array(10).fill(0);

		// 遍历数据，统计指定位置数字出现次数
		data.forEach((item) => {
			// 获取开奖号码
			let numbers = [];
			if (item.opencode) {
				numbers = item.opencode.split(",").map((num) => parseInt(num));
			} else if (item.number) {
				numbers = item.number.split(/\s+/).map((num) => parseInt(num));
			}

			// 如果无法解析号码或号码不足3位，跳过此期
			if (numbers.length < 3) {
				return;
			}

			// 统计指定位置数字出现次数
			if (!isNaN(numbers[position])) {
				digitCounts[numbers[position]]++;
			}
		});

		// 准备数据行
		const digitRow = {};
		for (let i = 0; i <= 9; i++) {
			digitRow[`digit${i}`] = digitCounts[i];
		}

		return {
			data: digitRow,
			periodRange,
		};
	}

	// ==================== 数据获取与更新 ====================

	/**
	 * 获取最新50期数据并更新号码频率统计
	 * 修改：从所选期号往前获取50期数据进行统计
	 * 单独获取频率统计数据，确保使用最新的数据
	 */
	function fetchLatestFrequencyData() {
		isFrequencyLoading.value = true;
		frequencyLoadingText.value = "正在获取频率统计数据，请稍候...";

		// 固定获取50期数据
		const frequencyDataLimit = 50;
		let requestLimit = frequencyDataLimit;
		let page = 1;

		// 如果有选择的期号，则计算与最新期的差距
		if (selectedDrawPeriod.value && historyData.value.length > 0) {
			const selectedIndex = historyData.value.findIndex((item) => item.expect === selectedDrawPeriod.value);
			// 如果找到选中的期号
			if (selectedIndex >= 0) {
				// 计算选中期号与最新期号的差距
				const periodDiff = selectedIndex;

				// 如果差距为0（选择的是最新期），则直接请求最新的50期
				if (periodDiff === 0) {
					requestLimit = frequencyDataLimit;
					page = 1;
				} else {
					// 否则，需要计算页码和请求数量
					// 如果差距是10期，需要请求60期数据(10+50)，确保包含选中期号及之后的50期
					requestLimit = periodDiff + frequencyDataLimit;
					page = 1;
					console.log(
						`选中期号与最新期相差${periodDiff}期，需要请求${requestLimit}期数据，确保包含所选期号及之后的50期`
					);
				}
			}
		}

		// 添加时间戳防止缓存
		const timestamp = new Date().getTime();
		fetch(
			`https://api.hcaiy.com/api/index/historyList?caipiaoid=${caipiaoid.value}&limit=${requestLimit}&page=${page}&_=${timestamp}`
		)
			.then((res) => {
				if (!res.ok) {
					throw new Error(`网络请求失败: ${res.status} ${res.statusText}`);
				}
				return res.json();
			})
			.then((data) => {
				if (data.code === 1 && data.data) {
					let dataArray = [];
					if (data.data.data && Array.isArray(data.data.data)) {
						dataArray = data.data.data;
					} else if (Array.isArray(data.data)) {
						dataArray = data.data;
					}

					if (dataArray.length > 0) {
						const processedData = dataArray.map((item) => {
							const processedItem = { ...item };
							if (!processedItem.opencode && processedItem.number) {
								processedItem.opencode = processedItem.number.replace(/\s+/g, ",");
							}
							if (!processedItem.expect && processedItem.issueno) {
								processedItem.expect = processedItem.issueno;
							}
							return processedItem;
						});

						// 存储频率统计数据
						latestFrequencyData.value = processedData;

						// 如果选中了期号，找出该期号在数据中的位置
						let selectedIdx = 0;
						if (selectedDrawPeriod.value) {
							const idx = processedData.findIndex((item) => item.expect === selectedDrawPeriod.value);
							if (idx >= 0) {
								selectedIdx = idx;
							}
						}

						// 从所选期号开始，获取往后50期数据进行统计
						// 注意：数据是从新到旧排列的，所以需要从选中期号的索引开始取
						let dataToUse;
						if (processedData.length - selectedIdx >= 50) {
							// 如果所选期号后有足够的数据(>=50期)，取50期
							dataToUse = processedData.slice(selectedIdx, selectedIdx + 50);
						} else {
							// 如果所选期号后数据不足50期，就用所有可用的数据
							dataToUse = processedData.slice(selectedIdx);
						}

						// 更新号码频率统计
						updateNumberFrequencyStatsForTable(dataToUse);
					} else {
						isFrequencyLoading.value = true;
						frequencyLoadingText.value = "获取数据失败，无法进行统计";
					}
				} else {
					isFrequencyLoading.value = true;
					frequencyLoadingText.value = "获取数据失败，请重试";
				}
			})
			.catch((error) => {
				isFrequencyLoading.value = true;
				frequencyLoadingText.value = "获取频率统计数据失败，请重试";
				console.error("获取频率统计数据出错:", error);
			});
	}

	/**
	 * 更新号码频率总统计表格数据
	 * 统计每个位置0-9的出现频率以及总和统计
	 *
	 * 修改：使用所选期号为中心的50期数据，而不是固定使用最新50期
	 *
	 * @param {Array} data 要统计的历史数据数组
	 */
	function updateNumberFrequencyStatsForTable(data) {
		// 如果数据不足，显示提示信息
		if (!data || data.length === 0) {
			isFrequencyLoading.value = true;
			frequencyLoadingText.value = "数据不足，无法统计";
			return;
		}

		// 确保使用传入的数据进行统计
		const dataToUse = data;

		// 获取分析数据的第一期和最后一期的期号
		const firstPeriod = dataToUse[dataToUse.length - 1]?.expect || "--";
		const lastPeriod = dataToUse[0]?.expect || "--";
		// 更新标题中显示的期号范围
		freqTotalPeriodRange.value = `${dataToUse.length}期: 从${firstPeriod}期到${lastPeriod}期`;

		// 初始化统计数组，分别统计百位、十位、个位各数字出现次数
		const hundredCounts = Array(10).fill(0);
		const tenCounts = Array(10).fill(0);
		const oneCounts = Array(10).fill(0);
		// 初始化总和统计数组
		const totalCounts = Array(10).fill(0);

		// 遍历历史数据，统计各位置数字出现次数
		dataToUse.forEach((item) => {
			// 获取开奖号码
			let numbers = [];
			if (item.opencode) {
				numbers = item.opencode.split(",").map((num) => parseInt(num));
			} else if (item.number) {
				numbers = item.number.split(/\s+/).map((num) => parseInt(num));
			}

			// 如果无法解析号码或号码不足3位，跳过此期
			if (numbers.length < 3) {
				return;
			}

			// 统计各位置数字出现次数
			if (!isNaN(numbers[0])) {
				hundredCounts[numbers[0]]++;
				totalCounts[numbers[0]]++;
			}
			if (!isNaN(numbers[1])) {
				tenCounts[numbers[1]]++;
				totalCounts[numbers[1]]++;
			}
			if (!isNaN(numbers[2])) {
				oneCounts[numbers[2]]++;
				totalCounts[numbers[2]]++;
			}
		});

		// 准备表格数据
		frequencyStats.value = [
			createFrequencyRow("百位", hundredCounts),
			createFrequencyRow("十位", tenCounts),
			createFrequencyRow("个位", oneCounts),
			createFrequencyRow("合计", totalCounts),
		];

		isFrequencyLoading.value = false;
	}

	/**
	 * 创建频率统计表格的数据行
	 *
	 * @param {string} position 位置名称
	 * @param {Array} counts 该位置各数字出现次数数组
	 * @returns {Object} 包含位置名和各数字出现次数的对象
	 */
	function createFrequencyRow(position, counts) {
		const row = { position };
		for (let i = 0; i <= 9; i++) {
			row[`digit${i}`] = counts[i];
		}
		return row;
	}

	// ==================== 复式分析功能 ====================

	/**
	 * 分析定位复式号码
	 * 通过用户输入的多位置号码组合，分析在历史数据中的中奖情况
	 */
	function analyzeComplexNumbers() {
		// 检查是否有历史数据
		if (historyData.value.length === 0) {
			complexResultHTML.value = '<div class="loading">暂无历史数据，请先点击分析按钮获取数据</div>';
			return;
		}

		// 获取用户输入的复式号码 - 直接处理单个字符
		const hundredNumbers = Array.from(complexInputs.value.hundred)
			.filter((char) => /[0-9]/.test(char))
			.map((num) => parseInt(num));

		const tenNumbers = Array.from(complexInputs.value.ten)
			.filter((char) => /[0-9]/.test(char))
			.map((num) => parseInt(num));

		const oneNumbers = Array.from(complexInputs.value.one)
			.filter((char) => /[0-9]/.test(char))
			.map((num) => parseInt(num));

		// 验证输入
		if (hundredNumbers.length === 0 && tenNumbers.length === 0 && oneNumbers.length === 0) {
			complexResultHTML.value = '<div class="loading">请至少在一个位置输入号码</div>';
			return;
		}

		// 验证输入的数字是否有效（0-9）
		const allNumbers = [...hundredNumbers, ...tenNumbers, ...oneNumbers];
		const invalidNumbers = allNumbers.filter((num) => isNaN(num) || num < 0 || num > 9);
		if (invalidNumbers.length > 0) {
			complexResultHTML.value = `<div class="loading">输入包含无效数字: ${invalidNumbers.join(
				", "
			)}，请输入0-9之间的数字</div>`;
			return;
		}

		// 开始分析
		complexResultHTML.value = '<div class="loading">正在分析中...</div>';

		// 统计中奖次数
		let winCount = 0;
		let totalCount = 0;
		let winDetails = [];

		// 遍历历史数据
		historyData.value.forEach((item) => {
			// 获取开奖号码
			let numbers = [];
			if (item.opencode) {
				numbers = item.opencode.split(",").map((num) => parseInt(num));
			} else if (item.number) {
				numbers = item.number.split(/\s+/).map((num) => parseInt(num));
			}

			// 如果无法解析号码，跳过此期
			if (numbers.length < 3) {
				return;
			}

			totalCount++;

			// 检查是否中奖（定位复式：对应位置的号码匹配即可）
			let isWin = true;

			// 如果百位有输入，检查百位
			if (hundredNumbers.length > 0) {
				if (!hundredNumbers.includes(numbers[0])) {
					isWin = false;
				}
			}

			// 如果十位有输入，检查十位
			if (isWin && tenNumbers.length > 0) {
				if (!tenNumbers.includes(numbers[1])) {
					isWin = false;
				}
			}

			// 如果个位有输入，检查个位
			if (isWin && oneNumbers.length > 0) {
				if (!oneNumbers.includes(numbers[2])) {
					isWin = false;
				}
			}

			// 如果中奖，记录详情
			if (isWin) {
				winCount++;
				winDetails.push({
					expect: item.expect || item.issueno || "--",
					numbers: numbers.join(","),
				});
			}
		});

		// 显示结果
		let resultHTML = `
			<div class="analysis-section">
				<h3>复式号码中奖统计</h3>
				<p>百位号码: ${hundredNumbers.length > 0 ? hundredNumbers.join(",") : "未指定"}</p>
				<p>十位号码: ${tenNumbers.length > 0 ? tenNumbers.join(",") : "未指定"}</p>
				<p>个位号码: ${oneNumbers.length > 0 ? oneNumbers.join(",") : "未指定"}</p>
				<p>总期数: ${totalCount}期</p>
				<p>中奖次数: ${winCount}期</p>
				<p>中奖率: ${((winCount / totalCount) * 100).toFixed(2)}%</p>
			</div>`;

		// 如果有中奖记录，显示详情
		if (winDetails.length > 0) {
			resultHTML += `
				<div class="analysis-section">
					<h3>中奖详情</h3>
					<table>
						<thead>
							<tr>
								<th>期号</th>
								<th>开奖号码</th>
							</tr>
						</thead>
						<tbody>`;

			winDetails.forEach((detail) => {
				resultHTML += `
						<tr>
							<td>${detail.expect}</td>
							<td>${detail.numbers}</td>
						</tr>`;
			});

			resultHTML += `
					</tbody>
				</table>
			</div>`;
		} else {
			resultHTML += `<div class="analysis-section"><p>没有找到中奖记录</p></div>`;
		}

		complexResultHTML.value = resultHTML;
	}

	// ==================== 历史数据展示 ====================

	/**
	 * 显示历史开奖号码数据
	 * 在模态窗口中展示所有历史开奖数据
	 *
	 * 主要功能:
	 * 1. 检查是否有可用的历史数据
	 * 2. 创建HTML表格展示所有期号和对应的开奖号码
	 * 3. 以可视化方式（号码球）展示开奖号码
	 * 4. 显示模态窗口展示所有历史数据
	 *
	 * @param {boolean} showLoading - 是否显示加载提示，默认为true
	 */
	function showHistoryData(showLoading = true) {
		// 如果没有数据，提示用户
		if (historyData.value.length === 0) {
			historyContentHTML.value = '<div class="loading">暂无历史数据，请先点击分析按钮获取数据</div>';
			historyModalVisible.value = true;
			return;
		}

		// 创建表格显示历史数据
		let tableHTML = `
			<div class="history-table-container">
				<h3>历史开奖号码</h3>
				<table class="history-table">
					<thead>
						<tr>
							<th>期号</th>
							<th>开奖号码</th>
						</tr>
					</thead>
					<tbody>`;

		// 添加每一期的数据
		historyData.value.forEach((item) => {
			// 获取开奖号码
			let numbers = [];
			if (item.opencode) {
				numbers = item.opencode.split(",");
			} else if (item.number) {
				numbers = item.number.split(/\s+/);
			}

			// 创建号码球HTML
			let numbersHTML = "";
			numbers.forEach((num) => {
				numbersHTML += `<span class="history-number-ball">${num}</span>`;
			});

			// 添加行
			tableHTML += `
				<tr>
					<td>${item.expect || item.issueno || "--"}</td>
					<td>${numbersHTML}</td>
				</tr>`;
		});

		tableHTML += `
					</tbody>
				</table>
			</div>`;

		// 显示表格
		historyContentHTML.value = tableHTML;

		// 显示模态窗口
		historyModalVisible.value = true;
	}

	/**
	 * 关闭历史数据模态窗口
	 */
	function closeHistoryModal() {
		historyModalVisible.value = false;
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
	* {
		box-sizing: border-box;
		margin: 0;
		padding: 0;
	}

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

	.period-select {
		width: auto;
		min-width: 120px;
		max-width: 150px;
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

	.history-btn-container {
		text-align: center;
		margin-top: 20px;
	}

	.history-btn {
		min-width: 180px;
		height: 40px;
		font-weight: 600;
		border-radius: 6px;
		background-color: #3498db;
		box-shadow: 0 2px 4px rgba(52, 152, 219, 0.2);
	}

	.analysis-results,
	.analysis-section {
		margin-top: 20px;
	}

	.analysis-section {
		margin-bottom: 20px;
		padding: 20px;
		background-color: #f9f9f9;
		border-radius: 10px;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
	}

	.analysis-section h3 {
		margin-bottom: 15px;
		color: #333;
		border-bottom: 1px solid #ddd;
		padding-bottom: 10px;
		font-size: 18px;
	}

	table {
		width: 100%;
		border-collapse: collapse;
		margin-top: 10px;
	}

	th,
	td {
		border: 1px solid #ddd;
		padding: 8px;
		text-align: center;
	}

	th {
		background-color: #f2f2f2;
	}

	tr:nth-child(even) {
		background-color: #f9f9f9;
	}

	.highlight {
		background-color: #ffe6e6;
		font-weight: bold;
	}

	.loading {
		text-align: center;
		padding: 20px;
		font-style: italic;
		color: #666;
	}

	.zero-count-cell {
		background-color: #ff0000 !important;
		color: #ffffff !important;
		font-weight: bold !important;
	}

	/* 为确保样式被正确应用，添加更具体的选择器 */
	td.zero-count-cell,
	.el-table .zero-count-cell {
		background-color: #ff0000 !important;
		color: #ffffff !important;
		font-weight: bold !important;
	}

	/* 兼容旧样式，防止某些地方仍使用旧类名 */
	:deep(.zero-count) {
		background-color: #ff0000 !important;
		color: #ffffff !important;
		font-weight: bold !important;
	}

	td:is(.zero-count) {
		background-color: #ff0000 !important;
		color: #ffffff !important;
	}

	:deep(.number-stats) {
		width: 100%;
		border-collapse: collapse;
		margin-top: 10px;
	}

	:deep(.number-stats th),
	:deep(.number-stats td) {
		border: 1px solid #ddd;
		padding: 8px;
		text-align: center;
		width: 10%;
	}

	:deep(.number-stats th) {
		background-color: #f5f5f5;
	}

	.analyze-btn {
		height: 40px;
		min-width: 100px;
		font-weight: 600;
		font-size: 15px;
		border-radius: 6px;
		box-shadow: 0 2px 4px rgba(76, 175, 80, 0.2);
	}

	.complex-inputs {
		display: flex;
		flex-wrap: wrap;
		gap: 15px;
		margin-bottom: 20px;
	}

	.input-group {
		flex: 1;
		min-width: 180px;
	}

	.input-group label {
		display: block;
		margin-bottom: 8px;
		font-weight: 600;
		color: #333;
	}

	.complex-input {
		width: 100%;
	}

	:deep(.complex-input .el-input__wrapper) {
		border-radius: 6px;
		box-shadow: 0 1px 2px rgba(0, 0, 0, 0.06);
	}

	.btn-container {
		display: flex;
		align-items: flex-end;
		min-width: 180px;
	}

	.complex-btn {
		width: 100%;
		height: 40px;
		font-weight: 600;
		border-radius: 6px;
		box-shadow: 0 2px 4px rgba(231, 76, 60, 0.2);
	}

	/* 选择框样式 */
	.custom-select {
		width: 100%;
		max-width: 180px;
	}

	/* 下拉框样式 */
	.custom-dropdown {
		min-width: 180px;
	}

	/* 文本居中类 */
	.text-center {
		text-align: center !important;
	}

	/* 下拉选项样式 - 仅保留必要的居中样式 */
	:deep(.el-select-dropdown__item) {
		text-align: center;
		display: flex;
		justify-content: center;
		padding: 0 32px 0 20px !important;
	}

	/* 选项内容居中 */
	:deep(.el-select-dropdown__item span) {
		width: 100%;
		/* text-align: center; */
	}

	/* 号码频率统计表格特殊样式 */
	.number-stats {
		width: 100%;
		table-layout: fixed !important;
	}

	.number-stats th,
	.number-stats td {
		width: 10% !important; /* 确保10列等宽 */
		text-align: center;
		padding: 8px 4px;
	}

	/* 第一列可能包含文字，给予更多宽度 */
	.number-stats th:first-child,
	.number-stats td:first-child {
		width: 15% !important;
	}

	/* 其他列均分剩余宽度 */
	.number-stats th:not(:first-child),
	.number-stats td:not(:first-child) {
		width: calc(85% / 9) !important; /* 剩余85%平均分配给9列数字 */
	}

	/* 频率统计表格边框增强 */
	.number-frequency-section .number-stats,
	.number-frequency-section .number-stats th,
	.number-frequency-section .number-stats td {
		border: 1px solid #ddd;
		border-collapse: collapse;
	}

	/* 修复分析表格样式 */
	.analysis-section table {
		width: 100%;
		table-layout: fixed;
		border-collapse: collapse;
		margin: 10px 0;
		border-spacing: 0;
	}

	.analysis-section table th,
	.analysis-section table td {
		padding: 8px;
		text-align: center;
		vertical-align: middle;
		word-break: break-all;
		border: 1px solid #ddd;
		height: 40px;
		line-height: 1.5;
	}

	/* El-Table 表格样式优化 */
	.el-table {
		--el-table-row-height: 40px;
		--el-table-border-color: #ddd;
	}

	.el-table td.el-table__cell {
		padding: 6px 0;
	}

	.el-table .cell {
		padding: 0 4px;
		line-height: 1.5;
	}

	/* 调整表格行高和间距 */
	.el-table__row {
		height: 40px;
	}

	/* 确保表格没有内部间隙 */
	.el-table__body,
	.el-table__header {
		border-collapse: collapse;
		margin: 0;
	}

	/* 添加历史表格样式 - 已移至全局样式
	.history-table-container {
		margin: 10px 0;
	}

	.history-table {
		margin: 10px auto;
		width: 100%;
		max-width: 500px;
	}

	.history-table th:first-child,
	.history-table td:first-child {
		width: 100px;
	}

	/* 调整对话框样式 - 已移至全局样式
	:deep(.el-dialog__header) {
		margin: 0;
		padding: 15px 20px;
		border-bottom: 1px solid #f0f0f0;
	}

	:deep(.el-dialog__body) {
		padding: 20px;
		max-height: 70vh;
		overflow-y: auto;
	}

	:deep(.el-dialog__title) {
		font-size: 18px;
		font-weight: bold;
	}*/

	.period-control {
		display: flex;
		align-items: center;
		gap: 8px;
		width: 100%;
	}

	.plus-one-btn {
		flex-shrink: 0;
		padding: 0 10px;
		height: 40px;
		font-weight: 600;
	}
</style>

<!-- 使用全局样式覆盖Element Plus组件样式 -->
<style>
	/* 下拉选项 */
	.el-select-dropdown__item {
		padding: 0 !important;
		display: flex !important;
		justify-content: center !important;
		align-items: center !important;
		text-align: center !important;
		height: 34px !important;
	}

	/* 选项内容居中 */
	.el-select-dropdown__item span,
	.el-select-dropdown__item div {
		width: 100% !important;
		text-align: center !important;
		display: block !important;
		padding: 0 !important;
	}

	/* 确保popper的容器不影响选项居中 */
	.el-popper.is-customized {
		width: auto !important;
		min-width: 180px !important;
	}

	/* 确保下拉菜单内容居中 */
	.el-select-dropdown {
		text-align: center !important;
	}

	.el-select-dropdown__wrap {
		text-align: center !important;
	}

	/* 让选中项也居中 */
	.el-select-dropdown__item.selected {
		color: var(--el-color-primary) !important;
		font-weight: bold !important;
		text-align: center !important;
	}

	/* 零出现次数的单元格样式 */
	.zero-count-cell {
		background-color: #ff0000 !important;
		color: #ffffff !important;
		font-weight: bold !important;
	}

	/* 为确保样式被正确应用，添加更具体的选择器 */
	td.zero-count-cell,
	.el-table .zero-count-cell {
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
		width: 10%;
		height: 40px;
	}

	.stats-table th {
		background-color: #f2f2f2;
		font-weight: bold;
	}

	.stats-table.with-row-headers th.row-header {
		width: 80px;
		text-align: center;
	}

	.stats-table tbody tr:nth-child(even) {
		background-color: #f9f9f9;
	}

	/* 历史表格样式 */
	.history-table-container {
		margin: 10px 0;
	}

	.history-table {
		margin: 10px auto;
		width: 100%;
		max-width: 400px;
		border-collapse: collapse;
		table-layout: fixed;
	}

	.history-table th,
	.history-table td {
		border: 1px solid #ddd;
		text-align: center;
		padding: 6px;
		height: 36px;
	}

	.history-table th {
		background-color: #f2f2f2;
		font-weight: bold;
	}

	.history-table th:first-child,
	.history-table td:first-child {
		width: 100px;
	}

	.history-table tr:nth-child(even) {
		background-color: #f9f9f9;
	}

	/* 调整对话框样式 */
	.el-dialog__header {
		margin: 0 !important;
		padding: 15px 20px !important;
		border-bottom: 1px solid #f0f0f0 !important;
	}

	.el-dialog__body {
		padding: 15px !important;
		max-height: 65vh !important;
		overflow-y: auto !important;
		-webkit-overflow-scrolling: touch !important;
	}

	.el-dialog__title {
		font-size: 18px !important;
		font-weight: bold !important;
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

	/* 修复普通表格样式 */
	.analysis-section table {
		width: 100%;
		border-collapse: collapse;
		border-spacing: 0;
		margin: 10px 0;
	}

	.analysis-section table td,
	.analysis-section table th {
		border: 1px solid #e0e0e0;
		padding: 8px;
		text-align: center;
	}

	/* 兼容旧样式，防止某些地方仍使用旧类名 */
	.zero-count {
		background-color: #ff0000 !important;
		color: #ffffff !important;
		font-weight: bold !important;
	}

	td.zero-count {
		background-color: #ff0000 !important;
		color: #ffffff !important;
	}

	.el-popper {
		text-align: center !important;
		overflow: hidden !important;
	}

	/* 加强确保下拉选项文本居中 */
	.el-select-dropdown__item * {
		text-align: center !important;
		width: 100% !important;
		margin: 0 auto !important;
	}

	/* 特定针对custom-dropdown的样式 */
	.custom-dropdown .el-select-dropdown__list .el-select-dropdown__item span {
		text-align: center !important;
		display: block !important;
		width: 100% !important;
		padding: 0 !important;
	}

	/* 优化下拉菜单弹出框 */
	.custom-dropdown.el-popper {
		min-width: 120px !important;
		width: fit-content !important;
		padding: 5px 0 !important;
	}

	/* 确保下拉菜单列表正确显示 */
	.el-select-dropdown__list {
		padding: 0 !important;
		margin: 0 !important;
		width: 100% !important;
	}

	/* 对话框位置与大小控制 */
	.el-dialog {
		margin: 0 auto !important;
		position: absolute !important;
		top: 50% !important;
		left: 50% !important;
		transform: translate(-50%, -50%) !important;
		max-width: 600px !important;
		max-height: 80vh !important;
		display: flex !important;
		flex-direction: column !important;
	}

	.el-dialog__wrapper {
		display: flex !important;
		align-items: center !important;
		justify-content: center !important;
		overflow: hidden !important;
	}

	/* 历史对话框中的号码球样式 */
	.history-number-ball {
		display: inline-block;
		width: 30px;
		height: 30px;
		background-color: #e74c3c;
		color: white;
		border-radius: 50%;
		text-align: center;
		line-height: 30px;
		margin: 0 2px;
		font-weight: bold;
		font-size: 14px;
	}
</style>
