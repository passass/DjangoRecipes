const adminpanel_categories = $("#adminpanel_categories")[0]
const adminpanel_name = $('#adminpanel_categories_name')[0]
const adminpanel_categories_choosetodelete = $("#adminpanel_categories_choosetodelete")[0]
var csrftoken = document.querySelector('[name=csrfmiddlewaretoken]');
csrftoken = csrftoken ? csrftoken.value : null;


$("#adminpanel_categories_create")[0].onclick = () => {
    var formData = new FormData();
    let name = adminpanel_name.value;
    if (name.length == 0) {
        return
    }
    formData.append("name", name);

    $.ajax({
        headers: {'X-CSRFToken': csrftoken},
        url: `/api/v1/recipe/categories/create`,
        processData: false,
        contentType: false,
        data: formData,
        type: 'POST',
        success: (result) => {
            adminpanel_name.value = ''
        },
    });
}

$.ajax({
    url: `/api/v1/recipe/categories`,
    type: 'GET',
    success: (result) => {
        Object.entries(result['content']).forEach(([id, name]) => {
            let el = document.createElement("option");
            el.textContent = name;
            el.value = id;
            adminpanel_categories_choosetodelete.appendChild(el);
        })
    },
});

$("#adminpanel_categories_delete")[0].onclick = () => {
    var formData = new FormData();
    formData.append("id", adminpanel_categories_choosetodelete.value);

    $.ajax({
        headers: {'X-CSRFToken': csrftoken},
        url: `/api/v1/recipe/categories/delete`,
        processData: false,
        contentType: false,
        data: formData,
        type: 'POST',
        success: (result) => {
            document.location.reload();
        },
    });
}