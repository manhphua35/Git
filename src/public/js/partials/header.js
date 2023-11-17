  var username = localStorage.getItem('username');
  var userMenu = document.getElementById('userMenu');
  var loginText = document.getElementById('loginText');
  
  if (username) {
    var name = localStorage.getItem('name');
    var userDropdown = document.getElementById('userDropdown');
    var userName = document.getElementById('userName');
    var logout = document.getElementById('logout');
    userName.textContent = name;
    userMenu.style.display = 'block';
    loginText.style.display = 'none';
    logout.onclick = function() {
      fetch('/account/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ logout: true }),
      })
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          localStorage.removeItem('username');
          localStorage.removeItem('name');
          userMenu.style.display = 'none';
          loginText.style.display = 'block';
          window.location.href ='/account/login';
        } else {
          console.error('Đăng xuất không thành công.');
        }
      })
      .catch(error => {
        console.error('Lỗi kết nối hoặc lỗi từ server:', error);
      });
    };
  }else {
    loginText.style.display = 'block';
  }