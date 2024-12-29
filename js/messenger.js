const db = firebase.database();

function getRoomId(user1, user2) {
  return [user1, user2].join("_");
}

function renderAdmin() {
  const contentMessagesList = document.querySelector(".content-messages-list");
  const tempate = `
    <li>
      <a href="#" data-conversation="#conversation-1">
          <img class="content-message-image"
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OXx8cGVvcGxlfGVufDB8fDB8fHww&auto=format&fit=crop&w=500&q=60"
              alt="">
          <span class="content-message-info">
              <span class="content-message-name">Admin</span>
              <span class="content-message-text">Xin chào</span>
          </span>
          <span class="content-message-more">
              <span class="content-message-unread">1</span>
              <span class="content-message-time">${new Date().getHours()}:${new Date().getMinutes()}</span>
          </span>
      </a>
    </li>
  `;
  contentMessagesList.insertAdjacentHTML("beforeend", tempate);

  document.querySelectorAll("[data-conversation]").forEach(function (item) {
    item.addEventListener("click", function (e) {
      e.preventDefault();
      document.querySelectorAll(".conversation").forEach(function (i) {
        i.classList.remove("active");
      });
      document.querySelector(this.dataset.conversation).classList.add("active");
    });
  });
}

function renderUser() {}

let lastSender = null;
function renderConversation(messages, recipientId) {
  const date = new Date(messages.timestamp);
  const templateWrapper = `
    <div class="conversation-item-wrapper">
      <div class="conversation-item-box">
          <div class="conversation-item-text">
              <p>${messages.text}</p>
              <div class="conversation-item-time">${date.getHours()}:${date.getMinutes()}</div>
          </div>
          <div class="conversation-item-dropdown">
              <button type="button" class="conversation-item-dropdown-toggle"><i
                      class="ri-more-2-line"></i></button>
              <ul class="conversation-item-dropdown-list">
                  <li><a href="#"><i class="ri-share-forward-line"></i> Forward</a>
                  </li>
                  <li><a href="#"><i class="ri-delete-bin-line"></i> Delete</a></li>
              </ul>
          </div>
      </div>
    </div>
  `;
  if (messages.senderId != lastSender) {
    const conversationItem = document.createElement("li");
    conversationItem.className = `conversation-item ${
      messages.senderId == recipientId ? "me" : ""
    }`;
    conversationItem.innerHTML = `
      <div class="conversation-item-side">
        <img class="conversation-item-image"
          src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OXx8cGVvcGxlfGVufDB8fDB8fHww&auto=format&fit=crop&w=500&q=60"
          alt="">
      </div>
      <div class="conversation-item-content"></div>
    `;

    const conversationItemContent = conversationItem.querySelector(".conversation-item-content");
    conversationItemContent.insertAdjacentHTML("beforeend", templateWrapper);
    lastSender = messages.senderId;

    // Insert broswer
    const conversationWrapper = document.querySelector(".conversation-wrapper");

    conversationWrapper.insertAdjacentHTML("beforeend", conversationItem.outerHTML);
  } else {
    const conversationItem = document.querySelector(".conversation-item:last-child");
    const conversationItemContent = conversationItem.querySelector(".conversation-item-content");
    conversationItemContent.insertAdjacentHTML("beforeend", templateWrapper);
  }
}

firebase.auth().onAuthStateChanged((user) => {
  if (user) {
    const currentUserId = user.uid;
    const recipientId = "BwJ1CS0lWMRAX4eEJBn4K854apH3"; //Admin user
    if (currentUserId != recipientId) {
      // Khi đăng nhập tài khoản là user
      renderAdmin();

      const roomId = getRoomId(currentUserId, recipientId);
      const messagesRef = db.ref(`chatRooms/${roomId}/messages`);

      const conversationFormSubmit = document.querySelector(".conversation-form-submit");
      const conversationFormInp = document.querySelector(".conversation-form-input");

      conversationFormSubmit.addEventListener("click", () => {
        const text = conversationFormInp.value.trim();
        if (text) {
          const newMessageRef = messagesRef.push();
          newMessageRef.set({
            senderId: currentUserId,
            text: text,
            timestamp: Date.now(),
          });
          conversationFormInp.value = "";
        }
      });

      messagesRef.on("child_added", (snapshot) => {
        const message = snapshot.val();
        renderConversation(message, recipientId);
      });
    } else {
      // Khi đăng nhập tài khoản admin
      renderUser();
    }
  } else {
    window.location.href = "../index.html";
  }
});

// start: Sidebar
document.querySelector(".chat-sidebar-profile-toggle").addEventListener("click", function (e) {
  e.preventDefault();
  this.parentElement.classList.toggle("active");
});

document.addEventListener("click", function (e) {
  if (!e.target.matches(".chat-sidebar-profile, .chat-sidebar-profile *")) {
    document.querySelector(".chat-sidebar-profile").classList.remove("active");
  }
});
// end: Sidebar

// start: Coversation
document.querySelectorAll(".conversation-item-dropdown-toggle").forEach(function (item) {
  item.addEventListener("click", function (e) {
    e.preventDefault();
    if (this.parentElement.classList.contains("active")) {
      this.parentElement.classList.remove("active");
    } else {
      document.querySelectorAll(".conversation-item-dropdown").forEach(function (i) {
        i.classList.remove("active");
      });
      this.parentElement.classList.add("active");
    }
  });
});

document.addEventListener("click", function (e) {
  if (!e.target.matches(".conversation-item-dropdown, .conversation-item-dropdown *")) {
    document.querySelectorAll(".conversation-item-dropdown").forEach(function (i) {
      i.classList.remove("active");
    });
  }
});

document.querySelectorAll(".conversation-form-input").forEach(function (item) {
  item.addEventListener("input", function () {
    this.rows = this.value.split("\n").length;
  });
});

document.querySelectorAll(".conversation-back").forEach(function (item) {
  item.addEventListener("click", function (e) {
    e.preventDefault();
    this.closest(".conversation").classList.remove("active");
    document.querySelector(".conversation-default").classList.add("active");
  });
});
// end: Coversation

const logout = document.querySelector(".logout");
logout.addEventListener("click", () => {
  firebase
    .auth()
    .signOut()
    .then(() => {
      window.location.href = "../index.html";
    })
    .catch((error) => {});
});
