/**
 * Pure JavaScript Aggregation Service
 * Computes statistical distributions (counts & percentages) for all objective
 * questions (single_choice, multi_choice) formatted directly for Recharts.
 */
export function computeObjectiveStats(consultation, responses) {
    const totalRespondents = responses.length;

    if (totalRespondents === 0) {
        return {
            totalRespondents: 0,
            questionStats: [],
        };
    }

    const questionStats = [];

    for (const question of consultation.questions) {
        const qId = question.questionId;
        const qType = question.type;
        const qText = question.text;

        if (qType === "single_choice" || qType === "multi_choice") {
            // Initialize count for all predefined options
            const optionCounts = {};
            (question.options || []).forEach((opt) => {
                optionCounts[opt] = 0;
            });

            let totalAnswersForQuestion = 0;

            // Tally responses
            for (const resp of responses) {
                const answerObj = resp.answers?.find((a) => a.questionId === qId);
                if (answerObj && answerObj.value !== undefined && answerObj.value !== null) {
                    if (qType === "multi_choice" && Array.isArray(answerObj.value)) {
                        for (const val of answerObj.value) {
                            const trimmedVal = String(val).trim();
                            optionCounts[trimmedVal] = (optionCounts[trimmedVal] || 0) + 1;
                            totalAnswersForQuestion++;
                        }
                    } else {
                        const trimmedVal = String(answerObj.value).trim();
                        optionCounts[trimmedVal] = (optionCounts[trimmedVal] || 0) + 1;
                        totalAnswersForQuestion++;
                    }
                }
            }

            // Format for Recharts (BarChart & PieChart ready)
            const chartData = Object.entries(optionCounts).map(([option, count]) => {
                const percentage =
                    totalRespondents > 0
                        ? parseFloat(((count / totalRespondents) * 100).toFixed(1))
                        : 0;
                return {
                    option,
                    count,
                    percentage,
                };
            });

            questionStats.push({
                questionId: qId,
                questionText: qText,
                type: qType,
                totalAnswers: totalAnswersForQuestion,
                chartData,
            });
        } else if (qType === "text") {
            // Count text comments submitted for this question
            let textResponsesCount = 0;
            for (const resp of responses) {
                const answerObj = resp.answers?.find((a) => a.questionId === qId);
                if (answerObj && typeof answerObj.value === "string" && answerObj.value.trim().length > 0) {
                    textResponsesCount++;
                }
            }

            questionStats.push({
                questionId: qId,
                questionText: qText,
                type: "text",
                textResponsesCount,
                responseRate:
                    totalRespondents > 0
                        ? parseFloat(((textResponsesCount / totalRespondents) * 100).toFixed(1))
                        : 0,
            });
        }
    }

    return {
        totalRespondents,
        questionStats,
    };
}

/**
 * Transforms objective aggregations and LLM correlation analysis into
 * ready-to-render datasets for frontend charting libraries (Recharts, Chart.js, etc.)
 */
export function buildFrontendVisualizations(objectiveStats, analysis) {
    if (!analysis) return null;

    // 1. Overall Sentiment Pie / Donut Chart Data
    const sentimentPieChart = [
        { name: "Positive", value: analysis.overallSentiment?.positive || 0, color: "#10B981" },
        { name: "Neutral", value: analysis.overallSentiment?.neutral || 0, color: "#6B7280" },
        { name: "Negative", value: analysis.overallSentiment?.negative || 0, color: "#EF4444" },
    ];

    // 2. Theme Frequency / Impact Bar Chart Data
    const themeBarChart = (analysis.themeAnalysis || []).map((t) => ({
        theme: t.theme,
        prevalence: t.prevalence || 0,
        sentiment: t.sentiment || "neutral",
        fill:
            t.sentiment === "positive"
                ? "#10B981"
                : t.sentiment === "negative"
                ? "#EF4444"
                : "#F59E0B",
    }));

    // 3. Segment Correlation Stacked Bar Chart Data (Sentiment sliced by selected option)
    const segmentCorrelationChart = (analysis.segmentBreakdown || []).map((seg) => ({
        segment: seg.option,
        questionId: seg.questionId,
        positive: seg.sentiment?.positive || 0,
        neutral: seg.sentiment?.neutral || 0,
        negative: seg.sentiment?.negative || 0,
        summary: seg.summary || "",
    }));

    // 4. Objective MCQs Distribution Charts (Bar & Pie chart ready)
    const objectiveDistributionCharts = (objectiveStats?.questionStats || [])
        .filter((q) => q.type === "single_choice" || q.type === "multi_choice")
        .map((q) => ({
            questionId: q.questionId,
            questionText: q.questionText,
            type: q.type,
            totalAnswers: q.totalAnswers,
            data: q.chartData, // [ { option: "...", count: X, percentage: Y } ]
        }));

    return {
        sentimentPieChart,
        themeBarChart,
        segmentCorrelationChart,
        objectiveDistributionCharts,
    };
}

