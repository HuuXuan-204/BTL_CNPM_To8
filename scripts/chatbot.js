async function getApiKey() {
  try {
    const response = await fetch(
      "https://gemini-api.nguyenhxuan204.workers.dev",
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch API key: ${response.status}`);
    }

    const data = await response.json();
    if (!data.apiKey) {
      throw new Error("API key not found in response");
    }

    return data.apiKey;
  } catch (error) {
    console.error("Error fetching API key:", error.message);
    throw error;
  }
}
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

  // Gửi yêu cầu
  try {
    const apiKey = await getApiKey();
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: userMessage,
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.7,
            topP: 0.9,
            maxOutputTokens: 1000,
          },
        }),
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
    errorMessageDiv.textContent = `Error: ${error.message}. Please try again.`;
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
