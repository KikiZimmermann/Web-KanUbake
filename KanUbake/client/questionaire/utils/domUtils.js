/*
  DOM Utilities

  This file contains small helper functions for working with HTML elements.
  These functions keep repeated DOM code out of the renderer and main script.
*/

export function getElement(id) {
    return document.getElementById(id);
}

export function showElement(element) {
    if (element) {
        element.classList.remove("hidden");
    }
}

export function hideElement(element) {
    if (element) {
        element.classList.add("hidden");
    }
}

export function clearElement(element) {
    if (element) {
        element.innerHTML = "";
    }
}

export function createElement(tagName, className = "", textContent = "") {
    const element = document.createElement(tagName);

    if (className) {
        element.className = className;
    }

    if (textContent) {
        element.textContent = textContent;
    }

    return element;
}

export function removeElementsByClass(className) {
    document.querySelectorAll(`.${className}`).forEach((element) => {
        element.remove();
    });
}

export function removeClassFromElements(className) {
    document.querySelectorAll(`.${className}`).forEach((element) => {
        element.classList.remove(className);
    });
}