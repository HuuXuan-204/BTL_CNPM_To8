const signupModal = document.getElementById("signup-modal");
const loginModal = document.getElementById("login-modal");
let signupBtn = document.querySelector(".signup");
let loginBtn = document.querySelector(".login");
const signupForm = document.getElementById("signup-form");
const loginForm = document.getElementById("login-form");
const signupLoginContainer = document.querySelector(".signup-login-avatar");
const closeButtons = document.querySelectorAll(".close");
const userInfoModal = document.getElementById("user-info-modal");
const userInfoForm = document.getElementById("user-info-form");
const avatarPreviewImg = document.getElementById("avatar-preview-img");
const userAvatarInput = document.getElementById("user-avatar");

// Mở modal đăng ký
signupBtn.onclick = () => {
  signupModal.style.display = "flex";
};

// Mở modal đăng nhập
loginBtn.onclick = () => {
  loginModal.style.display = "flex";
};

// Đóng modal khi bấm nút close
closeButtons.forEach((button) => {
  button.onclick = () => {
    signupModal.style.display = "none";
    loginModal.style.display = "none";
  };
});

// Đóng modal khi bấm ra ngoài
window.onclick = (event) => {
  if (event.target === signupModal) {
    signupModal.style.display = "none";
  }
  if (event.target === loginModal) {
    loginModal.style.display = "none";
  }
};

// Xử lý đăng ký
signupForm.onsubmit = (e) => {
  e.preventDefault();
  const email = document.getElementById("signup-email").value;
  const username = document.getElementById("signup-username").value;
  const password = document.getElementById("signup-password").value;

  // Lưu thông tin người dùng vào localStorage
  const users = JSON.parse(localStorage.getItem("users")) || [];
  if (users.some((user) => user.email === email)) {
    alert("Email đã được sử dụng!");
    return;
  }

  users.push({ email, username, password, avatar: "img/avatar_user.png" }); // Thêm avatar mặc định
  localStorage.setItem("users", JSON.stringify(users));
  alert("Đăng ký thành công! Vui lòng đăng nhập.");
  signupModal.style.display = "none";
  signupForm.reset();
};

// Xử lý đăng nhập
loginForm.onsubmit = (e) => {
  e.preventDefault();
  const email = document.getElementById("login-email").value;
  const password = document.getElementById("login-password").value;

  const users = JSON.parse(localStorage.getItem("users")) || [];
  const user = users.find(
    (user) => user.email === email && user.password === password
  );

  if (user) {
    localStorage.setItem("currentUser", JSON.stringify(user));
    updateUserInterface(user);
    loginModal.style.display = "none";
    loginForm.reset();
  } else {
    alert("Email hoặc mật khẩu không đúng!");
  }
};

