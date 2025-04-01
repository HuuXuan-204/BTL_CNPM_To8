function redirectIfLoggedIn(url) {
  const isLoggedIn = JSON.parse(localStorage.getItem("currentUser"));
  if (isLoggedIn) {
    window.open(url, "_blank");
  } else {
    alert("Please log in to access this feature!");
  }
}

let lessonsData = {};
let lessonContents = {};
let isSidebarVisible = false;
let currentLanguage = null;
let currentLessonId = null;
/*-------------------------------------------------------------------------------*/
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
/*------------------------------------------------------------------------------------*/
function loadLessons(language) {
  const fileName = `courses/${language}.html`;

  if (lessonsData[language]) {
    currentLessonId = 1;
    displayLessonList(language);
    return;
  }

  fetch(fileName)
    .then((response) => {
      if (!response.ok)
        throw new Error(
          `${fileName} not found. Please check the project folder.`
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
        throw new Error(`No lessons found in ${fileName}.`);
      }

      displayLessonList(language);
    })
    .catch((error) => {
      console.error("Error:", error.message);
      const lessonList = document.getElementById("lesson-list");
      lessonList.innerHTML = `<li style="color: red;">${error.message}</li>`;
    });
}
/*-------------------------------------------------------------------------------------------------------*/

function displayLessonList(language) {
  const lessonList = document.getElementById("lesson-list");
  lessonList.innerHTML = "";
  lessonsData[language].forEach((lesson) => {
    const li = document.createElement("li");
    li.innerHTML = `
          <span class="lesson-number">${lesson.id}</span>
          <span class="lesson-title">${lesson.title}</span>
      `;
    li.onclick = () => {
      loadLessonContent(language, lesson.id);
      document
        .querySelectorAll("#lesson-list li")
        .forEach((item) => item.classList.remove("active"));
      li.classList.add("active");
      currentLessonId = 1;
    };
    lessonList.appendChild(li);
  });

  if (currentLessonId) {
    const activeLesson = document.querySelector(
      `#lesson-list li:nth-child(${currentLessonId})`
    );
    if (activeLesson) {
      document
        .querySelectorAll("#lesson-list li")
        .forEach((item) => item.classList.remove("active"));
      activeLesson.classList.add("active");
      loadLessonContent(language, currentLessonId); // Tải nội dung bài học tương ứng
      currentLessonId = 1;
    } else {
      // Nếu currentLessonId không hợp lệ, chọn bài đầu tiên
      loadLessonContent(language, lessonsData[language][0].id);
      lessonList.firstChild.classList.add("active");
      currentLessonId = lessonsData[language][0].id;
      currentLessonId = 1;
    }
  } else {
    // Nếu không có currentLessonId, mặc định chọn bài đầu tiên
    loadLessonContent(language, lessonsData[language][0].id);
    lessonList.firstChild.classList.add("active");
    currentLessonId = lessonsData[language][0].id;
    currentLessonId = 1;
  }
}
/*-------------------------------------------------------------------------------*/

