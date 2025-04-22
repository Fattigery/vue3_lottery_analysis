/*
caipiaoid:
16 排列三
12 福彩3D
*/

// 初始化变量
let caipiaoid = 16; // 默认为排列三
let limit = 30; // 默认获取30期数据
let historyData = []; // 存储历史数据

// DOM元素
const lotterySelect = document.getElementById("lottery-select");
const periodSelect = document.getElementById("period-select");
const analyzeBtn = document.getElementById("analyze-btn");
const latestPeriod = document.getElementById("latest-period");
const latestNumbers = document.getElementById("latest-numbers");
const analysisResults = document.getElementById("analysis-results");
const showHistoryBtn = document.getElementById("show-history-btn");
const historyModal = document.getElementById("history-modal");
const historyContent = document.getElementById("history-content");
const closeModalBtn = document.querySelector(".close");
const drawPeriodSelect = document.getElementById("draw-period-select"); // 新增期号下拉框
let selectedDrawPeriod = null; // 当前选择的期号
const remainCountTip = document.createElement("div");
remainCountTip.id = "remain-count-tip";
drawPeriodSelect.parentNode.appendChild(remainCountTip);

// 复式号码分析相关元素
const hundredInput = document.getElementById("hundred-input");
const tenInput = document.getElementById("ten-input");
const oneInput = document.getElementById("one-input");
const analyzeComplexBtn = document.getElementById("analyze-complex-btn");
const complexResult = document.getElementById("complex-result");

// 事件监听
lotterySelect.addEventListener("change", function () {
	caipiaoid = parseInt(this.value);
});

periodSelect.addEventListener("change", function () {
	limit = parseInt(this.value);
});

analyzeBtn.addEventListener("click", fetchAndAnalyze);

// 显示历史开奖号码
showHistoryBtn.addEventListener("click", showHistoryData);

// 关闭模态窗口
closeModalBtn.addEventListener("click", function () {
	historyModal.style.display = "none";
});

// 点击模态窗口外部关闭
window.addEventListener("click", function (event) {
	if (event.target === historyModal) {
		historyModal.style.display = "none";
	}
});

// 复式号码分析按钮点击事件
if (analyzeComplexBtn) {
	analyzeComplexBtn.addEventListener("click", analyzeComplexNumbers);
}

// 页面加载时自动获取数据
document.addEventListener("DOMContentLoaded", function () {
	fetchAndAnalyze();
	// 确保号码频率统计始终使用最新的50期数据
	fetchLatestFrequencyData();
});

// 分析复式号码
function analyzeComplexNumbers() {
	// 检查是否有历史数据
	if (historyData.length === 0) {
		complexResult.innerHTML = '<div class="loading">暂无历史数据，请先点击分析按钮获取数据</div>';
		return;
	}

	// 获取用户输入的复式号码 - 直接处理单个字符
	const hundredNumbers = Array.from(hundredInput.value)
		.filter((char) => /[0-9]/.test(char))
		.map((num) => parseInt(num));
	const tenNumbers = Array.from(tenInput.value)
		.filter((char) => /[0-9]/.test(char))
		.map((num) => parseInt(num));
	const oneNumbers = Array.from(oneInput.value)
		.filter((char) => /[0-9]/.test(char))
		.map((num) => parseInt(num));

	// 验证输入
	if (hundredNumbers.length === 0 && tenNumbers.length === 0 && oneNumbers.length === 0) {
		complexResult.innerHTML = '<div class="loading">请至少在一个位置输入号码</div>';
		return;
	}

	// 验证输入的数字是否有效（0-9）
	const allNumbers = [...hundredNumbers, ...tenNumbers, ...oneNumbers];
	const invalidNumbers = allNumbers.filter((num) => isNaN(num) || num < 0 || num > 9);
	if (invalidNumbers.length > 0) {
		complexResult.innerHTML = `<div class="loading">输入包含无效数字: ${invalidNumbers.join(
			", "
		)}，请输入0-9之间的数字</div>`;
		return;
	}

	// 开始分析
	complexResult.innerHTML = '<div class="loading">正在分析中...</div>';

	// 统计中奖次数
	let winCount = 0;
	let totalCount = 0;
	let winDetails = [];

	// 遍历历史数据
	historyData.forEach((item) => {
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
		</div>
	`;

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
					<tbody>
		`;

		winDetails.forEach((detail) => {
			resultHTML += `
						<tr>
							<td>${detail.expect}</td>
							<td>${detail.numbers}</td>
						</tr>
				`;
		});

		resultHTML += `
					</tbody>
				</table>
			</div>
		`;
	} else {
		resultHTML += `<div class="analysis-section"><p>没有找到中奖记录</p></div>`;
	}

	complexResult.innerHTML = resultHTML;
}

// 显示历史开奖号码数据
function showHistoryData() {
	// 如果没有数据，提示用户
	if (historyData.length === 0) {
		historyContent.innerHTML = '<div class="loading">暂无历史数据，请先点击分析按钮获取数据</div>';
		historyModal.style.display = "block";
		return;
	}

	// 创建表格显示历史数据
	let tableHTML = `
		<table>
			<thead>
				<tr>
					<th>期号</th>
					<th>开奖号码</th>
				</tr>
			</thead>
			<tbody>
	`;

	// 添加每一期的数据
	historyData.forEach((item) => {
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
			numbersHTML += `<span class="number-ball" style="display: inline-flex; margin: 2px;">${num}</span>`;
		});

		// 添加行
		tableHTML += `
			<tr>
				<td>${item.expect || item.issueno || "--"}</td>
				<td>${numbersHTML}</td>
			</tr>
		`;
	});

	tableHTML += `
			</tbody>
		</table>
	`;

	// 显示表格
	historyContent.innerHTML = tableHTML;

	// 显示模态窗口
	historyModal.style.display = "block";
}

