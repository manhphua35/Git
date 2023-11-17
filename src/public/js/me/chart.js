const tableBody = document.getElementById('activity-table-body');
const myCharts = {}; // Sử dụng một đối tượng để lưu trữ các biểu đồ

function getMonthIndex(createdAt) {
    const date = new Date(createdAt);
    return date.getMonth() + 1;
}

function groupByTime(courses) {
    const groupByMonth = {};
    courses.forEach(course => {
        const createdMonth = getMonthIndex(course.createdAt);
        if (!groupByMonth[createdMonth]) {
            groupByMonth[createdMonth] = [];
        }
        groupByMonth[createdMonth].push(course);
    });
    return groupByMonth;
}

function renderChart(groupByMonth) {
    tableBody.innerHTML = ''; // Clear the current content

    Object.entries(groupByMonth).forEach(([month, courses]) => {
        const activityData = {};
        let totalAmount = 0;

        courses.forEach(course => {
            if (!activityData[course.action]) {
                activityData[course.action] = 0;
            }
            activityData[course.action] += course.prices; // Change back to 'prices'
            totalAmount += course.prices; // Change back to 'prices'
        });

        const xValues = Object.keys(activityData);
        const yValues = Object.values(activityData);

        // Calculate percentages and append to labels
        const xValuesWithPercentages = xValues.map((xValue, index) => {
            const percentage = (yValues[index] / totalAmount * 100).toFixed(2);
            return `${xValue} (${percentage}%)`;
        });

        const barColors = [
            "#b91d47",
            "#00aba9",
            "#2b5797",
            "#e8c3b9",
            "#1e7145"
        ];

        const formattedTotalAmount = totalAmount.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });

        // Create and append the date row to the table
        const dateRow = document.createElement('tr');
        const dateCell = document.createElement('td');
        dateCell.colSpan = "6";
        dateCell.innerHTML = `<strong>Tháng ${month} - Tổng chi tiêu: ${formattedTotalAmount}</strong>`;
        dateRow.appendChild(dateCell);
        tableBody.appendChild(dateRow);

        // Create and append the chart container to the table
        const chartContainer = document.createElement('div');
        chartContainer.className = 'chart-container';
        const canvas = document.createElement('canvas');
        canvas.id = `myChart-${month}`;
        chartContainer.appendChild(canvas);
        tableBody.appendChild(chartContainer);

        // Wait for the DOM to update before creating the chart
        requestAnimationFrame(() => {
            myCharts[`myChart-${month}`] = new Chart(canvas, {
                type: "doughnut",
                data: {
                    labels: xValuesWithPercentages,
                    datasets: [{
                        backgroundColor: barColors,
                        data: yValues
                    }]
                },
                options: {
                    title: {
                        display: true,
                        text: `Biểu đồ chi tiêu tháng ${month}`
                    }
                }
            });
        });
    });
}

// Fetch the courses from the database
fetch('/courses/get-courses')
    .then(response => response.json())
    .then(courses => {
        const groupedCourses = groupByTime(courses);
        renderChart(groupedCourses);
    })
    .catch(error => {
        console.error('Error:', error);
    });