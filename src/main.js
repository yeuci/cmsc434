"use strict";

document.addEventListener("DOMContentLoaded", () => {
  const pages = document.querySelectorAll(".page");
  const navs = document.querySelectorAll(".navigation .nav");

  navs[0].classList.add("active");

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

    // might come back to... nav bg
    navs.forEach((nav, i) => {
      const target = targetByIndex[i];
      nav.classList.toggle("active", target === targetClass);
    });
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