// 获取历史开奖数据并分析
function fetchAndAnalyze() {
	analysisResults.innerHTML = '<div class="loading">正在获取数据，请稍候...</div>';

	// 计算需要请求的数据量
	let requestLimit = parseInt(periodSelect.value) + 1;

	// 如果已经选择了期号且不是最新一期，计算期号差距
	if (selectedDrawPeriod && historyData.length > 0) {
		const selectedIndex = historyData.findIndex((item) => item.expect === selectedDrawPeriod);
		// 如果找到选中的期号，且不是第一期
		if (selectedIndex > 0) {
			// 计算选中期号与最新期号的差距
			const periodDiff = selectedIndex;
			// 需要请求的数据量 = 分析期数 + 期号差距 + 1(额外缓冲)
			requestLimit = parseInt(periodSelect.value) + periodDiff + 1;
			console.log(`选中期号与最新期相差${periodDiff}期，需要请求${requestLimit}期数据`);
		}
	}

	limit = requestLimit;
	fetch(`https://api.hcaiy.com/api/index/historyList?caipiaoid=${caipiaoid}&limit=${requestLimit}&page=1`)
		.then((res) => res.json())
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
					historyData = processedData;

					// 立即更新latestFrequencyData，避免位置频率统计显示错误
					if (processedData.length >= 50) {
						latestFrequencyData = processedData.slice(0, 50);
						console.log(`已更新latestFrequencyData，使用最新${latestFrequencyData.length}期数据`);
					} else {
						latestFrequencyData = processedData;
						console.log(`已更新latestFrequencyData，使用全部${latestFrequencyData.length}期数据`);
					}

					// 填充期号下拉框
					fillDrawPeriodSelect(historyData);
					// 默认选中最新一期
					if (!selectedDrawPeriod) {
						selectedDrawPeriod = historyData[0].expect;
						drawPeriodSelect.value = selectedDrawPeriod;
					} else {
						// 尝试恢复之前选择的期号
						const existingOption = Array.from(drawPeriodSelect.options).find(
							(option) => option.value === selectedDrawPeriod
						);
						if (existingOption) {
							drawPeriodSelect.value = selectedDrawPeriod;
						} else {
							// 如果之前选择的期号不在新数据中，重置为最新一期
							selectedDrawPeriod = historyData[0].expect;
							drawPeriodSelect.value = selectedDrawPeriod;
						}
					}
					displayLatestDraw(historyData[0]);
					analyzeDataBySelectedPeriod();
					// 获取最新50期数据并更新号码频率统计
					fetchLatestFrequencyData();
				} else {
					analysisResults.innerHTML = '<div class="loading">获取数据失败，请重试</div>';
				}
			} else {
				analysisResults.innerHTML = '<div class="loading">获取数据失败，请重试</div>';
			}
		})
		.catch((error) => {
			analysisResults.innerHTML = '<div class="loading">获取数据失败，请重试</div>';
		});
}
// 填充期号下拉框
function fillDrawPeriodSelect(dataArr) {
	drawPeriodSelect.innerHTML = "";
	dataArr.forEach((item) => {
		const option = document.createElement("option");
		option.value = item.expect;
		option.textContent = item.expect;
		drawPeriodSelect.appendChild(option);
	});
}
// 监听期号选择
if (drawPeriodSelect) {
	drawPeriodSelect.addEventListener("change", function () {
		selectedDrawPeriod = this.value;
		analyzeDataBySelectedPeriod();
		// 同步显示最新开奖号码区域
		const sel = historyData.find((item) => item.expect == selectedDrawPeriod);
		if (sel) displayLatestDraw(sel);
	});
}
// 按所选期号分析
function analyzeDataBySelectedPeriod() {
	if (!selectedDrawPeriod || !historyData.length) return;
	const idx = historyData.findIndex((item) => item.expect == selectedDrawPeriod);
	let periodNum = parseInt(periodSelect.value);
	let analyzeArr = [];
	let selectedNumbers = [];
	if (idx !== -1) {
		// 检查是否有足够的数据进行分析
		const availableData = historyData.length - idx - 1;
		if (availableData < periodNum) {
			// 数据不足，需要重新获取更多数据
			analysisResults.innerHTML = `<div class="loading">所选期号后的数据不足${periodNum}期，正在获取更多数据...</div>`;
			fetchAndAnalyze(); // 重新获取数据
			return;
		}

		analyzeArr = historyData.slice(idx + 1, idx + 1 + periodNum);
		selectedNumbers = historyData[idx].opencode
			? historyData[idx].opencode.split(",")
			: historyData[idx].number
			? historyData[idx].number.split(/\s+/)
			: [];
	} else {
		analyzeArr = historyData.slice(1, 1 + periodNum);
		selectedNumbers = historyData[0].opencode
			? historyData[0].opencode.split(",")
			: historyData[0].number
			? historyData[0].number.split(/\s+/)
			: [];
	}
	// 新增剩余数据提示
	if (typeof idx === "number" && idx >= 0) {
		const remainingData = historyData.length - idx - 1;
		remainCountTip.textContent = `所选期号之后还剩余 ${remainingData} 条数据${
			remainingData < periodNum ? "（不足）" : ""
		}`;
		remainCountTip.style.color = remainingData < periodNum ? "red" : "";
	} else {
		remainCountTip.textContent = "";
		remainCountTip.style.color = "";
	}
	analyzeData(analyzeArr, selectedNumbers);
}

