const create = document.querySelector(".create");
const btnSignUp = document.querySelector(".btn-sign-up");
const signup_form = document.querySelector(".signup_form");
const signin_form = document.querySelector(".signin_form");

// Năm
const startYear = 1900;
const endYear = new Date().getFullYear();
const yearSelect = document.getElementById("year");

for (let year = endYear; year >= startYear; year--) {
  const option = document.createElement("option");
  option.value = year;
  option.textContent = year;
  yearSelect.appendChild(option);
}
// end Năm

create.addEventListener("click", (e) => {
  e.preventDefault();
  const form = document.querySelector("#signup");
  form.classList.toggle("show");
  document.querySelector(".layer").style.display = "block";
});

const hide = () => {
  const hide = document.querySelector(".show");
  hide.classList.remove("show");
  document.querySelector(".layer").style.display = "none";
};

let message = "";
let flagError = false;
btnSignUp.addEventListener("click", (e) => {
  e.preventDefault();
  const signupData = new FormData(signup_form);
  const data = {};
  for ([key, value] of signupData) {
    data[key] = value;
  }

  firebase
    .auth()
    .createUserWithEmailAndPassword(data.email, data.password)
    .then((userCredential) => {
      var user = userCredential.user;
      const db = firebase.firestore();
      db.collection("users")
        .doc(user.uid)
        .set(data)
        .then(() => {
          console.log("Document successfully written!");
        })
        .catch((error) => {
          console.error("Error writing document: ", error);
        });
      message = "Đăng ký thành công";
    })
    .catch((error) => {
      message = "Thông tin không hợp lệ";
      flagError = true;
    })
    .finally(() => {
      Toastify({
        text: message,
        duration: 10000,
        close: true,
        gravity: "top",
        position: "right",
        backgroundColor: flagError
          ? "linear-gradient(to right, #FF6B6B, #FF4E50)"
          : "linear-gradient(to right, #66BB6A, #388E3C)",
        stopOnFocus: true,
      }).showToast();
    });
});

signin_form.addEventListener("submit", (e) => {
  e.preventDefault();
  const signipData = new FormData(signin_form);
  const data = {};
  for ([key, value] of signipData) {
    data[key] = value;
  }

  firebase
    .auth()
    .setPersistence(firebase.auth.Auth.Persistence.SESSION)
    .then(() => {
      message = "Đăng nhập thành công";
      return firebase.auth().signInWithEmailAndPassword(data.email, data.password);
    })
    .then(() => {
      window.location.href = "./html/messenger.html";
    })
    .catch((error) => {
      message = "Thông tin không hợp lệ";
      flagError = true;
    })
    .finally(() => {
      Toastify({
        text: message,
        duration: 10000,
        close: true,
        gravity: "top",
        position: "right",
        backgroundColor: flagError
          ? "linear-gradient(to right, #FF6B6B, #FF4E50)"
          : "linear-gradient(to right, #66BB6A, #388E3C)",
        stopOnFocus: true,
      }).showToast();
    });
});
