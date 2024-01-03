const user = sessionStorage.getItem("username");
  if(user){
    window.location.href ="/home";
  }
  document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('registerForm').addEventListener('submit', async function(event) {
        event.preventDefault();
        const name = document.getElementById('name').value;
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
         const errorMessage = document.getElementById('error-message'); 
        if (password !== confirmPassword) {
            errorMessage.textContent = 'Mật khẩu và xác nhận mật khẩu không khớp. Vui lòng kiểm tra lại.';
            return; 
        } else {
            errorMessage.textContent = ''; 
        }
        const formData = new URLSearchParams();
        formData.append('name',name);
        formData.append('username', username);
        formData.append('password', password);
        fetch('/account/stored', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: formData.toString(),
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                window.location.href = '/account/login';
            } else {
                console.error('Đăng ký không thành công.');
            }
        })
        .catch(error => {
            console.error('Lỗi kết nối hoặc lỗi từ server:', error);
        });
    });
});