// 显示最新一期开奖号码
function displayLatestDraw(latestData) {
	// 确保latestData存在
	if (!latestData) {
		console.error("无效的开奖数据");
		return;
	}

	// 显示期号
	latestPeriod.textContent = `期号: ${latestData.expect || latestData.issueno || "--"}`;

	// 获取开奖号码 (优先使用opencode，如果没有则使用number)
	let numbers = [];
	if (latestData.opencode) {
		numbers = latestData.opencode.split(",");
	} else if (latestData.number) {
		// 如果是空格分隔的数字，转换为数组
		numbers = latestData.number.split(/\s+/);
	}

	// 更新号码球显示
	latestNumbers.innerHTML = "";
	if (numbers.length > 0) {
		numbers.forEach((num) => {
			latestNumbers.innerHTML += `<div class="number-ball">${num}</div>`;
		});
	} else {
		// 如果没有号码数据，显示占位符
		for (let i = 0; i < 3; i++) {
			latestNumbers.innerHTML += `<div class="number-ball">-</div>`;
		}
	}
}

// 分析数据
function analyzeData(data, selectedNumbers) {
	if (data.length < 1 || !selectedNumbers || selectedNumbers.length < 3) {
		analysisResults.innerHTML = '<div class="loading">数据不足，无法分析</div>';
		return;
	}
	let resultsHTML = "";
	let allPositionCounts = Array(10).fill(0);
	const currentNumbers = selectedNumbers.map(Number);
	for (let i = 0; i < 3; i++) {
		resultsHTML += createPositionAnalysis(i, currentNumbers[i], data, allPositionCounts);
	}
	// 获取分析数据的第一期和最后一期的期号
	const firstPeriod = data[data.length - 1]?.expect || "--";
	const lastPeriod = data[0]?.expect || "--";

	resultsHTML += `
		<div class="analysis-section">
			<h3>三个位置总和统计 (从${firstPeriod}期到${lastPeriod}期)</h3>
			<table class="number-stats">
				<tr>
					<th>0</th><th>1</th><th>2</th><th>3</th><th>4</th><th>5</th><th>6</th><th>7</th><th>8</th><th>9</th>
				</tr>
				<tr>
	`;
	for (let i = 0; i <= 9; i++) {
		resultsHTML += `<td class="${allPositionCounts[i] === 0 ? "zero-count" : ""}">${allPositionCounts[i]}</td>`;
	}
	resultsHTML += `
				</tr>
			</table>
	`;
	analysisResults.innerHTML = resultsHTML;

	// 号码频率统计已由fetchLatestFrequencyData单独处理
}