// Cập nhật giao diện sau khi đăng nhập
function updateUserInterface(user) {
  signupLoginContainer.innerHTML = `
        <div class="user-info">
            <span class="username">Welcome, ${user.username}</span>
            <div class="avatar">
              <img src="${
                user.avatar || "img/avatar_user.png"
              }" width="27px" alt="User" />
            </div>
            <button class="saved-lessons-btn">Saved Lessons</button>
            <button class="logout">Logout</button>
        </div>
    `;

  // Xử lý bấm vào avatar để xem thông tin
  const avatar = document.querySelector(".user-info .avatar");
  avatar.onclick = () => {
    document.getElementById("user-email").value = user.email;
    document.getElementById("user-username").value = user.username;
    document.getElementById("user-avatar").value = user.avatar || "";
    avatarPreviewImg.src = user.avatar || "img/avatar_user.png";
    avatarPreviewImg.style.display = user.avatar ? "block" : "none";
    userInfoModal.style.display = "flex";
  };

  // Xử lý bấm vào nút Saved Lessons
  const savedLessonsBtn = document.querySelector(".saved-lessons-btn");
  savedLessonsBtn.onclick = () => {
    const savedLessons =
      JSON.parse(localStorage.getItem(`savedLessons_${user.email}`)) || [];
    const savedLessonsList = document.getElementById("saved-lessons-list");
    savedLessonsList.innerHTML = "";

    if (savedLessons.length === 0) {
      savedLessonsList.innerHTML =
        '<li style="text-align: center;">Bạn chưa lưu bài học nào.</li>';
    } else {
      savedLessons.forEach((lesson, index) => {
        const li = document.createElement("li");
        li.innerHTML = `
          <span>${lesson.language.toUpperCase()} - Lesson ${lesson.lessonId}: ${
          lesson.title
        }</span>
          <div>
            <button class="resume-lesson" data-index="${index}">Resume</button>
            <button class="delete-lesson" data-index="${index}" style="margin-left: 10px;">Delete</button>
          </div>
        `;
        savedLessonsList.appendChild(li);
      });

      // Thêm sự kiện cho các nút Resume
      document.querySelectorAll(".resume-lesson").forEach((button) => {
        button.onclick = () => {
          const index = button.getAttribute("data-index");
          const lesson = savedLessons[index];
          toggleSidebar(lesson.language);
          loadLessonContent(lesson.language, lesson.lessonId);
          document.getElementById("saved-lessons-modal").style.display = "none";
        };
      });

      // Thêm sự kiện cho các nút Delete
      document.querySelectorAll(".delete-lesson").forEach((button) => {
        button.onclick = () => {
          const index = button.getAttribute("data-index");
          savedLessons.splice(index, 1); // Xóa bài học khỏi mảng
          localStorage.setItem(
            `savedLessons_${user.email}`,
            JSON.stringify(savedLessons)
          ); // Cập nhật localStorage
          // Cập nhật lại danh sách hiển thị
          savedLessonsList.innerHTML = "";
          if (savedLessons.length === 0) {
            savedLessonsList.innerHTML =
              '<li style="text-align: center;">Bạn chưa lưu bài học nào.</li>';
          } else {
            savedLessons.forEach((lesson, newIndex) => {
              const li = document.createElement("li");
              li.innerHTML = `
                <span>${lesson.language.toUpperCase()} - Lesson ${
                lesson.lessonId
              }: ${lesson.title}</span>
                <div>
                  <button class="resume-lesson" data-index="${newIndex}">Resume</button>
                  <button class="delete-lesson" data-index="${newIndex}" style="margin-left: 10px;">Delete</button>
                </div>
              `;
              savedLessonsList.appendChild(li);
            });

            // Gán lại sự kiện cho các nút Resume và Delete sau khi cập nhật danh sách
            document.querySelectorAll(".resume-lesson").forEach((button) => {
              button.onclick = () => {
                const index = button.getAttribute("data-index");
                const lesson = savedLessons[index];
                toggleSidebar(lesson.language);
                loadLessonContent(lesson.language, lesson.lessonId);
                document.getElementById("saved-lessons-modal").style.display =
                  "none";
              };
            });

            document.querySelectorAll(".delete-lesson").forEach((button) => {
              button.onclick = () => {
                const index = button.getAttribute("data-index");
                savedLessons.splice(index, 1);
                localStorage.setItem(
                  `savedLessons_${user.email}`,
                  JSON.stringify(savedLessons)
                );
                savedLessonsBtn.click(); // Gọi lại sự kiện để làm mới danh sách
              };
            });
          }
        };
      });
    }

    document.getElementById("saved-lessons-modal").style.display = "flex";
  };

  // Xử lý đăng xuất
  document.querySelector(".logout").onclick = () => {
    localStorage.removeItem("currentUser");
    signupLoginContainer.innerHTML = `
            <div>
              <button class="signup">Sign Up</button>
              <button class="login">Login</button>
            </div>
            <div class="avatar">
              <img src="img/avatar_user.png" width="27px" alt="User" />
            </div>
        `;
    signupBtn = document.querySelector(".signup");
    loginBtn = document.querySelector(".login");
    signupBtn.onclick = () => {
      signupModal.style.display = "flex";
    };
    loginBtn.onclick = () => {
      loginModal.style.display = "flex";
    };
  };
}

// Đóng modal Saved Lessons
document.querySelector("#saved-lessons-modal .close").onclick = () => {
  document.getElementById("saved-lessons-modal").style.display = "none";
};

// Đóng modal khi bấm ra ngoài
window.addEventListener("click", (event) => {
  if (event.target === document.getElementById("saved-lessons-modal")) {
    document.getElementById("saved-lessons-modal").style.display = "none";
  }
});

// Xem trước avatar khi nhập URL
userAvatarInput.oninput = (e) => {
  const url = e.target.value;
  avatarPreviewImg.src = url;
  avatarPreviewImg.style.display = url ? "block" : "none";
};

// Xử lý lưu thông tin người dùng
userInfoForm.onsubmit = (e) => {
  e.preventDefault();
  const email = document.getElementById("user-email").value;
  const username = document.getElementById("user-username").value;
  const avatar = document.getElementById("user-avatar").value;

  // Cập nhật thông tin người dùng
  const users = JSON.parse(localStorage.getItem("users")) || [];
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  const userIndex = users.findIndex((user) => user.email === currentUser.email);

  if (userIndex !== -1) {
    users[userIndex] = {
      email,
      username,
      password: users[userIndex].password,
      avatar,
    };
    localStorage.setItem("users", JSON.stringify(users));
    localStorage.setItem("currentUser", JSON.stringify(users[userIndex]));
    updateUserInterface(users[userIndex]);
    userInfoModal.style.display = "none";
    alert("Cập nhật thông tin thành công!");
  }
};

// Kiểm tra nếu đã đăng nhập khi tải trang
const currentUser = JSON.parse(localStorage.getItem("currentUser"));
if (currentUser) {
  updateUserInterface(currentUser);
}
