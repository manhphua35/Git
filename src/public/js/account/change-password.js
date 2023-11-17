document.addEventListener('DOMContentLoaded', function () {
  const changePasswordForm = document.getElementById('changePasswordForm');

  changePasswordForm.addEventListener('submit', function (e) {
    e.preventDefault();

    const currentPassword = document.getElementById('currentPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmNewPassword = document.getElementById('confirmNewPassword').value;

    if (newPassword !== confirmNewPassword) {
      alert('Mật khẩu mới và xác nhận mật khẩu không khớp.');
      return;
    }

    const formData = new URLSearchParams();
    formData.append('currentPassword',currentPassword);
    formData.append('newPassword', newPassword);
    formData.append('confirmNewPassword', confirmNewPassword);
    fetch('/account/updatepassword', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData.toString(),
    })
    .then(response => {
      if (!response.ok) {
        return response.json().then(err => Promise.reject(err));
      }
      return response.json();
    })
    .then(data => {
      if (data.success) {
        alert('Mật khẩu đã được thay đổi thành công.');
        window.location.href = '/account/change-password';
      } else {
        alert(data.message);
      }
    })
    .catch((error) => {
      console.error('Error:', error);
      alert('Có lỗi xảy ra: ' + (error.message || 'Không thể thay đổi mật khẩu.'));
    });
  });
});
