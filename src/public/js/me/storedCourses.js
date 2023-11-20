document.addEventListener('DOMContentLoaded', function() {
    var courseId;
    var deleteForm = document.forms['delete-form'];
    var btnDeleteCourse = document.getElementById('btn-delete-course');
    var tableBody = document.getElementById('activity-table-body');
    var monthSelector = document.getElementById('month-selector');
    var yearSelector = document.getElementById('year-selector');
    var totalAmountDisplay = document.getElementById('total-amount-display');
    $('#delete-course-modal').on('show.bs.modal', function (event) {
        var button = $(event.relatedTarget);
        courseId = button.data('id');
    });

    btnDeleteCourse.onclick = function() {
        deleteForm.action = '/courses/' + courseId + '?_method=DELETE';
        deleteForm.submit();
    };

    function groupByMonthAndYear(courses, selectedMonth, selectedYear) {
        const groupedCourses = {};
        let monthlyTotal = 0;
        courses.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        courses.forEach(course => {
            const createdAt = new Date(course.createdAt);
            const month = createdAt.getMonth();
            const year = createdAt.getFullYear();

            if (month === selectedMonth && year === selectedYear) {
                monthlyTotal += course.prices;
                const dateKey = createdAt.toLocaleDateString('en-US');
                if (!groupedCourses[dateKey]) {
                    groupedCourses[dateKey] = [];
                }
                groupedCourses[dateKey].push(course);
            }
        });

        // Cập nhật tổng số tiền trên giao diện
        totalAmountDisplay.textContent = `Tổng tiêu trong tháng: ${monthlyTotal.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}`;
        return groupedCourses;
    }

    function renderGroupedCourses(groupedCourses) {
        const noActivityMessage = document.getElementById('no-activity-message');
        tableBody.innerHTML = '';
        noActivityMessage.style.display = 'none';

        if (Object.keys(groupedCourses).length === 0) {
            noActivityMessage.style.display = 'block';
        }

        for (const [date, courses] of Object.entries(groupedCourses)) {
            let totalAmount = 0;
            courses.forEach(course => {
                totalAmount += course.prices;
            });
            const formattedTotalAmount = totalAmount.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });
            const dateRow = `<tr><td colspan="6"><strong>Ngày ${new Date(date).toLocaleString('vi-VN', {
                timeZone: 'Asia/Ho_Chi_Minh',
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
            })} - Tổng cộng: ${formattedTotalAmount}</strong></td></tr>`;
            tableBody.innerHTML += dateRow;

            courses.forEach(course => {
                const formattedPrices = course.prices.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });
                const row = `
                    <tr>
                        <td></td>
                        <td>${course.action}</td>
                        <td>${formattedPrices}</td>
                        <td>${course.note}</td>
                        <td>${new Date(course.createdAt).toLocaleString('en-US', {
                            timeZone: 'Asia/Ho_Chi_Minh',
                            hour: '2-digit',
                            minute: '2-digit',
                            second: '2-digit'
                        })}</td>
                        <td>
                            <a href="/courses/${course._id}/edit" class="btn btn-primary" data-id="${course._id}">Sửa</a>
                            <a href="#" class="btn btn-danger" data-toggle="modal" data-id="${course._id}" data-target="#delete-course-modal">Xoá</a>
                        </td>
                    </tr>
                `;
                tableBody.innerHTML += row;
            });
        }
    }

    function updateTable() {
        const selectedMonth = parseInt(monthSelector.value, 10);
        const selectedYear = parseInt(yearSelector.value, 10);
        fetch('/courses/get-courses')
            .then(response => response.json())
            .then(courses => {
                const groupedCourses = groupByMonthAndYear(courses, selectedMonth, selectedYear);
                renderGroupedCourses(groupedCourses);
            })
            .catch(error => {
                console.error('Error:', error);
            });
    }

    monthSelector.addEventListener('change', updateTable);
    yearSelector.addEventListener('change', updateTable);

    // Khởi tạo mặc định cho tháng và năm hiện tại
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    monthSelector.value = currentMonth.toString();
    yearSelector.value = currentYear.toString();
    updateTable();
});
