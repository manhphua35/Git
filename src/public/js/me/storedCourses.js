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
                
                const formattedDateTime = convertUTCDateToLocalDate(course.createdAt);

                console.log(formattedDateTime);
                const dropdown = `
                    <select id="action-${course._id}" name="action" class ="action">
                        <option value="">--Chọn hành động--</option>
                        <option value="Ăn uống" ${course.action === "Ăn uống" ? "selected" : ""}>Ăn uống</option>
                        <option value="Mua sắm" ${course.action === "Mua sắm" ? "selected" : ""}>Mua sắm</option>
                        <option value="Nhà ở" ${course.action === "Nhà ở" ? "selected" : ""}>Nhà ở</option>
                        <option value="Đi lại" ${course.action === "Đi lại" ? "selected" : ""}>Đi lại</option>
                        <option value="Sức khoẻ" ${course.action === "Sức khoẻ" ? "selected" : ""}>Sức khoẻ</option>
                        <option value="Hoá đơn" ${course.action === "Hoá đơn" ? "selected" : ""}>Hoá đơn</option>
                        <option value="Khác" ${course.action === "Khác" ? "selected" : ""}>Khác</option>
                    </select>
                `;
                const formattedPrices = course.prices.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });
                const row = `
                    <tr id = "course-${course._id}">
                        <td></td>
                        <td>${dropdown}</td>
                        <td><input type="text" id="prices" name="prices" value="${formattedPrices}"></td>
                        <td><textarea id="note" name="note">${course.note}</textarea></td>
                        <td><input type="datetime-local" id="date-${course._id}" name="date" value="${formattedDateTime}"></td>
                        <td>
                            <a class="btn btn-primary" data-id="${course._id}">Sửa</a>
                            <a href="#" class="btn btn-danger" data-toggle="modal" data-id="${course._id}" data-target="#delete-course-modal">Xoá</a>
                        </td>
                    </tr>
                `;
                tableBody.innerHTML += row;
                editclick();
            });
        }
    }
    function editclick() {
        document.querySelectorAll('.btn.btn-primary').forEach(button => {
            button.addEventListener('click', function() {
                const courseId = this.getAttribute('data-id');
                const row = document.getElementById('course-' + courseId);
                if (row) {
                    const actionElement = row.querySelector('#action-' + courseId);
                    const pricesElement = row.querySelector('#prices');
                    const noteElement = row.querySelector('#note');
                    const dateElement = row.querySelector('#date-' + courseId);
                    if (actionElement && pricesElement && noteElement && dateElement) {
                        const updatedData = {
                            action: actionElement.value,
                            prices: parseFloat(pricesElement.value.replace(/[^0-9.-]+/g, "")),
                            note: noteElement.value,
                            createdAt: dateElement.value,
                        };
                
                        saveCourse(courseId, updatedData);
                    } else {
                        console.error('One of the elements could not be found');
                    }
                } else {
                    console.error('Row could not be found');
                }
            });
        });
    }
    
    
    function saveCourse(courseId, updatedData) {
        fetch('/courses/' + courseId + '?_method=PUT', { 
            method: 'PUT', 
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(updatedData)
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
               window.location.reload();
            } else {
                console.error('Lỗi khi lưu: ', data.message);
            }
        })
        .catch(error => console.error('Error:', error));
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
    function convertUTCDateToLocalDate(utcDateString) {
        // Tạo một đối tượng Date từ chuỗi UTC
        const dateUTC = new Date(utcDateString);
        
        // Kiểm tra xem dateUTC có phải là ngày hợp lệ không
        if (isNaN(dateUTC)) {
            throw new Error('Invalid date string: ' + utcDateString);
        }
        
        // Thêm 7 giờ để chuyển sang múi giờ của Việt Nam (UTC+7)
        const localDate = new Date(dateUTC.getTime() + (7 * 60 * 60 * 1000)); // Thêm 7 giờ
        
        // Định dạng lại để phù hợp với input datetime-local
        const year = localDate.getUTCFullYear();
        const month = (localDate.getUTCMonth() + 1).toString().padStart(2, '0');
        const day = localDate.getUTCDate().toString().padStart(2, '0');
        const hours = localDate.getUTCHours().toString().padStart(2, '0');
        const minutes = localDate.getUTCMinutes().toString().padStart(2, '0');
        
        return `${year}-${month}-${day}T${hours}:${minutes}`;
    }
    
    // Sử dụng hàm này trong hàm renderGrouped
    
    monthSelector.addEventListener('change', updateTable);
    yearSelector.addEventListener('change', updateTable);

    // Khởi tạo mặc định cho tháng và năm hiện tại
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    monthSelector.value = currentMonth.toString();
    yearSelector.value = currentYear.toString();
    updateTable();
});
