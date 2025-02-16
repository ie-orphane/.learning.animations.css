function highlight(lang, code) {
    if (!code || !lang) {
        return "";
    }
    if (lang == "html") {
        return code.replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/(&lt;)(\/?[a-zA-Z0-9]+)(.*?)(&gt;)/g, (match, open, tag, attr, close) => {
            attr = attr.replace(/([a-zA-Z-]+)(=)(["'])(.*?)(["'])/g, '<span class="attribute">$1</span>$2<span class="value">$3$4$5</span>');
            return `<span class="bracket">${open}</span><span class="tag">${tag}</span>${attr}<span class="bracket">${close}</span>`;
        });
    }
    if (lang == "css") {
        return (
            code
                .replace(/(\d+(\.\d+)?[a-zA-Z%]+)/g, '<span class="number-with-unit">$1</span>')
                .replace(/#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})\b/g, '<span class="hex-color">$&</span>')
                .replace(/([#\.a-zA-Z0-9\-]+(?=\s*\{))/g, '<span class="selector">$1</span>')
                .replace(/\b([a-zA-Z\-]+)(?=\s*:)/g, '<span class="property">$1</span>')
                .replace(/([a-zA-Z\-]+(?=\s*\())/g, '<span class="function">$1</span>')
                .replace(/(@[a-zA-Z\-]+)(?=\s)/g, '<span class="at-rule">$1</span>')
        )
    }
}

document.querySelectorAll("textarea.editor").forEach(
    textarea => {
        if (
            !textarea.nextElementSibling.classList.contains("highlighted") ||
            textarea.nextElementSibling.tagName != "CODE"
        ) return

        textarea.nextElementSibling.innerHTML = highlight(
            textarea.dataset?.lang,
            textarea.dataset?.code?.replace(/\\n/g, '\n').replace(/\\t/g, '\t')
        )

        if (!textarea.dataset?.target) return

        textarea.dataset.target
            .split(' ')
            .filter(target => target != '')
            .forEach(target => {
                const iframe = document.querySelector(`iframe#${target}`);
                if (!iframe) return
                if (textarea.dataset?.lang == "html") {
                    iframe.contentDocument.body.innerHTML = textarea.nextElementSibling.textContent
                }
                else if (textarea.dataset?.lang == "css") {
                    iframe.contentDocument.head.innerHTML = `<style>\n${textarea.nextElementSibling.textContent}</style>`
                }
            })
    }
)

function show(ele) {
    document.querySelectorAll(".file.multiple").forEach(ele => {
        const code = document.querySelector(`code#${ele.dataset?.code}`)
        const iframe = document.querySelector(`iframe#${ele.dataset?.iframe}`)
        if (code && code.style.getPropertyValue("display") != "none") {
            code.style.display = "none";
        }
        if (iframe && iframe.style.getPropertyValue("display") != "none") {
            iframe.style.display = "none";
        }
        ele.classList.remove("selected")
    })
    const code = document.querySelector(`code#${ele.dataset?.code}`)
    const iframe = document.querySelector(`iframe#${ele.dataset?.iframe}`)
    code.style.display = null
    iframe.style.display = null
    ele.classList.add("selected")
}