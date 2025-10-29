"use strict";

document.addEventListener("DOMContentLoaded", () => {
  const pages = document.querySelectorAll(".page");
  const navs = document.querySelectorAll(".navigation .nav");

  const targetByIndex = [
    "inventory--page",
    "shopping-lists--page",
    "recipes--page",
    "settings--page",
  ];

  function showPage(targetClass) {
    pages.forEach((p) =>
      p.classList.toggle("active-page", p.classList.contains(targetClass))
    );
  }

  navs.forEach((nav, i) => {
    const targetClass = targetByIndex[i];
    const go = () => showPage(targetClass);
    nav.addEventListener("click", go);
    nav.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        go();
      }
    });
  });
});
