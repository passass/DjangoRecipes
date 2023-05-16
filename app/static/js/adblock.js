let is_ad_name = (el) => {
    return el.className && (el.className.includes("ad")) || el.id && (el.id.includes("ad"));
}

function check_for_ad(el) {
    if (!el.tagName) return false;
    let tagname = el.tagName.toLowerCase();
    
    if (tagname === "script") {
        if ((el.src.includes("ad") || el.src.includes("mail")) & !el.src.includes("adblock") & !el.src.includes("jquery")) {
            return true
        }
    }
    else if (tagname === "ins") {
        return true
    }
    else if (tagname === "iframe" || tagname === "frame") {
        return true
    }
    else if (tagname === "div") {
        for (let i=0; i < el.childNodes.length; i++) {
            let i_el = el.childNodes[i];
            if (i_el.tagName && (i_el.tagName === "IFRAME" || is_ad_name(i_el))) {
                return true
            }
            if (i_el.tagName === "DIV") {
                for (let i=0; i < i_el.childNodes.length; i++) {
                    let i_el2 = i_el.childNodes[i];
                    if (i_el2.tagName && (i_el2.tagName === "IFRAME" || is_ad_name(i_el2))) {
                        return true
                    }
                }
            }
        }
    }

    return false
}

let attempts = 0

var timerId;

var start_timer = () => {
    var timerId = setTimeout(() => {

        for (let i=0; i < document.head.childNodes.length; i++) {
            let el = document.head.childNodes[i];
            if (check_for_ad(el)) el.parentNode.removeChild(el);
        }

        for (let i=0; i < document.body.childNodes.length; i++) {
            let el = document.body.childNodes[i];
            if (check_for_ad(el)) el.parentNode.removeChild(el);
        }
        
        if (attempts < 70) {
            attempts++
            start_timer()
        } else {
            clearTimeout(timerId)
        }
    }, 100);
}

start_timer()
