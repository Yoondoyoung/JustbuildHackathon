import { signIn, signUp, type AuthState } from "./auth";

export const renderAuth = (container: HTMLElement, onAuthSuccess: () => void) => {
  container.innerHTML = "";

  const authWrapper = document.createElement("div");
  authWrapper.className = "auth-container";

  const title = document.createElement("h2");
  title.textContent = "ShopSense";
  title.className = "auth-title";
  authWrapper.appendChild(title);

  const tabs = document.createElement("div");
  tabs.className = "auth-tabs";
  
  const loginTab = document.createElement("button");
  loginTab.textContent = "로그인";
  loginTab.className = "auth-tab active";
  loginTab.dataset.mode = "login";
  
  const signupTab = document.createElement("button");
  signupTab.textContent = "회원가입";
  signupTab.className = "auth-tab";
  signupTab.dataset.mode = "signup";
  
  tabs.appendChild(loginTab);
  tabs.appendChild(signupTab);
  authWrapper.appendChild(tabs);

  const form = document.createElement("form");
  form.className = "auth-form";
  
  const emailInput = document.createElement("input");
  emailInput.type = "email";
  emailInput.placeholder = "이메일";
  emailInput.required = true;
  emailInput.className = "auth-input";
  form.appendChild(emailInput);

  const passwordInput = document.createElement("input");
  passwordInput.type = "password";
  passwordInput.placeholder = "비밀번호";
  passwordInput.required = true;
  passwordInput.className = "auth-input";
  form.appendChild(passwordInput);

  const errorMessage = document.createElement("div");
  errorMessage.className = "auth-error";
  errorMessage.style.display = "none";
  form.appendChild(errorMessage);

  const submitButton = document.createElement("button");
  submitButton.type = "submit";
  submitButton.textContent = "로그인";
  submitButton.className = "btn btn-primary auth-submit";
  form.appendChild(submitButton);

  authWrapper.appendChild(form);
  container.appendChild(authWrapper);

  let currentMode: "login" | "signup" = "login";

  const switchMode = (mode: "login" | "signup") => {
    currentMode = mode;
    loginTab.classList.toggle("active", mode === "login");
    signupTab.classList.toggle("active", mode === "signup");
    submitButton.textContent = mode === "login" ? "로그인" : "회원가입";
    errorMessage.style.display = "none";
    errorMessage.textContent = "";
  };

  loginTab.addEventListener("click", () => switchMode("login"));
  signupTab.addEventListener("click", () => switchMode("signup"));

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    errorMessage.style.display = "none";
    errorMessage.textContent = "";

    const email = emailInput.value.trim();
    const password = passwordInput.value;

    if (!email || !password) {
      errorMessage.textContent = "이메일과 비밀번호를 입력해주세요.";
      errorMessage.style.display = "block";
      return;
    }

    submitButton.disabled = true;
    submitButton.textContent = currentMode === "login" ? "로그인 중..." : "회원가입 중...";

    try {
      if (currentMode === "login") {
        await signIn(email, password);
      } else {
        await signUp(email, password);
      }
      onAuthSuccess();
    } catch (error: any) {
      errorMessage.textContent = error.message || "오류가 발생했습니다.";
      errorMessage.style.display = "block";
    } finally {
      submitButton.disabled = false;
      submitButton.textContent = currentMode === "login" ? "로그인" : "회원가입";
    }
  });
};