function loadLessonContent(language, lessonId) {
  const lessonContent = document.getElementById("lesson-content");
  const totalLessons = lessonsData[language].length;

  // Tạo nội dung bài học với nút ở đầu và cuối
  lessonContent.innerHTML = `
      <div class="navigation-buttons">
          <button id="prev-lesson-top" ${
            lessonId === 1 ? "disabled" : ""
          }>Previous</button>
          <button id="next-lesson-top" ${
            lessonId === totalLessons ? "disabled" : ""
          }>Next</button>
      </div>
      <div class="lesson-body">
          ${
            lessonContents[language][lessonId] ||
            "<p>Không tìm thấy nội dung bài học.</p>"
          }
      </div>
      <div class="navigation-buttons">
          <button id="prev-lesson-bottom" ${
            lessonId === 1 ? "disabled" : ""
          }>Previous</button>
          <button id="save-lesson-bottom">Save Lesson</button>
          <button id="next-lesson-bottom" ${
            lessonId === totalLessons ? "disabled" : ""
          }>Next</button>
      </div>
  `;
  const saveButton = document.getElementById("save-lesson-bottom");
  saveButton.onclick = () => {
    const currentUser = JSON.parse(localStorage.getItem("currentUser"));
    if (!currentUser) {
      alert("Please log in to save lesson!");
      return;
    }

    const savedLessons =
      JSON.parse(localStorage.getItem(`savedLessons_${currentUser.email}`)) ||
      [];
    const lessonToSave = {
      language,
      lessonId,
      title: lessonsData[language][lessonId - 1].title,
    };

    if (
      !savedLessons.some(
        (lesson) => lesson.language === language && lesson.lessonId === lessonId
      )
    ) {
      savedLessons.push(lessonToSave);
      localStorage.setItem(
        `savedLessons_${currentUser.email}`,
        JSON.stringify(savedLessons)
      );
      alert("Saved lesson!");
    } else {
      alert("Saved lesson!");
    }
  };

  // Highlight code nếu có Prism
  if (typeof Prism !== "undefined") {
    Prism.highlightAll();
  }

  // Thêm sự kiện cho nút Previous (ở đầu)
  const prevButtonTop = document.getElementById("prev-lesson-top");
  prevButtonTop.onclick = () => {
    if (lessonId > 1) {
      const newLessonId = lessonId - 1;
      loadLessonContent(language, newLessonId);
      currentLessonId = newLessonId;
      // Cập nhật trạng thái active trong lesson-list
      document
        .querySelectorAll("#lesson-list li")
        .forEach((item) => item.classList.remove("active"));
      document
        .querySelector(`#lesson-list li:nth-child(${newLessonId})`)
        .classList.add("active");
    }
  };

  // Thêm sự kiện cho nút Next (ở đầu)
  const nextButtonTop = document.getElementById("next-lesson-top");
  nextButtonTop.onclick = () => {
    if (lessonId < totalLessons) {
      const newLessonId = lessonId + 1;
      loadLessonContent(language, newLessonId);
      currentLessonId = newLessonId;
      // Cập nhật trạng thái active trong lesson-list
      document
        .querySelectorAll("#lesson-list li")
        .forEach((item) => item.classList.remove("active"));
      document
        .querySelector(`#lesson-list li:nth-child(${newLessonId})`)
        .classList.add("active");
    }
  };

  // Thêm sự kiện cho nút Previous (ở cuối)
  const prevButtonBottom = document.getElementById("prev-lesson-bottom");
  prevButtonBottom.onclick = () => {
    if (lessonId > 1) {
      const newLessonId = lessonId - 1;
      loadLessonContent(language, newLessonId);
      currentLessonId = newLessonId;
      // Cập nhật trạng thái active trong lesson-list
      document
        .querySelectorAll("#lesson-list li")
        .forEach((item) => item.classList.remove("active"));
      document
        .querySelector(`#lesson-list li:nth-child(${newLessonId})`)
        .classList.add("active");
    }
  };

  // Thêm sự kiện cho nút Next (ở cuối)
  const nextButtonBottom = document.getElementById("next-lesson-bottom");
  nextButtonBottom.onclick = () => {
    if (lessonId < totalLessons) {
      const newLessonId = lessonId + 1;
      loadLessonContent(language, newLessonId);
      currentLessonId = newLessonId;
      // Cập nhật trạng thái active trong lesson-list
      document
        .querySelectorAll("#lesson-list li")
        .forEach((item) => item.classList.remove("active"));
      document
        .querySelector(`#lesson-list li:nth-child(${newLessonId})`)
        .classList.add("active");
    }
  };
}
/*----------------------------------------------------------------------------------------------*/

const languages = [
  "c",
  "cpp",
  "java",
  "python",
  "html",
  "css",
  "javascript",
  "sql",
];

// Tải trước dữ liệu bài học cho tất cả các ngôn ngữ
function preloadLessons() {
  languages.forEach((language) => {
    const fileName = `courses/${language}.html`;

    fetch(fileName)
      .then((response) => {
        if (!response.ok)
          throw new Error(
            `${fileName} not found. Please check the project folder.`
          );
        return response.text();
      })
      .then((data) => {
        const parser = new DOMParser();
        const doc = parser.parseFromString(data, "text/html");

        lessonsData[language] = [];
        lessonContents[language] = {};

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
          throw new Error(`No lessons found in ${fileName}.`);
        }
      })
      .catch((error) => {
        console.error("Error loading lesson data:", error.message);
      });
  });
}

// Gọi hàm preloadLessons khi trang load
document.addEventListener("DOMContentLoaded", () => {
  preloadLessons();
});

// Sửa hàm loadLessons để không cần fetch lại nếu dữ liệu đã có
function loadLessons(language) {
  if (lessonsData[language] && lessonsData[language].length > 0) {
    displayLessonList(language);
  } else {
    // Nếu dữ liệu chưa được tải (trường hợp lỗi khi preload), thử tải lại
    const fileName = `courses/${language}.html`;
    fetch(fileName)
      .then((response) => {
        if (!response.ok)
          throw new Error(
            `${fileName} not found. Please check the project folder.`
          );
        return response.text();
      })
      .then((data) => {
        const parser = new DOMParser();
        const doc = parser.parseFromString(data, "text/html");

        lessonsData[language] = [];
        lessonContents[language] = {};

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
          throw new Error(`No lessons found in ${fileName}.`);
        }

        displayLessonList(language);
      })
      .catch((error) => {
        console.error("Lỗi:", error.message);
        const lessonList = document.getElementById("lesson-list");
        lessonList.innerHTML = `<li style="color: red;">${error.message}</li>`;
      });
  }
}