// 创建位置分析HTML
// 用于存储所有位置的数字出现次数
let allPositionCounts = Array(10).fill(0);

function createPositionAnalysis(position, digit, data, allPositionCounts) {
	const positionNames = ["百位", "十位", "个位"];
	// 获取分析数据的第一期和最后一期的期号
	const firstPeriod = data[data.length - 1]?.expect || "--";
	const lastPeriod = data[0]?.expect || "--";
	let html = `
        <div class="analysis-section">
            <h3>${positionNames[position]}分析 (当前号码: ${digit}) (从${firstPeriod}期到${lastPeriod}期)</h3>
            <p>查找历史数据中包含 ${digit} 的期数，并统计下一期出现的号码：</p>
            <table>
                <tr>
                    <th>期号</th>
                    <th>开奖号码</th>
                    <th>下一期号码</th>
                </tr>
    `;

	// 统计下一期号码出现次数
	const nextDigitCounts = {};

	// 查找历史数据中包含指定数字的期数
	for (let i = 1; i < data.length - 1; i++) {
		// 从第二期开始，确保有下一期数据
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

		// 如果当前号码中包含指定数字
		if (currentNumbers.includes(String(digit))) {
			// 获取下一期的号码
			const nextDraw = data[i - 1]; // 数据是倒序排列的，所以下一期是i-1

			// 获取下一期号码
			let nextNumbers = [];
			if (nextDraw.opencode) {
				nextNumbers = nextDraw.opencode.split(",");
			} else if (nextDraw.number) {
				nextNumbers = nextDraw.number.split(/\s+/);
			}

			// 如果无法解析号码，跳过此期
			if (nextNumbers.length < 3) {
				continue;
			}

			// 添加到表格中
			html += `
                <tr>
                    <td>${currentDraw.expect}</td>
                    <td>${currentDraw.opencode}</td>
                    <td>${nextDraw.opencode}</td>
                </tr>
            `;

			// 统计下一期号码出现次数（不区分位置）
			nextNumbers.forEach((nextDigit) => {
				if (!nextDigitCounts[nextDigit]) {
					nextDigitCounts[nextDigit] = 0;
				}
				nextDigitCounts[nextDigit]++;
			});
		}
	}

	html += `</table>`;

	// 添加统计结果
	html += `<h3>下一期号码统计 (从${firstPeriod}期到${lastPeriod}期)</h3>`;

	// 创建0-9的统计表格
	html += `
        <div>
            <table class="number-stats">
                <tr>
                    <th>0</th><th>1</th><th>2</th><th>3</th><th>4</th><th>5</th><th>6</th><th>7</th><th>8</th><th>9</th>
                </tr>
                <tr>
    `;

	// 添加每个数字的出现次数
	for (let i = 0; i <= 9; i++) {
		const count = nextDigitCounts[i] || 0;
		html += `<td class="${count === 0 ? "zero-count" : ""}">${count}</td>`;
		if (allPositionCounts) {
			allPositionCounts[i] += count;
		}
	}

	html += `
                </tr>
            </table>
        </div>
    `;

	// 添加该位置的号码频率统计
	html += createPositionFrequencyStats(position, data, firstPeriod, lastPeriod);

	// 添加CSS样式
	const style = document.createElement("style");
	style.textContent = `
        .number-stats {
            width: 100%;
            border-collapse: collapse;
            margin-top: 10px;
        }
        .number-stats th, .number-stats td {
            border: 1px solid #ddd;
            padding: 8px;
            text-align: center;
            width: 10%;
        }
        .number-stats th {
            background-color: #f5f5f5;
        }
        .zero-count {
            color: red;
        }
    `;
	if (!document.querySelector("style")) {
		document.head.appendChild(style);
	}

	html += `</table></div>`;
	html += `</div>`;
	return html;
}

