const recipe_blocks = document.getElementById("recipe_blocks");

function hide(el) {
    el.style.visibility = "hidden";
}

function show(el) {
    el.style.visibility = "visible";
}

hide(recipe_blocks)

const searchParams = new URLSearchParams(window.location.search);
const users = {};
const recipe_blocks_wait_author = {};
let recipe_blocks_count = 0;
let recipe_blocks_max = 999;

function proceed_if_compelete() {
    if (recipe_blocks_count == recipe_blocks_max) {
        show(recipe_blocks);
    }
}

function add_recipe_block(content) {
    let recipe_id = content['id'];

    let recipe_block = document.createElement("a");
    recipe_block.id = `recipe_block_${recipe_id}`;
    recipe_block.href = "/recipe/" + recipe_id
    recipe_block.innerHTML =
    `
        <div class="picture_block">
            <img class="picture_block_item_img" id="recipe_image" src="${content['image']}">
            <p class="picture_block_item" id="recipe_visits_${recipe_id}">Уникальных посетителей</p>
            <p class="picture_block_item" id="recipe_title_${recipe_id}">Название</p>
            <p class="picture_block_item" id="recipe_cat_${recipe_id}">Категория</p>
            <p class="picture_block_item" id="recipe_desc_${recipe_id}">Описание</p>
            <p class="picture_block_item" id="recipe_owner_${recipe_id}">Автор: Неизвестен</p>
        </div>
    `;
    recipe_blocks.appendChild(recipe_block);

    $(`#recipe_visits_${recipe_id}`)[0].textContent = `Уникальных посетителей: ${content['visits']}`;
    $(`#recipe_desc_${recipe_id}`)[0].textContent = content['desc'];
    $(`#recipe_title_${recipe_id}`)[0].textContent = content['title'];

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
                        let text = `Автор: ${current_user.name == users[user_id] ? 'Вы' : users[user_id]}`;
                        $(`#recipe_owner_${recipe_id}`)[0].textContent = text;
                        recipe_blocks_wait_author[user_id].forEach((element) => {
                            recipe_blocks_count++;
                            $(`#recipe_owner_${element}`)[0].textContent = text;
                        })
                        delete recipe_blocks_wait_author[user_id];
                        proceed_if_compelete()
                    }
                },
                error: () => {
                    recipe_blocks_count++;
                    recipe_blocks_count += recipe_blocks_wait_author[user_id].length;
                    proceed_if_compelete();
                }
            });
        } else {
            recipe_blocks_wait_author[user_id].push(recipe_id);
        }
        
    } else {
        recipe_blocks_count++;
        $(`#recipe_owner_${recipe_id}`)[0].textContent = `Автор: ${users[user_id]}`;
        proceed_if_compelete()
    }
}



$.ajax({
    url: `/api/v1/recipe/`,
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

                show(recipe_blocks);
            }

        }
        
    },
});



// SEACRHING

const recipe_search_input = document.getElementById("recipe_search_input");
const recipe_search_button = document.getElementById("recipe_search_button");

recipe_search_button.onclick = () => {
    let search_text = recipe_search_input.value;

    searchParams.set('search', search_text);

    let url = window.location.pathname + "/recipe" + "?" + searchParams.toString();
    window.location.replace(url);
    document.location.href=url;
}