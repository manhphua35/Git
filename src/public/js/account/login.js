const user = sessionStorage.getItem("username");
  if(user){
    window.location.href ="/home";
  }
  document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('loginForm').addEventListener('submit', async function(event) {
        event.preventDefault();

        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        sessionStorage.setItem('username', username);

        const formData = new URLSearchParams();
        formData.append('username', username);
        formData.append('password', password);

        fetch('/account/loginto', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: formData.toString(),
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
              const userInfo = data.userInfo;
              const name = userInfo.name;
              sessionStorage.setItem('name', name);
              window.location.href = '/home';
            } else {
                const errorMessageElement = document.getElementById('error-message');
                errorMessageElement.textContent = 'Đăng nhập không thành công. Vui lòng kiểm tra lại tài khoản và mật khẩu.';
                errorMessageElement.style.display = 'block'; 
                console.error('Đăng nhập không thành công.');
            }
        })
        .catch(error => {
            console.error('Lỗi kết nối hoặc lỗi từ server:', error);
        });
    });
});