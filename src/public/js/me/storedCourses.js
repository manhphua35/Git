    document.addEventListener('DOMContentLoaded', function(){
    var courseId;
    var containerForm = document.forms['container-form'];
    var deleleForm = document.forms['delete-form'];
    var btnDeletecourse = document.getElementById('btn-delete-course');
    const tableBody = document.getElementById('activity-table-body');
    $('#delete-course-modal').on('show.bs.modal', function (event) {
      var button = $(event.relatedTarget) ;
      courseId = button.data('id') ;
    }); 
    btnDeletecourse.onclick = function(){
        deleleForm.action = '/courses/' + courseId + '?_method=DELETE';
        deleleForm.submit();
    }
    function groupByDate(courses) {
        const groupedCourses = {};
        courses.forEach(course => {
            const createdAt = new Date(course.createdAt).toLocaleDateString('en-US');
            if (!groupedCourses[createdAt]) {
                groupedCourses[createdAt] = [];
            }
            groupedCourses[createdAt].push(course);
        });
        return groupedCourses;
    }
    function renderGroupedCourses(groupedCourses) {
        const noActivityMessage = document.getElementById('no-activity-message');
        tableBody.innerHTML = '';
        noActivityMessage.style.display = 'none';
        // Kiểm tra nếu không có hoạt động nào
        if (Object.keys(groupedCourses).length === 0) {
            noActivityMessage.style.display = 'block';
        }
        tableBody.innerHTML = '';
        for (const [date, courses] of Object.entries(groupedCourses)) {
            let totalAmount = 0;
            courses.forEach(course =>{
              totalAmount += course.prices;
            })
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
                        })} </td>
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
    fetch('/courses/get-courses')
        .then(response => response.json())
        .then(courses => {
            courses.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            const groupedCourses = groupByDate(courses);
            renderGroupedCourses(groupedCourses);
        })
        .catch(error => {
            console.error('Error:', error);
        });
  
   });