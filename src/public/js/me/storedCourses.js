var monthSelector = document.getElementById('month-selector');
var yearSelector = document.getElementById('year-selector');
var selectedYear = parseInt(yearSelector.value);
var tableBody = document.getElementById('activity-table-body');
var totalAmountDisplay = document.getElementById('total-amount-display');


document.addEventListener('DOMContentLoaded', function() {
    var selectedMonth = parseInt(monthSelector.value);
    var courseId;
    var deleteForm = document.forms['delete-form'];
    var btnDeleteCourse = document.getElementById('btn-delete-course');
    $('#delete-course-modal').parent().on('show.bs.modal', function (event) {
        var button = $(event.relatedTarget);
        courseId = button.data('id');
    });

    btnDeleteCourse.onclick = function() {
        deleteForm.action = '/courses/' + courseId + '?_method=DELETE';
        deleteForm.submit();
    };

    monthSelector.addEventListener('change', updateTable);
    yearSelector.addEventListener('change', updateTable);

    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    monthSelector.value = currentMonth.toString();
    yearSelector.value = currentYear.toString();
    updateTable();

    document.getElementById('exportButton').addEventListener('click', function() {
        const month = new Date().getMonth() + 1; 
        const year = new Date().getFullYear(); 
        const exportApiPath = `/courses/exportActivitiesToExcel?month=${month}&year=${year}`;
        const a = document.createElement("a");
        a.href = exportApiPath;
        a.download = `HoatDong_Thang_${month}_${year}.xlsx`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    });
    
    
});

