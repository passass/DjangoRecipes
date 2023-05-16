const recipe_createbutton = document.getElementById("recipe_createbutton");
const recipe_image = document.getElementById("recipe_image");
const recipe_title = document.getElementById("recipe_title");
const recipe_desc = document.getElementById("recipe_desc");
const recipe_cookinst = document.getElementById("recipe_cookinst");
const error_text = document.getElementById("error_text");

const recipe_category = $('#recipe_category')[0];
const recipe_uploadblock = $('#recipe_uploadblock')[0];

function hide(el) {
    el.style.visibility = "hidden";
}

function show(el) {
    el.style.visibility = "visible";
}

hide(recipe_uploadblock)

if (recipe_category) {
    $.ajax({
        url: `/api/v1/recipe/categories`,
        type: 'GET',
        success: (result) => {
            let categories = result['content']
            if (recipe_category) {
                Object.entries(categories).forEach(([id, name]) => {
                    let category = document.createElement("option");
                    category.textContent = name;
                    category.value = id;
                
                    recipe_category.appendChild(category);
                })
            }
            show(recipe_uploadblock)
        },
        error: () => {
            show(recipe_uploadblock)
        },
    })
}

var csrftoken = document.querySelector('[name=csrfmiddlewaretoken]');
csrftoken = csrftoken ? csrftoken.value : null;

function check_for_errors() {
    let errors = {}
    if (!recipe_image.files[0]) {
        errors['image'] = "Необходимо добавить картинку"
    }
    if (recipe_title.value == "") {
        errors['title'] = "Необходимо назвать рецепт"
    }
    if (recipe_desc.value == "") {
        errors['desc'] = "Необходимо описать рецепт"
    }
    if (recipe_cookinst.value == "") {
        errors['cookinst'] = "Необходимо написать инструкцию"
    }
    let keys = Object.keys(errors)
    error_text.innerHTML = '';
    if (keys.length > 0) {
        
        keys.forEach((item, i, array) => {
            let error_text_panel = document.createElement("p")
            error_text.appendChild(error_text_panel)
            error_text_panel.textContent = errors[item]
        });
        return true
    }
    return false
}

recipe_createbutton.onclick = () => {
    if (check_for_errors()) {
        return
    }

    var formData = new FormData();

    formData.append("title", recipe_title.value);
    formData.append("desc", recipe_desc.value);
    formData.append('category', recipe_category.value);
    formData.append('cookinst', recipe_cookinst.value);
    formData.append('image', recipe_image.files[0]);

    $.ajax({
        headers: {'X-CSRFToken': csrftoken},
        url: `/api/v1/recipe/create`,
        data: formData,
        processData: false,  // tell jQuery not to process the data
        contentType: false,  // tell jQuery not to set contentType
        enctype: 'multipart/form-data',
        type: 'POST',
        success: (result) => {
            let data = result;
            if (data["status"] == 200) {
                window.location.replace(`/recipe/`);
                document.location.href=`/recipe/`;
            }
        },
        error: () => {
        },
    });
}