var recipe_blocks = $("#recipe_blocks")[0];
var recipe_order_by_categories = $(`#recipe_order_by_categories`)[0];

const searchParams = new URLSearchParams(window.location.search);

const recipe_filters = {
    'urlForRecipes': `/api/v1/recipe/?${searchParams.toString()}`,
}


function hide(el) {
    el.style.visibility = "hidden";
}

function show(el) {
    el.style.visibility = "visible";
}

function restartwebsite() {
    let url = "/recipe/?" + searchParams.toString();
    window.location.replace(url);
    document.location.href=url;
}

hide(recipe_blocks)
let categories = null

const users = {};
const recipe_blocks_wait_author = {};

let recipe_blocks_count = 0;
let recipe_blocks_max = 999;

let proceed_if_compelete = () =>  {
    if (recipe_blocks_count == recipe_blocks_max) {
        if (categories != null) {

            if (recipe_blocks_count) {
                recipe_blocks.childNodes.forEach((item, i, array) => {
                    let recipeblock_id = item.id.split("_").pop();
                    let category_block = $(`#recipe_cat_${recipeblock_id}`)[0];
                    if (categories != false) {
                        let selected_category = $(`#recipe_cat_selected_${recipeblock_id}`)[0].value;
                        if (selected_category != "null") {
                            category_block.textContent = `Категория: ${categories[Number(selected_category) - 1]}`;
                        } else {
                            category_block.textContent = `Категория: не указана`;
                        }
                    } else {
                        category_block.textContent = `Категория: неизвестно`;
                    }
                })
            }

            if (recipe_order_by_categories) {
                categories.forEach((item, i) => {
                    let category = document.createElement("option");
                    category.textContent = item;
                    category.value = i + 1;
                
                    recipe_order_by_categories.appendChild(category);
                })
    
                let choiced_category = searchParams.get('category');
    
                if (choiced_category) {
                    recipe_order_by_categories.selectedIndex = Number(choiced_category)
                }
            }
        }
        show(recipe_blocks);
    }
}

let add_recipe_block = (content) => {
    let recipe_id = content['id'];

    let recipe_block = document.createElement("a");
    recipe_block.id = `recipe_block_${recipe_id}`;
    recipe_block.href = `/recipe/${recipe_id}`;
    recipe_block.innerHTML =
    `
        <div class="picture_block">
            <img class="picture_block_item_img" id="recipe_image" src="${content['image']}">
            <input type="hidden" id="recipe_cat_selected_${recipe_id}" value="${content['category']}"></input>
            <p class="picture_block_item" id="recipe_visits_${recipe_id}">Уникальных посетителей</p>
            <p class="picture_block_item" id="recipe_title_${recipe_id}">Название</p>
            <p class="picture_block_item" id="recipe_cat_${recipe_id}">Категория</p>
            <p class="picture_block_item" id="recipe_desc_${recipe_id}">Описание</p>
            <p class="picture_block_item" id="recipe_owner_${recipe_id}">Автор: Неизвестен</p>
        </div>
    `;
    

    recipe_blocks.appendChild(recipe_block);

    $(`#recipe_visits_${recipe_id}`)[0].textContent = `Уникальных посетителей: ${content['visits']}`;
    $(`#recipe_desc_${recipe_id}`)[0].textContent = `Описание: ${content['desc']}`;
    $(`#recipe_title_${recipe_id}`)[0].textContent = `Название: ${content['title']}`;

    let user_id = content["owner"]

    if (!(user_id in users)) {
        
        if (!(user_id in recipe_blocks_wait_author)) {
            recipe_blocks_wait_author[user_id] = [];
            $.ajax({
                url: `/api/v1/user/${user_id}`,
                type: 'GET',
                success: (result) => {
                    let data2 = result['content'];
                    if (result["status"] == 200) {
                        recipe_blocks_count++;
                        users[user_id] = data2['name'];
                        console.log(current_user);
                        alert(`${current_user.name} == ${users[user_id]}`);
                        let text = `Автор: ${current_user.name == users[user_id] ? 'Вы' : users[user_id]}`;
                        $(`#recipe_owner_${recipe_id}`)[0].textContent = text;
                        recipe_blocks_wait_author[user_id].forEach((element) => {
                            recipe_blocks_count++;
                            $(`#recipe_owner_${element}`)[0].textContent = text;
                        })
                        delete recipe_blocks_wait_author[user_id];
                        proceed_if_compelete(recipe_id)
                    }
                },
                error: () => {
                    recipe_blocks_count++;
                    recipe_blocks_count += recipe_blocks_wait_author[user_id].length;
                    proceed_if_compelete(recipe_id);
                }
            });
        } else {
            recipe_blocks_wait_author[user_id].push(recipe_id);
        }
        
    } else {
        recipe_blocks_count++;
        $(`#recipe_owner_${recipe_id}`)[0].textContent = `Автор: ${users[user_id]}`;
        proceed_if_compelete(recipe_id)
    }
}

function analyzeAllRecipes() {
    $.ajax({
        url: `/api/v1/recipe/categories`,
        type: 'GET',
        success: (result) => {
            categories = result['content'];
            proceed_if_compelete()
        },
        error: () => {
            categories = false
            proceed_if_compelete()
        },
    })

    $.ajax({
        url: recipe_filters['urlForRecipes'],
        type: 'GET',
        success: (result) => {
            if (result["status"] == 200) {
    
                let data = result['content'];
    
                recipe_blocks_max = data.length;
    
                if (recipe_blocks_max) {
                    
                    data.forEach(content => {
                        add_recipe_block(content)
                    });
    
                } else {
                    let text = document.createElement("center");
                    text.textContent = `Ничего не найдено`;
                    recipe_blocks.appendChild(text);
    
                    proceed_if_compelete()
                }
            }
        },
    });
    
}
// SEACRHING

const recipe_search_input = document.getElementById("recipe_search_input");
const recipe_search_button = document.getElementById("recipe_search_button");

recipe_search_button.onclick = () => {
    let search_text = recipe_search_input.value;

    searchParams.set('search', search_text);

    restartwebsite()
}

// ORDER BY CATEGORIES

if (recipe_order_by_categories) {
    recipe_order_by_categories.onchange = () => {
        let category = recipe_order_by_categories.value;
        searchParams.set('category', category);
        restartwebsite();
    }
}


// ORDER BY

const recipe_order_by = $("#recipe_order_by")[0];

if (recipe_order_by) {
    let init_order_by = searchParams.get('order-by');
    
    for (let i=0; i < recipe_order_by.options.length; i++) {
        if (recipe_order_by.options[i].value == init_order_by) {
            recipe_order_by.selectedIndex = i;
            break;
        }
    }
    
    recipe_order_by.onchange = () => {
        let order_by = recipe_order_by.value;
    
        searchParams.set('order-by', order_by);
    
        restartwebsite();
    }
}

// PAGES

const curpage = $('#curpage')[0].value;

if (curpage) {

    const maxpages = $('#maxpages')[0].value;
    
    function SetToButtonChangingPage(object, diff = 1) {
        object.href = window.location.pathname + `?page=${curpage - diff}`;
    };
    if (curpage != 1) {
        $("a[name='lastpage']").each(function() {
            SetToButtonChangingPage(this);
        });
        
    }
    
    if (curpage != maxpages){
        $("a[name='nextpage']").each(function() {
            SetToButtonChangingPage(this, -1);
        });
    }
}