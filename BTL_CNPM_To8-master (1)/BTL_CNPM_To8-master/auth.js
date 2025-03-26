// Kiểm tra xem đang ở trang nào
const isLoginPage = window.location.pathname.includes("login.html");
const isRegisterPage = window.location.pathname.includes("register.html");
const isChangePasswordPage = window.location.pathname.includes("change-password.html");

// Lấy danh sách users từ localStorage hoặc tạo mảng rỗng nếu chưa có
let users = JSON.parse(localStorage.getItem("users")) || [];

// Xử lý đăng ký
if (isRegisterPage) {
  const registerForm = document.getElementById("registerForm");
  const errorMessage = document.getElementById("errorMessage");

  registerForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const username = document.getElementById("username").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirmPassword").value;

    // Kiểm tra mật khẩu xác nhận
    if (password !== confirmPassword) {
      errorMessage.textContent = "Passwords do not match!";
      errorMessage.style.display = "block";
      return;
    }

    // Kiểm tra email đã tồn tại chưa
    if (users.some((user) => user.email === email)) {
      errorMessage.textContent = "Email already exists!";
      errorMessage.style.display = "block";
      return;
    }

    // Thêm user mới
    users.push({
      username,
      email,
      password, // Trong thực tế nên mã hóa mật khẩu
    });

    // Lưu vào localStorage
    localStorage.setItem("users", JSON.stringify(users));

    // Chuyển hướng đến trang đăng nhập
    window.location.href = "login.html";
  });
}

// Xử lý đăng nhập
if (isLoginPage) {
  const loginForm = document.getElementById("loginForm");
  const errorMessage = document.getElementById("errorMessage");

  loginForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    // Tìm user
    const user = users.find(
      (u) => u.email === email && u.password === password
    );

    if (user) {
      // Lưu thông tin user đang đăng nhập
      localStorage.setItem(
        "currentUser",
        JSON.stringify({
          username: user.username,
          email: user.email,
        })
      );

      // Chuyển hướng về trang chủ
      window.location.href = "index.html";
    } else {
      errorMessage.textContent = "Invalid email or password!";
      errorMessage.style.display = "block";
    }
  });
}

// Kiểm tra trạng thái đăng nhập trên trang chủ
if (window.location.pathname.includes("index.html")) {
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  const signupLoginAvatar = document.querySelector(".signup-login-avatar");

  if (currentUser) {
    // Nếu đã đăng nhập
    const userInfo = users.find((user) => user.email === currentUser.email);
    signupLoginAvatar.innerHTML = `
            <div>
                <span style="font-family: 'Montserrat', sans-serif; color: #ffffff;">Welcome, ${currentUser.username}</span>
            </div>
            <div class="avatar-container">
                <div class="avatar" style="cursor: pointer" onclick="toggleUserMenu()">
                    <img src="${userInfo.avatar || "img/avatar_user.png"}" width="27px" alt="User" />
                </div>
                <div class="user-menu" id="userMenu">
                    <a href="profile.html" class="menu-item">View Profile</a>
                    <a href="learning-history.html" class="menu-item">Learning History</a>
                    <a href="#" class="menu-item" onclick="logout()">Logout</a>
                </div>
            </div>
        `;
  } else {
    // Nếu chưa đăng nhập
    signupLoginAvatar.innerHTML = `
            <div>
                <button class="signup" onclick="window.location.href='register.html'">Sign Up</button>
                <button class="login" onclick="window.location.href='login.html'">Log In</button>
            </div>
            <div class="avatar" style="cursor: pointer" onclick="window.location.href='login.html'">
                <img src="img/avatar_user.png" width="27px" alt="User" />
            </div>
        `;
  }
}

// Xử lý đổi mật khẩu
if (isChangePasswordPage) {
  const changePasswordForm = document.getElementById("changePasswordForm");
  const errorMessage = document.getElementById("errorMessage");

  changePasswordForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const email = document.getElementById("email").value;
    const currentPassword = document.getElementById("currentPassword").value;
    const newPassword = document.getElementById("newPassword").value;
    const confirmPassword = document.getElementById("confirmPassword").value;

    // Kiểm tra mật khẩu mới và xác nhận
    if (newPassword !== confirmPassword) {
      errorMessage.textContent = "New passwords do not match!";
      errorMessage.style.display = "block";
      return;
    }

    // Tìm user
    const userIndex = users.findIndex(
      (u) => u.email === email && u.password === currentPassword
    );

    if (userIndex !== -1) {
      // Cập nhật mật khẩu mới
      users[userIndex].password = newPassword;
      localStorage.setItem("users", JSON.stringify(users));
      
      // Chuyển hướng về trang đăng nhập
      window.location.href = "login.html";
    } else {
      errorMessage.textContent = "Invalid email or current password!";
      errorMessage.style.display = "block";
    }
  });
}

// Hàm đăng xuất
function logout() {
  localStorage.removeItem("currentUser");
  window.location.reload();
}

// Thêm hàm toggle menu
function toggleUserMenu() {
    const menu = document.getElementById('userMenu');
    menu.classList.toggle('show');
}

// Đóng menu khi click ra ngoài
document.addEventListener('click', function(event) {
    const menu = document.getElementById('userMenu');
    const avatar = document.querySelector('.avatar');
    if (menu && !avatar.contains(event.target)) {
        menu.classList.remove('show');
    }
});
