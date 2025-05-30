function highlight(lang, code) {
  if (!code || !lang) {
    return "";
  }
  if (lang == "html") {
    return code
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(
        /(&lt;)(\/?[a-zA-Z0-9]+)(.*?)(&gt;)/g,
        (match, open, tag, attr, close) => {
          attr = attr.replace(
            /([a-zA-Z-]+)(=)(["'])(.*?)(["'])/g,
            '<span class="html-attribute">$1</span>$2<span class="html-value">$3$4$5</span>'
          );
          return `<span class="html-bracket">${open}</span><span class="html-tag">${tag}</span>${attr}<span class="html-bracket">${close}</span>`;
        }
      );
  }
  if (lang == "css") {
    return code
      .replace(
        /(\d+(\.\d+)?[a-zA-Z%]+)/g,
        '<span class="css-number-with-unit">$1</span>'
      )
      .replace(
        /#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})\b/g,
        '<span class="css-hex-color">$&</span>'
      )
      .replace(
        /([#\.a-zA-Z0-9\-]+(?=\s*\{))/g,
        '<span class="css-selector">$1</span>'
      )
      .replace(
        /\b([a-zA-Z\-]+)(?=\s*:)/g,
        '<span class="css-property">$1</span>'
      )
      .replace(
        /([a-zA-Z\-]+(?=\s*\())/g,
        '<span class="css-function">$1</span>'
      )
      .replace(/(@[a-zA-Z\-]+)(?=\s)/g, '<span class="css-at-rule">$1</span>');
  }
}

document.querySelectorAll("textarea.editor").forEach((textarea) => {
  if (
    !textarea.nextElementSibling.classList.contains("highlighted") ||
    textarea.nextElementSibling.tagName != "CODE"
  )
    return;
  textarea.nextElementSibling.innerHTML = highlight(
    textarea.dataset?.lang,
    textarea.dataset?.code?.replace(/\\n/g, "\n").replace(/\\t/g, "\t")
  );

  if (!textarea.dataset?.target) return;
  textarea.dataset.target
    .split(" ")
    .filter((target) => target != "")
    .forEach((target) => {
      const iframe = document.querySelector(`iframe#${target}`);
      if (!iframe) return;
      if (textarea.dataset?.lang == "html") {
        iframe.contentDocument.body.innerHTML =
          textarea.nextElementSibling.textContent;
      } else if (textarea.dataset?.lang == "css") {
        style = iframe.contentDocument.createElement("style");
        style.id = textarea.dataset?.type === "static" ? "static" : "dynamic";
        style.innerHTML = textarea.nextElementSibling.textContent;
        iframe.contentDocument.head.appendChild(style);
      }
    });
});

function show(ele) {
  document
    .querySelectorAll(
      ele.dataset?.group
        ? `.file.multiple[data-group='${ele.dataset?.group}']`
        : ".file.multiple"
    )
    .forEach((ele) => {
      const code = document.querySelector(`code#${ele.dataset?.code}`);
      const iframe = document.querySelector(`iframe#${ele.dataset?.iframe}`);
      if (code && code.style.getPropertyValue("display") != "none") {
        code.style.display = "none";
      }
      if (iframe && iframe.style.getPropertyValue("display") != "none") {
        iframe.style.display = "none";
      }
      ele.classList.remove("selected");
    });
  const code = document.querySelector(`code#${ele.dataset?.code}`);
  const iframe = document.querySelector(`iframe#${ele.dataset?.iframe}`);
  if (code && code.style.getPropertyValue("display") == "none") {
    code.style.display = null;
  }
  if (iframe && iframe.style.getPropertyValue("display") == "none") {
    iframe.style.display = null;
  }
  ele.classList.add("selected");
}

function sync_scroll(textarea) {
  if (
    !textarea.nextElementSibling.classList.contains("highlighted") ||
    textarea.nextElementSibling.tagName != "CODE"
  )
    return;
  textarea.nextElementSibling.scrollTop = textarea.scrollTop;
  textarea.nextElementSibling.scrollLeft = textarea.scrollLeft;
}

function check_tab(textarea, event) {
  if (event.key == "Tab") {
    event.preventDefault();
    let before_tab = textarea.value.slice(0, textarea.selectionStart);
    let after_tab = textarea.value.slice(
      textarea.selectionEnd,
      textarea.value.length
    );
    let cursor_pos = textarea.selectionEnd + 1;
    textarea.value = before_tab + "\t" + after_tab;
    textarea.selectionStart = cursor_pos;
    textarea.selectionEnd = cursor_pos;
    update(textarea);
  }
}

function update(textarea) {
  if (
    !textarea.nextElementSibling.classList.contains("highlighted") ||
    textarea.nextElementSibling.tagName != "CODE"
  )
    return;
  textarea.nextElementSibling.innerHTML =
    highlight(textarea.dataset?.lang, textarea.value) + "\n";
  const iframe = document.querySelector(`iframe#${textarea.dataset.target}`);
  if (!iframe) return;
  if (textarea.dataset?.lang == "html") {
    iframe.contentDocument.body.innerHTML =
      textarea.nextElementSibling.textContent;
  } else if (textarea.dataset?.lang == "css") {
    iframe.contentDocument.head.querySelector("style#dynamic").innerHTML =
      textarea.nextElementSibling.textContent;
  }
}

document.querySelectorAll("textarea.editor.cached").forEach((ele) => {
  if (!ele.dataset.key) {
    console.warn("editor missing data-key", ele);
    return;
  }
  ele.value = localStorage.getItem(ele.dataset.key) || "";
  let timeout;
  ele.addEventListener("input", () => {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      localStorage.setItem(ele.dataset.key, ele.value);
    }, 500);
  });
  update(ele);
});