// Xử lý tìm kiếm bài học
const searchInput = document.querySelector(".Search input");
const searchForm = document.getElementById("search-form");

// Ngăn hành vi submit form mặc định
searchForm.addEventListener("submit", (e) => {
  e.preventDefault(); // Ngăn chuyển hướng
});

searchInput.addEventListener("input", (e) => {
  const keyword = e.target.value.toLowerCase();
  if (isSidebarVisible) return; // Chỉ tìm kiếm khi sidebar chưa mở (giao diện chính)

  const searchResultsModal = document.getElementById("search-results-modal");
  const searchResultsList = document.getElementById("search-results-list");
  searchResultsList.innerHTML = "";

  // Tìm kiếm trong tất cả các ngôn ngữ
  let allResults = [];
  Object.keys(lessonsData).forEach((language) => {
    const lessons = lessonsData[language] || [];
    const filteredLessons = lessons.filter((lesson) =>
      lesson.title.toLowerCase().includes(keyword)
    );
    filteredLessons.forEach((lesson) => {
      allResults.push({ language, lessonId: lesson.id, title: lesson.title });
    });
  });

  if (keyword === "") {
    searchResultsModal.style.display = "none"; // Ẩn modal nếu không có từ khóa
    return;
  }

  if (allResults.length === 0) {
    searchResultsList.innerHTML =
      '<li style="text-align: center;">Not find any lessons!</li>';
  } else {
    allResults.forEach((result) => {
      const li = document.createElement("li");
      li.innerHTML = `
                <span>${result.language.toUpperCase()} - Lesson ${
        result.lessonId
      }: ${result.title}</span>
            `;

      li.onclick = () => {
        currentLessonId = result.lessonId;
        toggleSidebar(result.language);
        loadLessonContent(result.language, result.lessonId);
        currentLessonId = 1;
        searchResultsModal.style.display = "none"; // Đóng modal sau khi chọn
      };
      searchResultsList.appendChild(li);
    });
  }

  searchResultsModal.style.display = "flex"; // Hiển thị modal kết quả
});

// Đóng modal kết quả tìm kiếm
document.querySelector("#search-results-modal .close").onclick = () => {
  document.getElementById("search-results-modal").style.display = "none";
};

// Đóng modal khi bấm ra ngoài
window.addEventListener("click", (event) => {
  if (event.target === document.getElementById("search-results-modal")) {
    document.getElementById("search-results-modal").style.display = "none";
  }
});

