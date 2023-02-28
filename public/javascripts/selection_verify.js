// #region Collect document elements
let ruleElements = []
for (let i = 0; document.getElementsByClassName("r" + i.toString()).length > 0; i++) {
    ruleElements.push(document.getElementsByClassName("r" + i.toString())[0])
}
let checkBoxes = {}
const ids = []
const hours = {}
let _checkBoxes = document.getElementsByClassName("subject_checkbox")
for (let i = 0; i < _checkBoxes.length; i++) {
    const checkBox = _checkBoxes[i]
    checkBoxes[checkBox.id] = checkBox
    ids.push(checkBox.id)
    hours[checkBox.id] = parseInt(checkBox.parentElement.parentElement.children[1].innerHTML)
}
// #endregion

function setgreen(el) {
    if (el.classList.contains("alert-primary")) { el.classList.remove("alert-primary") }
    if (el.classList.contains("alert-danger")) { el.classList.remove("alert-danger") }
    el.classList.add("alert-success")
}
function setred(el) {
    if (el.classList.contains("alert-primary")) { el.classList.remove("alert-primary") }
    if (el.classList.contains("alert-success")) { el.classList.remove("alert-success") }
    el.classList.add("alert-danger")
}
// Counts how many subjects in li are selected
function countAppl(li) {
    let cnt = 0
    li.forEach(cid => {
        if (checkBoxes[cid].checked) {
            cnt++
        }
    })
    return cnt
}
function applyRule(val, el) {
    if (val) {
        setgreen(el)
        return true
    } else {
        setred(el)
        return false
    }
}
function applyHCount(val, el) {
    if (el.classList.contains("alert-danger")) { el.classList.remove("alert-danger") }
    if (el.classList.contains("alert-success")) { el.classList.remove("alert-success") }
    if (el.classList.contains("alert-warning")) { el.classList.remove("alert-warning") }
    if (val < 35) {
        el.classList.add("alert-danger")
        return false
    } else if (val === 35) {
        el.classList.add("alert-warning")
    } else {
        el.classList.add("alert-success")
    }
    return true
}
let ruleset
fetch("/ruleset")
    .then(r => r.json())
    .then(data => { ruleset = data })
    .then(() => verifyAll())

// Applies all rules
function verifyAll() {
    if (ruleset === undefined) {
        return false
    }

    let allApply = true
    ruleset.forEach(rule => {
        if (rule.subs === undefined) { return }
        let cnt = countAppl(rule.subs)
        let truth = true
        if (rule.ge) {
            truth &= cnt >= rule.ge
        }
        if (rule.le) {
            truth &= cnt <= rule.le
        }
        allApply &= applyRule(truth, ruleElements[rule._number])
    })

    // Wochenstunden
    let cnt = 0
    for (let i = 0; i < ids.length; i++) {
        if (checkBoxes[ids[i]].checked) {
            cnt += hours[ids[i]]
        }
    }
    let el = document.getElementById("hcount")
    el.innerHTML = cnt.toString()
    allApply &= applyHCount(cnt, el)
    if (allApply) {
        setgreen(document.getElementById("sel_valid_alert"))
    } else {
        setred(document.getElementById("sel_valid_alert"))
    }

    let btnEl = document.getElementById("submit_btn")
    if (btnEl.hasAttribute("disabled") && allApply) {
        btnEl.removeAttribute("disabled")
    } else if (!allApply) {
        btnEl.setAttribute("disabled", "")
    }
}
// Fetches current selection
// eslint-disable-next-line no-unused-vars
function loadCurrentSelection() {
    let uid = document.getElementById("uid").content
    fetch("/api/selection?uid=" + uid)
        .then(r => r.json())
        .then(data => {
            ids.forEach(sub => {
                checkBoxes[sub].checked = false
            })
            data.selected.forEach(sub => {
                if (checkBoxes[sub]) {
                    checkBoxes[sub].checked = true
                }
            })
            verifyAll()
        })
}
