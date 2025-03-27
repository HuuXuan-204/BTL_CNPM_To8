// Hàm lưu bài học
function saveLesson() {
  // Kiểm tra đăng nhập
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  if (!currentUser) {
    alert("Please log in to save your learning progress!");
    window.location.href = "login.html";
    return;
  }

  // Lấy thông tin bài học hiện tại
  const language = currentLanguage;
  const lessonId = currentLessonId;
  if (!language || !lessonId) {
    alert("No lesson is currently active!");
    return;
  }

  const lesson = lessonsData[language].find((l) => l.id === lessonId);
  if (!lesson) {
    alert("Could not find lesson information!");
    return;
  }

  // Lấy lịch sử học tập hiện tại
  const learningHistory =
    JSON.parse(localStorage.getItem("learningHistory")) || {};
  const userHistory = learningHistory[currentUser.email] || [];

  // Tạo thông tin bài học
  const lessonInfo = {
    id: lessonId,
    language: language,
    title: lesson.title,
    date: new Date().toISOString(),
  };

  // Kiểm tra xem bài học đã được lưu chưa
  const existingIndex = userHistory.findIndex(
    (item) => item.language === language && item.id === lessonId
  );

  if (existingIndex !== -1) {
    // Cập nhật thời gian truy cập
    userHistory[existingIndex].date = lessonInfo.date;
  } else {
    // Thêm bài học mới vào lịch sử
    userHistory.push(lessonInfo);
  }

  // Lưu lại vào localStorage
  learningHistory[currentUser.email] = userHistory;
  localStorage.setItem("learningHistory", JSON.stringify(learningHistory));

  // Hiển thị thông báo thành công
  alert("Lesson progress saved successfully!");
}

// Thêm nút Save Lesson vào sidebar
function addSaveLessonButton() {
  // Kiểm tra xem nút đã tồn tại chưa
  if (document.querySelector(".save-lesson-btn")) {
    return;
  }

  const saveButton = document.createElement("button");
  saveButton.className = "save-lesson-btn";
  saveButton.innerHTML = "Save Lesson";
  saveButton.onclick = saveLesson;

  // Thêm nút vào sidebar
  const lessoncontent = document.getElementById("lesson-content");
  if (lessoncontent) {
    lessoncontent.appendChild(saveButton);
  }
}

// Hàm tiếp tục học bài học đã lưu
function continueLearning(language, lessonId) {
  // Tìm nút ngôn ngữ tương ứng và click
  const languageButton = document.querySelector(
    `.toggleSidebar[data-lang="${language}"]`
  );
  if (languageButton) {
    languageButton.click();

    // Đợi sidebar hiển thị và chọn bài học
    setTimeout(() => {
      const lessonItems = document.querySelectorAll("#lesson-list li");
      const targetLesson = Array.from(lessonItems).find(
        (li) =>
          lessonsData[language].find((l) => l.id === lessonId)?.title ===
          li.textContent
      );
      if (targetLesson) {
        targetLesson.click();
      }
    }, 300);
  }
}

// Xử lý URL hash khi trang được tải
document.addEventListener("DOMContentLoaded", function () {
  // Thêm nút Save Lesson
  addSaveLessonButton();

  // Kiểm tra URL hash
  const hash = window.location.hash;
  if (hash) {
    const [language, lessonId] = hash.slice(1).split("-");
    if (language && lessonId) {
      continueLearning(language, lessonId);
    }
  }
});

// Thêm nút khi sidebar được mở
const originalToggleSidebar = window.toggleSidebar;
window.toggleSidebar = function (language) {
  originalToggleSidebar(language);
  addSaveLessonButton();
};