// 存储最新50期数据用于频率统计
let latestFrequencyData = [];

// 创建位置频率统计HTML
function createPositionFrequencyStats(position, data, firstPeriod, lastPeriod) {
	const positionNames = ["百位", "十位", "个位"];

	// 初始化统计数组
	const digitCounts = Array(10).fill(0);

	// 检查全局变量latestFrequencyData是否已定义且有数据
	if (typeof latestFrequencyData === "undefined" || !Array.isArray(latestFrequencyData)) {
		console.error("错误: latestFrequencyData未定义或不是数组");
		// 如果全局变量未定义，初始化为空数组
		latestFrequencyData = [];
	}

	// 强制使用最新50期数据，不再使用传入的data参数
	let dataToUse = latestFrequencyData.length > 0 ? latestFrequencyData : [];
	console.log(`位置频率统计使用数据: ${dataToUse.length}期`);

	// 获取最新50期数据的第一期和最后一期的期号
	const freqFirstPeriod = dataToUse.length > 0 ? dataToUse[dataToUse.length - 1]?.expect || "--" : "--";
	const freqLastPeriod = dataToUse.length > 0 ? dataToUse[0]?.expect || "--" : "--";
	console.log(`位置频率统计期号范围: 从${freqFirstPeriod}期到${freqLastPeriod}期`);

	// 遍历数据，统计指定位置数字出现次数
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

		// 统计指定位置数字出现次数
		if (!isNaN(numbers[position])) {
			digitCounts[numbers[position]]++;
		}
	});

	// 生成HTML
	let periodInfo = "";
	if (dataToUse.length > 0) {
		periodInfo = `最新${dataToUse.length}期: 从${freqFirstPeriod}期到${freqLastPeriod}期`;
	} else {
		periodInfo = "暂无数据";
		console.error("错误: 位置频率统计没有可用数据");
		// 尝试重新获取数据
		fetchLatestFrequencyData();
		// 如果没有数据，使用传入的data参数作为备用
		if (data && data.length > 0) {
			console.log("使用传入的数据作为备用数据进行位置频率统计");
			dataToUse = data;
			// 更新期号信息
			const backupFirstPeriod = dataToUse[dataToUse.length - 1]?.expect || "--";
			const backupLastPeriod = dataToUse[0]?.expect || "--";
			periodInfo = `备用数据${dataToUse.length}期: 从${backupFirstPeriod}期到${backupLastPeriod}期`;
		}
	}

	let html = `
		<h3>${positionNames[position]}号码频率统计 (${periodInfo})</h3>
		<table class="number-stats">
			<tr>
				<th>0</th><th>1</th><th>2</th><th>3</th><th>4</th><th>5</th><th>6</th><th>7</th><th>8</th><th>9</th>
			</tr>
			<tr>
	`;

	// 添加各数字出现次数
	for (let i = 0; i <= 9; i++) {
		html += `<td class="${digitCounts[i] === 0 ? "zero-count" : ""}">${digitCounts[i]}</td>`;
	}

	html += `
			</tr>
		</table>
	`;

	return html;
}

