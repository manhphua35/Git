document.addEventListener('DOMContentLoaded', function() {
    const yearSelector = document.getElementById('year-selector');
    const chartContainer = document.getElementById('chart-container');

    // Sự kiện thay đổi năm từ dropdown
    yearSelector.addEventListener('change', function() {
        const selectedYear = parseInt(this.value);
        fetchChartData(selectedYear);
    });

    // Gửi yêu cầu tới API và xử lý dữ liệu
    function fetchChartData(year) {
        // Giả sử URL này trả về tất cả dữ liệu, không lọc theo năm
        fetch('/courses/get-data')
            .then(response => response.json())
            .then(courses => {
                // Lọc dữ liệu theo năm trước khi nhóm theo tháng
                const filteredCourses = courses.filter(course => 
                new Date(course.createdAt).getFullYear() === year);
                const groupedCourses = groupByTime(filteredCourses);
                renderChart(groupedCourses);
            })
            .catch(error => {
                console.error('Error:', error);
            });
    }

    // Nhóm dữ liệu theo tháng
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

    // Lấy chỉ số tháng từ ngày
    function getMonthIndex(createdAt) {
        const date = new Date(createdAt);
        return date.getMonth() + 1;
    }

    // Vẽ biểu đồ
    function renderChart(groupedByMonth) {
        chartContainer.innerHTML = '';

        Object.entries(groupedByMonth).forEach(([month, courses]) => {
            // Tạo dữ liệu cho biểu đồ
            const activityData = {};
            let totalAmount = 0;

            courses.forEach(course => {
                if (!activityData[course.action]) {
                    activityData[course.action] = 0;
                }
                activityData[course.action] += course.prices;
                totalAmount += course.prices;
            });

            // Chuẩn bị dữ liệu biểu đồ
            const xValues = Object.keys(activityData);
            const yValues = Object.values(activityData);
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
            // Tạo và chèn canvas cho biểu đồ
            const canvas = document.createElement('canvas');
            canvas.id = `myChart-${month}`;
            chartContainer.appendChild(canvas);
            // Tạo biểu đồ
            new Chart(canvas, {
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
                        text: `Biểu đồ chi tiêu tháng ${month} - Tổng: ${totalAmount.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}`
                    }
                }
            });
        });
    }

    const currentYear = new Date().getFullYear();
    yearSelector.value = currentYear.toString();
    fetchChartData(currentYear);
});
