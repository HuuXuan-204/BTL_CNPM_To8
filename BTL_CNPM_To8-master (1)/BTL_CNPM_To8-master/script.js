function setVH() {
  let vh = window.innerHeight * 0.01;
  document.documentElement.style.setProperty("--vh", `${vh}px`);
}
setVH();

let lessonsData = {};
let lessonContents = {};
let isSidebarVisible = false;
let currentLanguage = null;
let currentLessonId = null;

document.querySelectorAll(".toggleSidebar").forEach((button) => {
  button.addEventListener("click", () => {
    const language = button.getAttribute("data-lang");
    toggleSidebar(language);
  });
});

function toggleSidebar(language) {
  const sidebar = document.getElementById("sidebar");
  const imgBackground = document.getElementById("img-background");
  const lessonContent = document.getElementById("lesson-content");
  const textBottomContent = document.querySelector(".text-img-bottomcontent");
  const searchContainer = document.querySelector(".search-container");

  if (language === currentLanguage && isSidebarVisible) {
    sidebar.classList.remove("active");
    imgBackground.classList.remove("hidden");
    textBottomContent.classList.remove("hidden");
    searchContainer.classList.remove("hidden");
    lessonContent.classList.remove("active");
    isSidebarVisible = false;
    currentLanguage = null;
    currentLessonId = null;
    document
      .querySelectorAll(".toggleSidebar")
      .forEach((btn) => btn.classList.remove("active"));
    return;
  }

  sidebar.classList.add("active");
  imgBackground.classList.add("hidden");
  textBottomContent.classList.add("hidden");
  searchContainer.classList.add("hidden");
  lessonContent.classList.add("active");
  isSidebarVisible = true;
  currentLanguage = language;

  document
    .querySelectorAll(".toggleSidebar")
    .forEach((btn) => btn.classList.remove("active"));
  document
    .querySelector(`.toggleSidebar[data-lang="${language}"]`)
    .classList.add("active");

  loadLessons(language);
}

function loadLessons(language) {
  const fileName = `courses/${language}.html`;

  if (lessonsData[language]) {
    displayLessonList(language);
    return;
  }

  fetch(fileName)
    .then((response) => {
      if (!response.ok)
        throw new Error(
          `Không tìm thấy file ${fileName}. Vui lòng kiểm tra lại thư mục dự án.`
        );
      return response.text();
    })
    .then((data) => {
      const parser = new DOMParser();
      const doc = parser.parseFromString(data, "text/html");

      lessonsData[language] = [];
      lessonContents[language] = {};

      // Lấy tất cả bài học (giả sử có 34 bài học)
      for (let i = 1; i <= 34; i++) {
        const lessonDiv = doc.querySelector(`#lesson-${i}`);
        if (lessonDiv) {
          const title = lessonDiv.querySelector("h1")?.textContent;
          if (title) {
            lessonsData[language].push({ id: i, title: title });
            lessonContents[language][i] = lessonDiv.innerHTML;
          }
        }
      }

      if (lessonsData[language].length === 0) {
        throw new Error(`Không tìm thấy bài học nào trong file ${fileName}.`);
      }

      displayLessonList(language);
    })
    .catch((error) => {
      console.error("Lỗi:", error.message);
      const lessonList = document.getElementById("lesson-list");
      lessonList.innerHTML = `<li style="color: red;">${error.message}</li>`;
    });
}

function displayLessonList(language) {
  const lessonList = document.getElementById("lesson-list");
  lessonList.innerHTML = "";
  lessonsData[language].forEach((lesson) => {
    const li = document.createElement("li");
    li.textContent = lesson.title;
    li.onclick = () => {
      loadLessonContent(language, lesson.id);

      document
        .querySelectorAll("#lesson-list li")
        .forEach((item) => item.classList.remove("active"));
      li.classList.add("active");
      currentLessonId = lesson.id;
    };
    lessonList.appendChild(li);
  });

  if (lessonsData[language].length > 0) {
    loadLessonContent(language, lessonsData[language][0].id);
    lessonList.firstChild.classList.add("active");
    currentLessonId = lessonsData[language][0].id;
  }
}

function loadLessonContent(language, lessonId) {
  const lessonContent = document.getElementById("lesson-content");
  lessonContent.innerHTML =
    lessonContents[language][lessonId] ||
    "<p>Không tìm thấy nội dung bài học.</p>";

  if (typeof Prism !== "undefined") {
    Prism.highlightAll();
  }
}