// 统计号码出现频率 - 使用传入的数据进行统计（内部函数）
function updateNumberFrequencyStats(data) {
	const numberFrequencyResult = document.getElementById("number-frequency-result");

	// 如果数据不足，显示提示信息
	if (!data || data.length === 0) {
		numberFrequencyResult.innerHTML = '<div class="loading">数据不足，无法统计</div>';
		return;
	}

	// 确保使用最新50期数据
	const dataToUse = data;
	console.log(`号码频率统计使用数据: ${dataToUse.length}期`);
	if (dataToUse.length < 50) {
		console.warn(`警告: 频率统计数据不足50期，实际只有${dataToUse.length}期`);
	}

	// 获取分析数据的第一期和最后一期的期号
	const firstPeriod = dataToUse[dataToUse.length - 1]?.expect || "--";
	const lastPeriod = dataToUse[0]?.expect || "--";
	console.log(`号码频率统计期号范围: 从${firstPeriod}期到${lastPeriod}期`);

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

	// 生成HTML - 显示总体统计信息
	let html = `
			<h3>号码频率总统计表 (最新${dataToUse.length}期: 从${firstPeriod}期到${lastPeriod}期)</h3>
			<table class="number-stats">
				<tr>
					<th>号码</th><th>0</th><th>1</th><th>2</th><th>3</th><th>4</th>
					<th>5</th><th>6</th><th>7</th><th>8</th><th>9</th>
				</tr>
				<tr>
					<th>百位</th>
	`;

	// 添加百位统计数据
	for (let i = 0; i <= 9; i++) {
		html += `<td class="${hundredCounts[i] === 0 ? "zero-count" : ""}">${hundredCounts[i]}</td>`;
	}

	html += `
				</tr>
				<tr>
					<th>十位</th>
	`;

	// 添加十位统计数据
	for (let i = 0; i <= 9; i++) {
		html += `<td class="${tenCounts[i] === 0 ? "zero-count" : ""}">${tenCounts[i]}</td>`;
	}

	html += `
				</tr>
				<tr>
					<th>个位</th>
	`;

	// 添加个位统计数据
	for (let i = 0; i <= 9; i++) {
		html += `<td class="${oneCounts[i] === 0 ? "zero-count" : ""}">${oneCounts[i]}</td>`;
	}

	html += `
				</tr>
				<tr>
					<th>合计</th>
	`;

	// 添加总体统计数据
	for (let i = 0; i <= 9; i++) {
		html += `<td class="${totalCounts[i] === 0 ? "zero-count" : ""}">${totalCounts[i]}</td>`;
	}

	html += `
				</tr>
			</table>
	`;

	// 更新页面
	numberFrequencyResult.innerHTML = html;
}

// 获取最新50期数据并更新号码频率统计
function fetchLatestFrequencyData() {
	const numberFrequencyResult = document.getElementById("number-frequency-result");
	if (!numberFrequencyResult) {
		console.error("错误: 找不到号码频率统计结果元素(#number-frequency-result)");
		return;
	}

	numberFrequencyResult.innerHTML = '<div class="loading">正在获取最新50期数据，请稍候...</div>';

	// 确保latestFrequencyData已初始化
	if (typeof latestFrequencyData === "undefined" || !Array.isArray(latestFrequencyData)) {
		console.warn("初始化latestFrequencyData为空数组");
		latestFrequencyData = [];
	}

	// 如果已有历史数据，先使用它进行初步显示
	if (historyData && historyData.length > 0) {
		console.log("使用已有历史数据进行临时频率统计显示");
		updateNumberFrequencyStats(historyData.slice(0, 50));
	}

	// 固定获取最新50期数据
	const frequencyDataLimit = 50;
	console.log(`正在获取最新${frequencyDataLimit}期数据用于频率统计...`);

	// 添加时间戳防止缓存
	const timestamp = new Date().getTime();
	fetch(
		`https://api.hcaiy.com/api/index/historyList?caipiaoid=${caipiaoid}&limit=${frequencyDataLimit}&page=1&_=${timestamp}`
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
					// 存储最新50期数据到全局变量，供位置频率统计使用
					latestFrequencyData = processedData;
					console.log(`成功获取频率统计数据，共${processedData.length}期`);
					console.log(
						`第一期: ${processedData[processedData.length - 1]?.expect || "--"}，最后一期: ${
							processedData[0]?.expect || "--"
						}`
					);
					// 使用专门的数据更新频率统计
					updateNumberFrequencyStats(processedData);
					// 如果当前正在显示分析结果，重新分析以更新位置频率统计
					if (historyData.length > 0 && selectedDrawPeriod) {
						analyzeDataBySelectedPeriod();
					}
					return processedData; // 返回处理后的数据，方便其他函数使用
				} else {
					console.error("获取频率统计数据失败: 返回的数据数组为空");
					numberFrequencyResult.innerHTML = '<div class="loading">获取数据失败，请重试</div>';
				}
			} else {
				console.error("获取频率统计数据失败: API返回错误", data);
				numberFrequencyResult.innerHTML = '<div class="loading">获取数据失败，请重试</div>';
			}
		})
		.catch((error) => {
			numberFrequencyResult.innerHTML = '<div class="loading">获取数据失败，请重试</div>';
			console.error("获取频率统计数据出错:", error);
		});
}
