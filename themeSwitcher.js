import { playSound, soundOpenCell } from "./index.js";

function switchTheme(icon) {
  const htmlEl = document.documentElement;
  let currentTheme = htmlEl.getAttribute("theme");

  if (currentTheme === "light") {
    htmlEl.setAttribute("theme", "dark");
    currentTheme = "dark";
    icon.textContent = "☀️";
  } else {
    htmlEl.setAttribute("theme", "light");
    currentTheme = "light";
    icon.textContent = "🌒";
  }

  localStorage.setItem("theme", currentTheme);
  playSound(soundOpenCell);
}

export { switchTheme };
