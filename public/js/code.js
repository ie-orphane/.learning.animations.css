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

document.querySelectorAll(".code-block.input").forEach(
    ele => {
        ele.querySelector("code.highlighted").innerHTML = highlight(
            ele.dataset?.lang,
            ele.querySelector("textarea.editor")?.dataset?.code?.replace(/\\n/g, '\n').replace(/\\t/g, '\t')
        )
        if (ele.dataset?.lang == "html") {
            document.querySelector(`iframe#${ele.dataset?.target}`).contentDocument.body.innerHTML = ele.querySelector("code.highlighted").textContent
        }
        else if (ele.dataset?.lang == "css") {
            document.querySelector(`iframe#${ele.dataset?.target}`).contentDocument.head.innerHTML = `<style>\n${ele.querySelector("code.highlighted").textContent}</style>`
        }
    }
)