// Tải lịch sử trò chuyện khi mở chatbot
function loadChatHistory() {
  const messagesDiv = document.getElementById("chatbot-messages");
  const history = JSON.parse(localStorage.getItem("chatHistory")) || [];
  messagesDiv.innerHTML = "";
  history.forEach((msg) => {
    const messageDiv = document.createElement("div");
    messageDiv.className = `chatbot-message ${msg.role}`;
    if (msg.isList) {
      const ol = document.createElement("ol");
      msg.items.forEach((item) => {
        const li = document.createElement("li");
        li.textContent = item;
        ol.appendChild(li);
      });
      messageDiv.appendChild(ol);
    } else {
      messageDiv.innerHTML = msg.text.replace(/\n/g, "<br>");
    }
    messagesDiv.appendChild(messageDiv);
  });
  messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

// Mở/đóng cửa sổ chatbot
function toggleChatbot() {
  const chatbotWindow = document.getElementById("chatbot-window");
  const chatbotIcon = document.querySelector(".chatbot-icon");
  const input = document.getElementById("chatbot-input");
  const isOpening = !chatbotWindow.classList.contains("show");

  if (isOpening) {
    chatbotWindow.classList.add("show");
    loadChatHistory();
    chatbotIcon.classList.remove("attention");
  } else {
    chatbotWindow.classList.remove("show");
    // Xóa ô nhập liệu khi đóng chatbot
    input.value = "";
    setTimeout(() => {
      chatbotIcon.classList.add("attention");
    }, 2000);
  }
}

// Hiển thị hiệu ứng gõ
async function showTypingEffect(messagesDiv) {
  const typingDiv = document.createElement("div");
  typingDiv.className = "chatbot-message bot typing";
  typingDiv.textContent = "Typing...";
  messagesDiv.appendChild(typingDiv);
  messagesDiv.scrollTop = messagesDiv.scrollHeight;
  return typingDiv;
}

// Chuyển văn bản thành danh sách nếu có số thứ tự
function parseMessageToList(message) {
  const lines = message.split("\n");
  const listItems = [];
  let isList = false;
  let nonListText = [];

  lines.forEach((line) => {
    // Kiểm tra nếu dòng bắt đầu bằng số thứ tự (ví dụ: "1.", "2.",...)
    const match = line.match(/^\d+\.\s*(.+)|-\s*(.+)/);
    if (match) {
      isList = true;
      listItems.push(match[1].trim());
    } else {
      nonListText.push(line);
    }
  });

  return { isList, items: listItems, nonListText: nonListText.join("\n") };
}
// Xóa lịch sử trò chuyện
function clearChatHistory() {
  localStorage.removeItem("chatHistory");
  document.getElementById("chatbot-messages").innerHTML = "";
}
// Gửi tin nhắn và nhận phản hồi từ Gemini API
async function sendMessage() {
  const input = document.getElementById("chatbot-input");
  const messagesDiv = document.getElementById("chatbot-messages");
  const userMessage = input.value.trim();

  if (!userMessage) return;

  // Hiển thị tin nhắn của người dùng
  const userMessageDiv = document.createElement("div");
  userMessageDiv.className = "chatbot-message user";
  userMessageDiv.textContent = userMessage;
  messagesDiv.appendChild(userMessageDiv);

  // Lưu tin nhắn người dùng vào lịch sử
  const history = JSON.parse(localStorage.getItem("chatHistory")) || [];
  history.push({ role: "user", text: userMessage });
  localStorage.setItem("chatHistory", JSON.stringify(history));

  // Xóa ô nhập liệu
  input.value = "";

  // Cuộn xuống cuối
  messagesDiv.scrollTop = messagesDiv.scrollHeight;

  // Hiển thị hiệu ứng gõ
  const typingDiv = await showTypingEffect(messagesDiv);

  // Gửi yêu cầu đến Gemini API
  try {
    const response = await fetch(
      "https://gemini-api.nguyenhxuan204.workers.dev", // Thay bằng URL thực tế của Worker
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userMessage }),
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();

    if (
      !data.candidates ||
      !data.candidates[0] ||
      !data.candidates[0].content ||
      !data.candidates[0].content.parts ||
      !data.candidates[0].content.parts[0]
    ) {
      throw new Error("Invalid response format from Gemini API");
    }

    const botMessage = data.candidates[0].content.parts[0].text;

    // Xử lý văn bản trả về
    const parsedMessage = parseMessageToList(botMessage);

    // Xóa hiệu ứng gõ
    typingDiv.remove();

    // Hiển thị phản hồi của bot
    const botMessageDiv = document.createElement("div");
    botMessageDiv.className = "chatbot-message bot";

    if (parsedMessage.isList) {
      // Nếu là danh sách, tạo <ol>
      if (parsedMessage.nonListText) {
        const nonListDiv = document.createElement("div");
        nonListDiv.innerHTML = parsedMessage.nonListText.replace(/\n/g, "<br>");
        botMessageDiv.appendChild(nonListDiv);
      }
      const ol = document.createElement("ol");
      parsedMessage.items.forEach((item) => {
        const li = document.createElement("li");
        li.textContent = item;
        ol.appendChild(li);
      });
      botMessageDiv.appendChild(ol);

      // Lưu danh sách vào lịch sử
      history.push({
        role: "bot",
        isList: true,
        items: parsedMessage.items,
        nonListText: parsedMessage.nonListText,
      });
    } else {
      botMessageDiv.className = "chatbot-message bot text-content";
      // Nếu không phải danh sách, hiển thị văn bản với xuống dòng
      botMessageDiv.innerHTML = botMessage.replace(/\n/g, "<br>");

      // Lưu văn bản vào lịch sử
      history.push({ role: "bot", text: botMessage });
    }

    messagesDiv.appendChild(botMessageDiv);
    localStorage.setItem("chatHistory", JSON.stringify(history));

    // Cuộn xuống cuối
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
  } catch (error) {
    console.error("Error:", error.message);
    // Xóa hiệu ứng gõ
    typingDiv.remove();

    const errorMessageDiv = document.createElement("div");
    errorMessageDiv.className = "chatbot-message bot";
    errorMessageDiv.textContent =
      "Sorry, something went wrong. Please try again.";
    messagesDiv.appendChild(errorMessageDiv);

    // Lưu lỗi vào lịch sử
    history.push({
      role: "bot",
      text: "Sorry, something went wrong. Please try again.",
    });
    localStorage.setItem("chatHistory", JSON.stringify(history));

    // Cuộn xuống cuối
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
  }
}

// Kích hoạt hiệu ứng sau 3 giây khi trang được tải
document.addEventListener("DOMContentLoaded", () => {
  const chatbotIcon = document.querySelector(".chatbot-icon");
  setTimeout(() => {
    // Chỉ kích hoạt hiệu ứng nếu chatbot chưa được mở
    const chatbotWindow = document.getElementById("chatbot-window");
    if (chatbotWindow.style.display !== "flex") {
      chatbotIcon.classList.add("attention");
    }
  }, 2000);
});