function saveNewActivity(buttonElement) {
    const rowElement = buttonElement.closest('tr');
    const formData = new FormData();
    rowElement.querySelectorAll('[name]').forEach(input => {
        formData.append(input.name, input.value);
    });

    const newActivity = {
        action: formData.get('action'),
        prices: parseFloat(formData.get('prices').replace(/[^0-9.-]+/g, "")),
        note: formData.get('note'),
        time: formData.get('date')
    };

    fetch('/courses/store', { 
        method: 'POST', 
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(newActivity)
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

function createclick() {
    document.querySelectorAll('.btn-create').forEach(button => {
        button.addEventListener('click', function(event) {
            event.preventDefault(); 
            const dateOfRow = this.getAttribute('data-date');
            const newRow = `
            <tr>
                <td></td>
                <td>
                    <select name="action" class="action">
                        <option value="">--Chọn hành động--</option>
                        <option value="Ăn uống">Ăn uống</option>
                        <option value="Mua sắm">Mua sắm</option>
                        <option value="Nhà ở">Nhà ở</option>
                        <option value="Đi lại">Đi lại</option>
                        <option value="Sức khoẻ">Sức khoẻ</option>
                        <option value="Hoá đơn">Hoá đơn</option>
                        <option value="Khác">Khác</option>
                    </select>
                </td>
                <td><input type="text" name="prices" value=""></td>
                <td><textarea name="note"></textarea></td>
                <td><input type="datetime-local" name="date" value=""></td>
                <td>
                    <input type="button" style="height:30px; width: 50px; border-radius: 3px;" class="btn btn-primary" onclick="saveNewActivity(this)" value="Lưu">
                </td>
            </tr>
             `;  
            const dateRow = document.getElementById(`date-row-${dateOfRow}`);
            dateRow.insertAdjacentHTML('afterend', newRow);
        });
    });
}

function renderGroupedCourses(groupedCourses) {
    const noActivityMessage = document.getElementById('no-activity-message');
    const tableaction = document.getElementById('table-actions');
    const statisticsContainer = document.getElementById('statistics-container');
    const paging = document.getElementById('paging');
    tableBody.innerHTML = '';
    noActivityMessage.style.display = 'none';
    
    if (Object.keys(groupedCourses).length === 0) {
        noActivityMessage.style.display = 'block';
        tableaction.style.display = 'none';
        statisticsContainer.style.display ='none';
        paging.style.display ='none';
    }
    else {
        noActivityMessage.style.display = 'none';
        tableaction.style.display = ''; 
        statisticsContainer.style.display = ''; 
        paging.style.display = '';
    }

    for (const [date, courses] of Object.entries(groupedCourses)) {
        let totalAmount = 0;
        courses.forEach(course => {
            totalAmount += course.prices;
        });
        const formattedTotalAmount = totalAmount.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });
        const formattedDate = new Date(date).toISOString().split('T')[0];
        const dateRowId = `date-row-${formattedDate}`; 
        const dateRow = `<tr id="${dateRowId}"><td colspan="6" style="text-align: center;"><strong>Ngày ${new Date(date).toLocaleString('vi-VN', {
            timeZone: 'Asia/Ho_Chi_Minh',
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        })} - Tổng cộng: ${formattedTotalAmount}</strong>-<a href="#" class="btn-create" data-date="${formattedDate}">Thêm hoạt động</a></td></tr>`;
        tableBody.innerHTML += dateRow;
        courses.forEach(course => {
            const formattedDateTime = convertUTCDateToLocalDate(course.createdAt);
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
            createclick();
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
                        prices: parseFloat(pricesElement.value.replace(/[^0-9]+/g, "")),
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

function convertUTCDateToLocalDate(utcDateString) {

    const dateUTC = new Date(utcDateString);
    if (isNaN(dateUTC)) {
        throw new Error('Invalid date string: ' + utcDateString);
    }
    const localDate = new Date(dateUTC.getTime() + (7 * 60 * 60 * 1000)); 
    const year = localDate.getUTCFullYear();
    const month = (localDate.getUTCMonth() + 1).toString().padStart(2, '0');
    const day = localDate.getUTCDate().toString().padStart(2, '0');
    const hours = localDate.getUTCHours().toString().padStart(2, '0');
    const minutes = localDate.getUTCMinutes().toString().padStart(2, '0');
    
    return `${year}-${month}-${day}T${hours}:${minutes}`;
}

function updateTable(currentPage) {
    if (!currentPage) {
        currentPage = 1;
    }
    const itemsPerPage = 10;
    const selectedMonth = parseInt(monthSelector.value, 10);
    const selectedYear = parseInt(yearSelector.value, 10);
    fetchMonthlyStatistics(selectedMonth, selectedYear);    
    return fetch(`/courses/get-courses?month=${selectedMonth}&year=${selectedYear}&page=${currentPage}&limit=${itemsPerPage}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            totalPages = data.totalPages; 
            currentPage = data.currentPage;
            total = data.total;
            console.log(totalPages);
            if (totalPages > 0) {
                createPagination(totalPages, currentPage);
                document.getElementById('paging').style.display = ''; 
            } else {
                document.getElementById('paging').style.display = 'none'; 
            }
            if (data.groupedCourses) {
                renderGroupedCourses(data.groupedCourses);
                totalAmountDisplay.textContent = `Tổng tiêu trong tháng: ${data.totalAmount.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}`;
            } else {
                console.error('No grouped courses data found');
            }
            return data; 
            
        })
        .catch(error => {
            console.error('Error:', error);
        });
}

function createPagination(totalPages, currentPage) {
    const paginationContainer = document.getElementById('paging');
    paginationContainer.innerHTML = '';
    const ul = document.createElement('ul');
    ul.className = 'pagination';
    const prevLi = document.createElement('li');
    prevLi.className = 'page-item ' + (currentPage === 1 ? 'disabled' : '');
    const prevLink = document.createElement('a');
    prevLink.className = 'page-link';
    prevLink.href = '#';
    prevLink.setAttribute('aria-label', 'Previous');
    prevLink.innerHTML = '<span aria-hidden="true">&laquo;</span><span class="sr-only">Previous</span>';
    if (currentPage > 1) prevLink.onclick = (e) => { e.preventDefault(); changePage(currentPage - 1); };
    prevLi.appendChild(prevLink);
    ul.appendChild(prevLi);

    for (let i = 1; i <= totalPages; i++) {
        const pageLi = document.createElement('li');
        pageLi.className = 'page-item ' + (i === currentPage ? 'active' : '');
        const pageLink = document.createElement('a');
        pageLink.className = 'page-link';
        pageLink.href = '#';
        pageLink.textContent = i;
        pageLink.onclick = (e) => { e.preventDefault(); changePage(i); };
        pageLi.appendChild(pageLink);
        ul.appendChild(pageLi);
    }

    const nextLi = document.createElement('li');
    nextLi.className = 'page-item ' + (currentPage === totalPages ? 'disabled' : '');
    const nextLink = document.createElement('a');
    nextLink.className = 'page-link';
    nextLink.href = '#';
    nextLink.setAttribute('aria-label', 'Next');
    nextLink.innerHTML = '<span aria-hidden="true">&raquo;</span><span class="sr-only">Next</span>';
    if (currentPage < totalPages) nextLink.onclick = (e) => { e.preventDefault(); changePage(currentPage + 1); };
    nextLi.appendChild(nextLink);
    ul.appendChild(nextLi);
    paginationContainer.appendChild(ul);
}

function changePage(pageNumber) {
    if (pageNumber < 1 || pageNumber > totalPages) return;
    updateTable(pageNumber);
}



async function fetchMonthlyStatistics(month, year) {
    try {
        const response = await fetch(`/courses/getmonthlyaction?month=${month}&year=${year}`);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();
        renderStatistics(data);
    } catch (error) {
        console.error('Fetch error:', error);
    }
}


function renderStatistics(data) {
    let statisticsHtml = "<h3>Thống Kê Chi Tiêu</h3>";
   
    statisticsHtml += `<h4>Tháng(${data.currentMonth.month}/${data.currentMonth.year})</h4>`;
    for (const [category, total] of Object.entries(data.currentMonth.summary)) {
        statisticsHtml += `<p>${category}: ${total.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}</p>`;
    }
    statisticsHtml += `<p>Hoạt động chi tiêu cao nhất: ${data.currentMonth.maxExpense.activity} - ${data.currentMonth.maxExpense.amount.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })} - ${formatDateTime(data.currentMonth.maxExpense.time)}</p>`;
    statisticsHtml += `<p>Lĩnh vực chi tiêu cao nhất: ${data.currentMonth.maxCategory.category} - ${data.currentMonth.maxCategory.total.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}</p>`;
    statisticsHtml += `<h4>Tháng trước (${data.previousMonth.month}/${data.previousMonth.year})</h4>`;
    const differenceFormatted = Math.abs(data.difference).toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });
    
    if(data.previousMonth.difference <0)
    {
        statisticsHtml += `<p>So sánh với tháng trước: ít hơn ${differenceFormatted}</p>`;
    }
    else
    {
        statisticsHtml += `<p>So sánh với tháng trước: nhiều hơn ${differenceFormatted}</p>`;
    }

    statisticsHtml += `<button id="detailsButton" type="button" class="btn btn-primary">Xem chi tiết</button>`;

    document.getElementById('statistics-container').innerHTML = statisticsHtml;

    document.getElementById('detailsButton').addEventListener('click', function() {
        showDetailsModal(data);
    });
}

function showDetailsModal(data) {
    let modalContentHtml = `<h4>Chi Tiết So Sánh Tháng ${data.currentMonth.month}/${data.currentMonth.year} và Tháng ${data.previousMonth.month}/${data.previousMonth.year}</h4>`;
    modalContentHtml += `
        <table class="table-month-actions">
            <thead>
                <tr>
                    <td><b>Tiêu chí</b></td>
                    <td><b>Tháng ${data.currentMonth.month}/${data.currentMonth.year}</b></td>
                    <td><b>Tháng ${data.previousMonth.month}/${data.previousMonth.year}</b></td>
                </tr>
            </thead>
            <tbody>`;

    for (const category in data.currentMonth.summary) {
        const currentAmount = data.currentMonth.summary[category].toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });
        const previousAmount = data.previousMonth.summary[category] ? data.previousMonth.summary[category].toLocaleString('vi-VN', { style: 'currency', currency: 'VND' }) : '0 VND';
        modalContentHtml += `
            <tr>
                <td>${category}</td>
                <td>${currentAmount}</td>
                <td>${previousAmount}</td>
            </tr>`;
    }

    modalContentHtml += `
                <tr>
                    <td>Hoạt Động Chi Tiêu Cao Nhất</td>
                    <td>${data.currentMonth.maxExpense.activity} - ${data.currentMonth.maxExpense.amount.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}</td>
                    <td>${data.previousMonth.previousmaxExpense.activity} - ${data.previousMonth.previousmaxExpense.amount.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}</td>
                </tr>
                <tr>
                    <td>Lĩnh Vực Chi Tiêu Cao Nhất</td>
                    <td>${data.currentMonth.maxCategory.category} - ${data.currentMonth.maxCategory.total.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}</td>
                    <td>${data.previousMonth.previousmaxCategory.category} - ${data.previousMonth.previousmaxCategory.total.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}</td>
                </tr>
                <tr>
                    <td>Tổng Chi Tiêu</td>
                    <td>${data.currentMonth.total.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}</td>
                    <td>${data.previousMonth.total.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}</td>
                </tr>
            </tbody>
        </table>`;

    document.getElementById('modalDetailsContent').innerHTML = modalContentHtml;
    var modal = document.getElementById('detailsModal');
    modal.style.display = "block";

    modal.querySelector('.close').addEventListener('click', function() {
        modal.style.display = "none";
    });
}

function formatDateTime(dateTimeStr) {
    const date = new Date(dateTimeStr);
    const day = date.getDate();
    const month = date.getMonth() + 1; 
    const year = date.getFullYear();
    return `Ngày ${day} Tháng ${month} Năm ${year}`;
}

