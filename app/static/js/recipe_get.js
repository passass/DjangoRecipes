function hide(el) {
    el.style.visibility = "hidden";
}

function show(el) {
    el.style.visibility = "visible";
}

var csrftoken = document.querySelector('[name=csrfmiddlewaretoken]');
csrftoken = csrftoken ? csrftoken.value : null;
const recipe_image = document.getElementById("recipe_image")
const recipe_title = document.getElementById("recipe_title")
const recipe_desc = document.getElementById("recipe_desc")
const recipe_owner = document.getElementById("recipe_owner")
const recipe_category = document.getElementById("recipe_category")
const recipe_deletebutton = document.getElementById("recipe_deletebutton")
const recipe_visits = document.getElementById("recipe_visits")
var categories = []


const is_owner = recipe_title.tagName == "INPUT"

const done = {
    'categories': false,
    'data': false
}

hide(recipe_image); hide(recipe_title); hide(recipe_desc); hide(recipe_category);
if (!is_owner) {
    hide(recipe_owner)
    done.categories = true
}
var choiced_category = null

$.ajax({
    url: `/api/v1/recipe/categories`,
    type: 'GET',
    success: (result) => {
        categories = result['content'];

        done.categories = true

        checkIfAllReady()
    }
})

const url = window.location.href.split("/");
const recipe_id = url[url.length - 1]

$.ajax({
    url: `/api/v1/recipe/${recipe_id}`,
    type: 'GET',
    success: (result) => {
        let data = result['content'];
        if (result["status"] == 200) {
            recipe_image.src = data['image'];
            recipe_visits.textContent = `Уникальных посетителей: ${data['visits']}`
            
            if (data['category'] != null) {
                choiced_category = data['category']
            }
            if (is_owner) {

                recipe_title.value = data['title'];
                recipe_desc.value = data['desc'];

                recipe_owner.textContent = `Автор: Вы`;

                done.data = true

                checkIfAllReady()
            } else {
                recipe_title.textContent = `Название: ${data['title']}`;
                let description = data['desc'].replace(/(\r\n|\n|\r)/gm, "<br>");
                recipe_desc.innerHTML = `
                <p>
                Описание:
                <br>
                ${description}
                </p>
                `;
                let userid = data['owner']
                $.ajax({
                    url: `/api/v1/user/${userid}`,
                    type: 'GET',
                    success: (result) => {
                        let data = result['content'];
                        if (result["status"] == 200) {
                            recipe_owner.innerHTML = `Автор: <a id='recipe_owner_link'>${data['name']}</a>`
                            $('#recipe_owner_link')[0].href = `/user/${userid}`
                            done.data = true

                            checkIfAllReady()
                        }
                    },
                    error: () => {

                        done.data = true

                        checkIfAllReady()
                    }
                });
            }

        }
    },
});

function checkIfAllReady() {
    if (Object.values(done).every(elem => elem)) {
        if (categories.length > 0) {
            if (is_owner) {
                categories.forEach((item, i) => {
                    let el = document.createElement("option")
                    el.value = i + 1
                    el.textContent = item
                    recipe_category.appendChild(el)
                })
                recipe_category.selectedIndex = choiced_category ? choiced_category : 0
            } else {
                if (choiced_category != null) {
                    recipe_category.textContent = `Категория: ${categories[choiced_category - 1]}`
                } else {
                    recipe_category.textContent = `Категория: не указана`
                }
            }
        } else {
            recipe_category.textContent = `Категория: не указана`
        }
        show(recipe_owner);
        show(recipe_image);
        show(recipe_title);
        show(recipe_desc);
        show(recipe_category);
    }
}

// DELETE BUTTON

if (recipe_deletebutton) {
    recipe_deletebutton.onclick = () => {
        $.ajax({
            headers: {'X-CSRFToken': csrftoken},
            url: `/api/v1/recipe/${recipe_id}/delete`,
            type: 'POST',
            success: (result) => {
                let data = result;
                if (data["status"] == 200) {
                    window.location.replace(`/recipe/`);
                    document.location.href=`/recipe/`;
                }
            },
            //error: sync_div_timer_func,
        });
    }
}

// SAVE BUTTON

const recipe_savebutton_complete = document.getElementById("recipe_savebutton_complete");
const recipe_savebutton = document.getElementById("recipe_savebutton");
let request_sended = false;

function show_loading_text() {
    recipe_savebutton_complete.textContent = "Загрузка";
}

function show_complete_text(is_error, errortext=null) {
    if (is_error) {
        recipe_savebutton_complete.textContent = errortext ? errortext : "Ошибка";
    } else {
        recipe_savebutton_complete.textContent = "Готово";
    }
}

if (recipe_savebutton) {
    request_sended = true
    recipe_savebutton.onclick = () => {
        show_loading_text();

        var formData = new FormData();

        if (recipe_title.value.length > 60) {
            show_complete_text(true, "Слишком большое название")
            return
        }

        if (recipe_desc.value.length > 1500) {
            show_complete_text(true, "Слишком большое описание")
            return
        }
        formData.append("title", recipe_title.value);
        formData.append("desc", recipe_desc.value);
        formData.append("category", recipe_category.value);
        formData.append('file', $('#recipe_image_upload')[0].files[0]);

        $.ajax({
            headers: {'X-CSRFToken': csrftoken},
            url: `/api/v1/recipe/${recipe_id}/save`,
            data: formData,
            processData: false,  // tell jQuery not to process the data
            contentType: false,  // tell jQuery not to set contentType
            enctype: 'multipart/form-data',
            type: 'POST',
            success: (result) => {
                request_sended = false;
                let data = result;
                if (data["status"] == 200) {
                    show_complete_text(false);
                    window.location.replace(`/recipe/`);
                    document.location.href=`/recipe/`;
                } else {
                    show_complete_text(true)
                }
            },
            error: () => {
                request_sended = false
                show_complete_text(true)
            },
        });
    }
}