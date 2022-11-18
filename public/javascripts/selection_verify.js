//#region Collect document elements
r_list = [];
for (let i = 0; document.getElementsByClassName("r"+i.toString()).length > 0; i++) {
    r_list.push(document.getElementsByClassName("r"+i.toString())[0]);
}
var check_boxes = {};
const ids = []
const hours = {};
var _check_boxes = document.getElementsByClassName("subject_checkbox")
for (let i = 0; i < _check_boxes.length; i++) {
    const check_box = _check_boxes[i];
    check_box.parentElement.children[1];
    check_boxes[check_box.id] = check_box
    ids.push(check_box.id)
    hours[check_box.id] = parseInt(check_box.parentElement.parentElement.children[1].innerHTML)
}
//#endregion

function setgreen(el) {
    if (el.classList.contains("alert-primary")) {el.classList.remove("alert-primary");}
    if (el.classList.contains("alert-danger")) {el.classList.remove("alert-danger");}
    el.classList.add("alert-success");
}
function setred(el) {
    if (el.classList.contains("alert-primary")) {el.classList.remove("alert-primary");}
    if (el.classList.contains("alert-success")) {el.classList.remove("alert-success");}
    el.classList.add("alert-danger");
}
//Counts how many subjects in li are selected
function count_appl(li) {
    var cnt = 0;
    li.forEach(cid => {
        if (check_boxes[cid].checked) {
            cnt++;
        }
    });
    return cnt;
}
function apply_rule(val, el) {
    if (val) {
        setgreen(el);
        return true;
    }
    else {
        setred(el);
        return false;
    }
}
var ruleset = undefined
fetch("/ruleset")
    .then(r => r.json())
    .then(data => ruleset = data)
    .then(() => verify_all())

//Applies all rules
function verify_all() {
    if (ruleset === undefined) {
        return false
    }

    var all_apply = true;
    ruleset.forEach(rule => {
        if (rule["subs"] === undefined) {return}
        var cnt = count_appl(rule.subs)
        let truth = true
        if (rule.ge) {
            truth &= cnt >= rule.ge
        }
        if (rule.le) {
            truth &= cnt <= rule.le
        }
        all_apply &= apply_rule(truth, r_list[rule._number])
    })

    //Wochenstunden
    cnt = 0;
    for (let i = 0; i < ids.length; i++) {
        if (check_boxes[ids[i]].checked) {
            cnt += hours[ids[i]];
        }        
    }
    var el = document.getElementById("hcount")
    el.innerHTML = cnt.toString();
    all_apply &= apply_rule(cnt >= 35, el);
    btn_el = document.getElementById("submit_btn");
    if (btn_el.hasAttribute("disabled") && all_apply) {
        btn_el.removeAttribute("disabled");
    }
    else if (!all_apply) {
        btn_el.setAttribute("disabled", "");
    }
}
//Fetches current selection
function load_current_selection() {
    let uid = document.getElementById("uid").content
    fetch("/api/selection?uid="+uid)
        .then(r => r.json())
        .then(data => {
            ids.forEach(sub => {
                check_boxes[sub].checked = false
            })
            data.selected.forEach(sub => {
                check_boxes[sub].checked = true
            })
            verify_all()
        })
}