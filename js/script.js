$(document).ready(function(){
  $("#page_wrapper").append(footer);
  
  loadLocalData();

  var current_page = String(window.location.pathname.split("/").slice(-1));
  //For github site
  if(!current_page.includes(".html"))
    current_page += ".html"; 

  switch(current_page){
    // case "index.html":
    //   add_header(0);
    //   break;
    case "restaurants.html":
      addHeader(1);
      prepareRestaurantsPage();
      break;
    case "restaurant.html":
      addHeader();
      prepareRestaurantPage();
      break;
    case "reviews.html":
      addHeader();
      loadRestInfo();
      loadReviews();
      fill_up_shopping_cart();
      break;
    case "new_restaurant.html":
      addHeader();
      $("#rest_form").submit(function(){
        return insertNewRestaurant();
      });
      break;
    case "rest_management.html":
      addHeader();
      prepareRestManagementPage();
      break;
    case "rest_info_modify.html":
      addHeader();
      prepareModifyRestInfoPage();
      break;
    case "account.html":
      addHeader();
      prepareProfilePage();
      break;
    case "change_password.html":
      addHeader();
      prepareChangePasswordPage();
      break;
    default:
      addHeader(0);
      break;
  }  
});

function loadLocalData() {
  if(localStorage.getItem("products") == null){
    localStorage.setItem("restaurants", JSON.stringify(RESTAURANTS));
    localStorage.setItem("ingredients", JSON.stringify(INGREDIENTS));
    localStorage.setItem("products", JSON.stringify(PRODUCTS));
    localStorage.setItem("clients", JSON.stringify(CLIENTS));
    localStorage.setItem("restaurateurs", JSON.stringify(RESTAURATEURS));
  }
}

// Restaurant page ------------------------------------------------------------------------------------------
function prepareRestaurantPage() {
  var restId = Session.getCurrentRestaurant();
  loadRestInfo(restId);
  loadRestMenu(restId, removableItems = false, options = true);
  fill_up_shopping_cart();
}

function loadRestInfo(restId){
  var current_rest = FastFoodAPI.getRestaurant(restId);

  if(current_rest){
    // var logo_data_url = current_rest.logo
    // $("#rest_logo").attr("src", logo_data_url);
    $("#rest_name").html(current_rest.nome)
    
    // var review_n = current_rest.numero_recensioni;
    // $("#review_number").html(review_n);
      
    // Apertura 
    current_day = new Date().getDay();
    var opening_hours = current_rest.orari[current_day];
    for(let range of opening_hours){
      $('#opening_hours').append(`<span>${range}</span>&emsp;`);
    }

    var open = rest_is_open(current_rest);
    var opening_div = document.getElementById("opening_hours");
    if(open){
      opening_div.children[0].innerText = "DISPONIBILE";
      opening_div.style.backgroundColor = "#86c06a";
    }

    var address = current_rest.indirizzo;
    if(address.comune)
      $("#address > div").html(`${address.via}, ${address.civico} - ${address.comune}`);
    else
      $("#address > div").html(`${address.via}, ${address.civico} - ${address.citta}`);

    var telephone = current_rest.telefono;
    $("#telephone > div").html(telephone);

    var meal_vouchers = current_rest.buoni
    $("#vouchers > div").html(meal_vouchers.join(", "));

    var consegna = current_rest.consegna
    $("#delivery > div:nth-child(2)").html(current_rest.consegna.tempo + " min.");
    $("#delivery > div:nth-child(3)").html(current_rest.consegna.costo.toFixed(2) + " &euro;");
    $("#delivery > div:nth-child(4)").html(current_rest.consegna.minimo.toFixed(2) + " &euro;");
  }
}

function loadRestMenu(restId, removableItems = false, options = false){
  var menu_items = FastFoodAPI.getProducts(FastFoodAPI.getRestaurant(restId).menu);
  var category_items_map = new Map();

  loadSearchBar();

  for(let item of menu_items){
    var category = item.categoria;
    if(!category_items_map.has(category)){
      category_items_map.set(category, []);
    }
    var category_items = category_items_map.get(category);
    category_items.push(item);
    category_items_map.set(category, category_items);
  }

  for(let category of category_items_map.keys()){
    let category_id = category.replace(" ", "-");
    let category_div = 
    `<div class="category" id="${category_id}">
      <a href="#${category_id}-collapsible" data-toggle="collapse">${category}<i class="fa fa-chevron-up"></i></a>
    </div>`;
    
    let collapsible_content = `<div class="item_container collapse" id="${category_id}-collapsible">`;
    for(let item of category_items_map.get(category)){
      collapsible_content += getItemBox(item, removableItems, options);
    }
    collapsible_content += "</div>";
    
    $("#menu").append(category_div);
    $("#menu").append(collapsible_content);

    $(`#${category_id}-collapsible`).on({
      "show.bs.collapse": function(){
        $(`#${category_id}>a>i`).attr("class", "fa fa-chevron-down");
        $(`#${category_id}`).css("border-bottom", "unset");
      },
      "hide.bs.collapse": function(){
        $(`#${category_id}>a>i`).attr("class", "fa fa-chevron-up");
        $(`#${category_id}`).css("border-bottom", "solid 0.15em rgb(242,242,242)");
      }
    });
  } 

  $('[data-toggle="popover"]:not(:has(img[src="img/menu_item_placeholder.svg"))').popover({html: true});
  $(".item_options").on({
    "show.bs.collapse": function(){
      $(".menu_item").removeClass("open");
      $(".item_options").collapse("hide");
      $(this).parent().addClass("open");
    },
    "hide.bs.collapse": function(){
      $(this).parent().removeClass("open");
    }
  });

  $(".ingredient").click(function(){
    var li_class = $(this).attr("class");
    if(li_class == "ingredient")
      li_class = "ingredient removed_ingredient";
    else 
      li_class = "ingredient";
    $(this).attr("class", li_class);
  });

  $(".add_item_button").click(add_to_cart);
}

function rest_is_open(rest){
  var current_moment = new Date();
  opening_hours = rest.orari[current_moment.getDay()];

  for(var time_range of opening_hours){
    var range_start = time_range.split("-")[0];
    var range_end = time_range.split("-")[1];

    var opening_time = new Date();
    opening_time.setHours(range_start.split(":")[0]);
    opening_time.setMinutes(range_start.split(":")[1]);
    opening_time.setSeconds(0);

    var closing_time = new Date();
    closing_time.setHours(range_end.split(":")[0]);
    closing_time.setMinutes(range_end.split(":")[1]);
    closing_time.setSeconds(0);

    return opening_time <= current_moment && current_moment <= closing_time;
  }
}

function get_rest_review_number(rest_id){
  var reviews = JSON.parse(data).recensioni;
    var review_n = 0;
    for(let review of reviews){
      if(review.ristorante == rest_id){
        review_n ++;
      }
    }
    return review_n;
}

function getItemBox(item, removableItem = false, options = false){
  var item_img_src = item.foto ? item.foto : "img/menu_item_placeholder.svg";
  var ingredients = FastFoodAPI.getIngredients(item.ingredienti);
  var ingredient_names = [];
  var ingredient_ul;

  if(ingredients.length > 0){
    ingredient_ul = "<ul>";
    for(let ingredient of ingredients){
      ingredient_names.push(ingredient.nome);
      ingredient_ul += `<li class="ingredient" data-id="${ingredient.id}">${ingredient.nome}</li>`;
    }
    ingredient_ul += "</ul>";
  }

  var removeButtonDiv = `
  <button type="button" class="btn btn-info btn-floating">
    <i class="material-icons">remove_circle</i>
  </button>`;

  var itemBox = 
  `<div class="menu_item close_menu_item" data-id="${item.id}">
    <a href="#collapsible-${item.id}" data-toggle="collapse">
      <div class="item_header row">
        <div class="item_photo_wrapper col-2" data-toggle="popover" data-trigger="hover"
        data-content='<img class="item_preview" src="${item_img_src}">'>
          <img class="item_photo" src="${item_img_src}">
        </div>
        <div class="item_desc col-8">
          <span>${item.categoria}</span>
          <h3>${item.nome}</h3>
          <p>${ingredient_names.join(", ")}</p>
        </div>
        <div class="col-2 menu_item_additional_column">
          <div class="item_price">
            ${item.prezzo} &euro;
          </div>
          ${removableItem ? removeButtonDiv : ""}
        </div>
      </div>
    </a>`;
  if (!options) {
    itemBox += 
  "</div>";
  } else {
    `<div class="collapse item_options" id="collapsible-${item.id}">`;

    if(ingredient_ul != undefined){
      itemBox += 
      `<div class="ingredients">
        <h4>INGREDIENTI:</h4>
        <small>Clicca per rimuovere</small>
        ${ingredient_ul}
      </div>`;
    }
    itemBox += 
      `<div class="item_footer">
        <div class="total_cost">
          Totale:
          <strong>${item.prezzo} &euro;</strong>
        </div>
        <div>
          <input class="item_quantity" type="number" value="1" min="1" step="1">
          <button class="add_item_button" class="btn btn-success" type="button">Aggiungi</button>
        </div>
      </div>
    </div>
  </div>`;
  }
  return itemBox;
}

function loadSearchBar(){
  var searched_str;
  $("#search_bar>input").keyup(function(){
    searched_str = this.value;
    if(searched_str.length > 1){
      $("#search_bar i").attr("class", "fa fa-close");
      $("#menu").hide();
      show_search_results(searched_str);
    }
  });

  $("#search_bar button").on("click", function(){
    searched_str = this.value;
    var icon = $("#search_bar i").attr("class");
    if(icon === "fa fa-close"){
      $("#search_bar input").val("");
      $("#search_bar i").attr("class", "fa fa-search");
      $("#search_results").hide();
      $("#menu").show();
    }else{
      $("#search_bar i").attr("class", "fa fa-close");
      $("#menu").hide();
      show_search_results(searched_str);
    }
  });
}

function show_search_results(searched_str){
  var results = `Risultati della ricerca "${searched_str}":`;
  var rest_id = sessionStorage.getItem("current_restaurant");
  var menu = FastFoodAPI.getProducts(FastFoodAPI.getRestaurant(rest_id).menu);

  for(let item of menu){
    if(item.nome.toLowerCase().includes(searched_str.toLowerCase()))
      results += get_item_box(item);
  }
  $("#search_results").html(results);
  $("#search_results").show();
}

function add_to_cart(){
  var quantity = $(this).prev().val();
  var item = $(this).parents(".menu_item")[0];
  var item_id = $(item).data("id");
  var item_footer = $(this).parents(".item_footer")[0];
  var ingredient_container = $(item_footer).prev();
  var ingredient_li = $(ingredient_container).find("li.ingredient:not(.removed_ingredient)");
  var ingredient_ids = [];

  for(let ingredient of ingredient_li){
    ingredient_ids.push($(ingredient).data("id"));
  }

  var product = FastFoodAPI.getProduct(item_id);
  var ingredients = FastFoodAPI.getIngredients(ingredient_ids);

  var order = new Order(product, quantity);
  Cart.addOrder(order);

  fill_up_shopping_cart();
}

// Restaurant management page ----------------------------------------------------------------------------
function prepareRestManagementPage() {
  var restId;

  if (Session.isRestaurateur()) {
    restId = Session.getRestaurantId();
    loadRestInfo(restId);
    loadRestMenu(restId, removableItems = true, options = false);
    $("#modify_rest_info").click(function() {
      location.href = "rest_info_modify.html";
    })
  } else {
    Notifier.restaurateurOnly();
  }
}

// Edit restaurant information page -------------------------------------------------------------------

function prepareModifyRestInfoPage() {
  if (Session.isRestaurateur()) {
    var restId = Session.getRestaurantId();
    var restaurant = FastFoodAPI.getRestaurant(restId);
    $("#name").val(restaurant.nome);
    $("#telephone").val(restaurant.telefono);
    $("#iva").val(restaurant.iva);
    $("#via").val(restaurant.indirizzo.via);
    $("#civic").val(restaurant.indirizzo.civico);
    $("#comune").val(restaurant.indirizzo.comune);
    $("#city").val(restaurant.indirizzo.citta);

    $("#rest_info_form").submit(function(event) {
      modifyRestaurantInfo(event, restId);
    });
  } else {
    Notifier.restaurateurOnly();
  }
}

function modifyRestaurantInfo(event, restId) {
  var form = document.getElementById("rest_info_form");
  var info;

  if (!form.checkValidity()) {
    event.preventDefault();
    $(form).attr("class", "was-validated");
  } else {
    info = {
      nome: $("#name").val(),
      telefono: $("#telephone").val(),
      iva: $("#iva").val(),
      indirizzo: {
        via:$("#via").val(), 
        civico:$("#civic").val(), 
        comune:$("#comune").val(), 
        citta:$("#city").val()
      }
    }
    FastFoodAPI.modifyRestaurant(restId, info);
  }
}


//Shopping cart
function fill_up_shopping_cart(){
  if(!Cart.isEmpty()){
    $("#cart_content").html("<ul></ul>");
    var orders = Cart.getOrders();
    for(let order of orders){
      let order_li = 
      `<li>
        ${order.quantity}
        ${order.product.nome}
      </li>`;
      $("#cart_content > ul").append(order_li);
    }

    $("#cart").append('<button class="btn btn-success" type="button">Checkout</button>');
  }
}


// Restaurants page -----------------------------------------------------------------------------------------------
function prepareRestaurantsPage(){
  var restaurants = JSON.parse(localStorage.getItem("restaurants"));
  if(restaurants){
    var quantity = restaurants.length;
    $("#rest_number").html(quantity);

    var rest_list = "";
    for(let j = 0; j < restaurants.length; j++){
      var rest = restaurants[j];
      var rating = rest.rating;
      var star_rating = get_star_rating(rating);

      let comune = rest.indirizzo.comune == null ? "" : " - " + rest.indirizzo.comune
      rest_list += `
      <div class="rest_item">
        <a class="rest_link" href="restaurant.html" data-rest_id="${j}">
          <h2 class="rest_title">${rest.nome}</h2>
          <p>${rest.indirizzo.via}, ${rest.indirizzo.civico}${comune}</p>
          <a href="recensioni.html">
            <p>${star_rating}</p>
          </a>
        </a>
      </div>
      `;
    }
    $("#rest_list").html(rest_list);

    $(".rest_link").on("click", function(){
      sessionStorage.setItem("current_restaurant", $(this).attr("data-rest_id"));
    });
  }
}

function get_star_rating(rating){
  let star_rating = "";
    if(rating != null){
      rating = rating.toFixed(0);
      star_rating = "<div class='star_rating'>";
      for(let i = 0; i < rating; i++){
        star_rating += '<i class="fa fa-star checked"></i>';
      }
      for(let i = 0; i < 5 - rating; i++){
        star_rating += '<i class="fa fa-star"></i>';
      }
      star_rating += "</div>";
    }
    return star_rating;
}

// Pagina recensioni
function loadReviews(){
  var rest_id = sessionStorage.getItem("current_restaurant");
  var reviews = get_rest_reviews(rest_id);
  var rest_name = FastFoodAPI.getRestaurant(rest_id).nome;
  var avg_review = `<div><strong>${reviews.length} recensioni su ${rest_name.toUpperCase()}</div>`;
  $("#inner_container").html(avg_review);

  if(reviews.length > 0){
    var review_container = "";
    for(let review of reviews){
      let client = FastFoodAPI.getClient(review.cliente);
      let client_name = client != null ? client.nome : "Cliente cancellato";
      let description = review.descrizione != null ? review.descrizione : "";
      let client_img_src = client != null && client.immagine != null? client.immagine : "img/user_icon.png";
      let date = new Date(review.data);
      let time = date.getHours() + ":";
      time += date.getMinutes() < 10 ? "0" + date.getMinutes() : date.getMinutes();
      date = date.getDate() + "/" + date.getMonth() + "/" + date.getFullYear();

      review_container +=
      `<div class="review">
        <div class="desc">
          <div class="item_photo_wrapper">
            <img class="item_photo" src="${client_img_src}" class="item_photo">
          </div>
          <div>
            <span>${date} ${time}</span>
            <span>${client_name}</span>
            <p>${description}</p>
          </div>
        </div>
        <div class="review_rating">
          Rating
        </div>
      </div>`;
    }
    $("#inner_container").append(review_container);
  }
}

function get_rest_reviews(rest_id){
  var reviews = JSON.parse(localStorage.getItem("data")).recensioni;
  var rest_reviews = [];
  for(let review of reviews)
    if(review.ristorante == rest_id)
      rest_reviews.push(review);
  return rest_reviews;
}

// Trasversal
function addHeader(active_page_index){
  var navMenuLinks = [
    '<a class="nav-link" href="restaurants.html">Ristoranti</a>',
    '<a class="nav-link" href="account.html">Account</a>',
    '<a class="nav-link" href="rest_management.html">Gestione Ristorante</a>',
    '<a id="login_link" class="nav-link" href="#modal_login" data-toggle="modal">Accedi</a>',
    '<a id="logout_link" class="nav-link" href="#0">Logout</a>'
  ]
  $('#page_wrapper').prepend(header);

  for (let link of navMenuLinks) {
    const linkText = $(link).text();

    if (!Session.isLoggedIn()) {
      if (linkText === "Logout" || linkText === "Account" || linkText === "Gestione Ristorante") {
        continue;
      }
    } else {
      if (linkText === "Accedi") {
        continue;
      }
      if (!Session.isRestaurateur()) {
        if (linkText === "Gestione Ristorante") {
          continue;
        }
      }
    }
    
    let linkItem = '<li class="nav-item">';
    linkItem += link;
    linkItem += "</li>";
    $("ul.nav_menu").append(linkItem);
  }
  
  if (Session.isLoggedIn()){
    $("#logout_link").click(Session.logout);
  }

  $("#modal_login .modal-footer>a").click(function(){
    $("#modal_login").modal("hide");
    $("#modal_register").modal();
  });
  $("#modal_register .modal-footer>a").click(function(){
    $("#modal_register").modal("hide");
    $("#modal_login").modal();
  });
}


// Register, Login, logout

function register(){
  form = document.getElementById("register_form");
  if (form.checkValidity() === false) {
    $(form).attr("class", "was-validated");
  } else {
    $(form).attr("class", "needs-validation");

    var restaurateur = $('#modal_register input[name="restaurateur"]:checked').val() === undefined ? false : true;
    var fname = $('#modal_register input[name="fname"]').val();
    var lname = $('#modal_register input[name="lname"]').val();
    var email = $('#modal_register input[name="email"]').val();
    var password = $('#modal_register input[name="password"]').val();
    var data_privacy = $('#modal_register input[name="data_privacy"]:checked').val() === undefined ? false : true;
    var tos = $('#modal_register input[name="tos"]:checked').val() === undefined ? false : true;
    var user = new User(fname, lname, email, password, data_privacy, tos);
    var emailIsUnique = true;

    if (restaurateur) {
      if (FastFoodAPI.addRestaurateur(user) === false) {
        emailIsUnique = false;
      } else {
        location.href = "new_restaurant.html";
      }
    } else {
      if (FastFoodAPI.addClient(user) === false) {
        emailIsUnique = false;
      } else {
        $("#modal_register").modal("hide");
        Notifier.register_success();
      }
    }

    if (emailIsUnique) {
      $("#register_form input[type=checkbox]:checked").prop("checked", false);
      $("#register_form input:not(input[type=checkbox])").val("");
      $("#register_form .form__feedback_placeholder").css("display", "none");
    } else {
      Notifier.emailIsNotUnique();
    }
  }
  return false;
}

function login(){
  var email = $("#modal_login input[name='email']").val();
  var password = $("#modal_login input[name='password']").val();
  var session = FastFoodAPI.login(email, password);

  if (session === null) {
    Notifier.loginError();
    return false;
  }

  sessionStorage.setItem("session", JSON.stringify(session));
  $("#login_form .form__feedback_placeholder").css("display", "none");
  return true;
}



//New restaurant page
function insertNewRestaurant(){
  var form = document.getElementById("rest_form");
  if (form.checkValidity() === false) {
    $(form).removeClass("needs-validation");
    $(form).addClass("was-validated");
    return false; 
  }
  
}

//Menu management page
function show_menu_selection(){
  $("#rest_form").hide();
  $("#menu_selection").show();
  $("#item_list").html("");

  var menu_items = FastFoodAPI.getProducts();
  var category_items_map = new Map();


  for(let item of menu_items){
    var category = item.categoria;
    if(!category_items_map.has(category)){
      category_items_map.set(category, []);
    }
    var category_items = category_items_map.get(category);
    category_items.push(item);
    category_items_map.set(category, category_items);
  }

  for(let category of category_items_map.keys()){
    let category_id = category.replace(" ", "-");
    let category_div = 
    `<div class="category" id="${category_id}">
      <a href="#${category_id}-collapsible" data-toggle="collapse">${category}<i class="fa fa-chevron-up"></i></a>
    </div>`;
    
    let collapsible_content = `<div class="item_container collapse" id="${category_id}-collapsible">`;
    for(let item of category_items_map.get(category)){
      collapsible_content += get_item_checkbox(item);
    }
    collapsible_content += "</div>";
    
    $("#menu").append(category_div);
    $("#menu").append(collapsible_content);

    $(`#${category_id}-collapsible`).on({
      "show.bs.collapse": function(){
        $(`#${category_id}>a>i`).attr("class", "fa fa-chevron-down");
        $(`#${category_id}`).css("border-bottom", "unset");
      },
      "hide.bs.collapse": function(){
        $(`#${category_id}>a>i`).attr("class", "fa fa-chevron-up");
        $(`#${category_id}`).css("border-bottom", "solid 0.15em rgb(242,242,242)");
      }
    });
  } 

  $('[data-toggle="popover"]:not(:has(img[src="img/menu_item_placeholder.svg"))').popover({html: true});

}

function get_item_checkbox(item){
  var item_img_src = item.foto ? item.foto : "img/menu_item_placeholder.svg";
  var ingredients = FastFoodAPI.getIngredients(item.ingredienti);
  var ingredient_names = [];
  var ingredient_ul;

  if(ingredients.length > 0){
    ingredient_ul = "<ul>";
    for(let ingredient of ingredients){
      ingredient_names.push(ingredient.nome);
      ingredient_ul += `<li class="ingredient" data-id="${ingredient.id}">${ingredient.nome}</li>`;
    }
    ingredient_ul += "</ul>";
  }

  var item_box = 
  `<div class="menu_item" data-id="${item.id}">
    <a href="#collapsible-${item.id}" data-toggle="collapse">
      <div class="item_header">
        <div class="item_photo_wrapper" data-toggle="popover" data-trigger="hover"
        data-content='<img class="item_preview" src="${item_img_src}">'>
          <img class="item_photo" src="${item_img_src}">
        </div>
        <div class="item_desc">
          <span>${item.categoria}</span>
          <h3>${item.nome}</h3>
          <p>${ingredient_names.join(", ")}</p>
        </div>
        <div class="item_price">
          ${item.prezzo} &euro;
        </div>
      </div>
    </a>
    <div class="collapse item_options" id="collapsible-${item.id}">`;

  item_box += 
      `<div class="item_footer">
        <div class="total_cost">
          Totale:
          <strong>${item.prezzo} &euro;</strong>
        </div>
        <div>
          <input type="checkbox">
        </div>
      </div>
    </div>
  </div>`;
  return item_box;
}

// Account page --------------------------------------------------------------------------------------------
// Fill in form placeholders and insert masked password
function prepareProfilePage() {
  if (Session.isLoggedIn()) {
    var userType = Session.getUserType();
    var userId = Session.getUserID();
    var user;
    var maskedPassword = "";

    if (userType == "client") {
      user = FastFoodAPI.getClient(userId);
    }
    else {
      user = FastFoodAPI.getRestaurateur(userId)
    }

    maskedPassword = maskPassword(user.password);
    $("#firstName").val(user.nome);
    $("#lastName").val(user.cognome);
    $("#email").val(user.email);
    $("#password").html(maskedPassword);
    
    $("#profile_form").submit(function(){
      return modifyUser(userId, userType);
    });
    $("#account_deleting_button").click(deleteAccount);
  }else {
    Notifier.loginRequired();
  }
}

function maskPassword(password){
  var maskedPassword = "";
  for (let i = 0; i < password.length; i++) {
    maskedPassword += "&bullet;";
  }
  return maskedPassword;
}


// Modify user data if they're valid and if the email is unique in case of password change
function modifyUser(userId, userType) {
  var firstName = $("#firstName").val();
  var lastName = $("#lastName").val();
  var email =  $("#email").val();
  var data = {nome:firstName, cognome:lastName, email:email}
  var emailIsUnique = true;
  var form = document.getElementById('profile_form');

  if (!form.checkValidity()) {
    $(form).attr('class', 'was-validated');
    return false;
  } else {
    $(form).attr('class', 'needs-validation');
  }


  if (userType === "client") {
    emailIsUnique = FastFoodAPI.modifyClient(userId, data);
  } else {
    emailIsUnique = FastFoodAPI.modifyRestaurateur(userId, data);
  }
  if (!emailIsUnique) {
    $("#profile_form > .form__feedback_placeholder").css("display", "flex");
  }

  return emailIsUnique;
}

function deleteAccount() {
  var userType = Session.getUserType();
  var userId = Session.getUserID();

  if (userType !== null && userId !== null) {
    if (userType === "client")
      FastFoodAPI.removeClient(userId);
    else
      FastFoodAPI.removeRestaurateur(userId);
    Session.logout();
  }
}

// Change password page ----------------------------------------------------------------------------------
function prepareChangePasswordPage() {
  if (Session.isLoggedIn()) {
    if (sessionStorage.getItem("password_changed")) {
      $("#change_password_form .form__feedback_placeholder").css("display", "flex");
      sessionStorage.removeItem("password_changed");
    } 
  } else {
    Notifier.loginRequired();
  }
}

function changePassword() {
  var userId = Session.getUserID();
  var userType = Session.getUserType();
  var oldPwd = $("#old_password").val();
  var newPwd = $("#new_password").val();
  var repeatedPwd = $("#repeated_password").val();
  let oldPwdFeedback = $("#old_password").next();
  var newPwdFeedback = $("#new_password").next();
  var repeatedPwdFeedback = $("#repeated_password").next();
  var validationFlags = [];
  var strongPwdRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*_=+-.]).{8,}$/

  if (userType === "client") {
    if (oldPwd != FastFoodAPI.getClientPassword(userId)) {
      $(oldPwdFeedback).show();
      validationFlags.push(false);
    } else {
      $(oldPwdFeedback).hide();
    }
  } else {
    if (oldPwd != FastFoodAPI.getRestaurateurPassword(userId)) {
      $(oldPwdFeedback).show();
      validationFlags.push(false);
    } else {
      $(oldPwdFeedback).hide();
    }
  }

  if (!newPwd.match(strongPwdRegex)) {
    validationFlags.push(false);
    $(newPwdFeedback).show();
  } else {
    $(newPwdFeedback).hide();
  }

  if (newPwd !== repeatedPwd) {
    validationFlags.push(false);
    $(repeatedPwdFeedback).show();
  } else {
    $(repeatedPwdFeedback).hide();
  }

  for (const flag of validationFlags) {
    if (!flag) {
      return false;
    }
  }
  if (userType === "client") {
    FastFoodAPI.modifyClientPassword(userId, newPwd);
  } else {
    FastFoodAPI.modifyRestaurateurPassword(userId, newPwd);
  }
  sessionStorage.setItem("password_changed", "true");
  return true;
}



// function fullNameIsValid(firstName, lastName) {
//   for (const name of [firstName, lastName]) {
//     console.log(name);
//     if (name.length < 3) {
//       alert("Il nome inserito è troppo breve, minimo 3 caratteri")
//       return false
//     }
  
//     var regex = /^[a-z ,.'-]+$/i;
//     if (!name.match(regex)) {
//       alert("Il nome inserito non e\' valido");
//       return false;
//     }
//   };
//   return true;
// }

// _________________________________________________________________________________________________________


var header = 
`<header>
  <nav class="navbar navbar-expand-lg bg-light navbar-light">
    <a class="navbar-brand" href="index.html">
      <img src="img/fast food logo.svg" alt="logo" style="width:40px;">FastFood
    </a>
    <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarTogglerDemo02" aria-controls="navbarTogglerDemo02" aria-expanded="false" aria-label="Toggle navigation">
      <span class="navbar-toggler-icon"></span>
    </button>

    <div class="collapse navbar-collapse w-100 order-3 dual-collapse2" id="navbarTogglerDemo02">
      <ul class="nav_menu navbar-nav ml-auto">
      </ul>
    </div> 
  </nav>
  <div class="modal fade" id="modal_login">
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h4 class="modal-title">Accedi</h4>
          <button type="button" class="close" data-dismiss="modal">&times;</button>
        </div>
        <div class="modal-body">
          <form id="login_form" method="post" onsubmit="return login();">
            <div class="form__feedback_placeholder form__feedback_placeholder--error form-group">
              <i class="material-icons">error</i>L'email o la password errata
            </div>
            <div class="form-group">
              <input class="form-control" type="email" name="email"placeholder="Email" required>
            </div>
            <div class="form-group">
              <input class="form-control" type="password" name="password" placeholder="Password" required>
            </div>
            <button type="submit" class="btn btn-success form-control">Accedi</button>
          </form>
        </div>
        <div class="modal-footer">
          <a href="#">Non sei ancora registrato?</a>
        </div>
      </div>
    </div>
  </div>
  <div class="modal fade" id="modal_register">
    <div class="modal-dialog">
      <div class="modal-content" id="login">
        <div class="modal-header">
          <h4 class="modal-title">Registrati</h4>
          <button type="button" class="close" data-dismiss="modal">&times;</button>
        </div>
        <div class="modal-body">
          <form id="register_form" class="needs-validation" onsubmit="return register();" novalidate>
            <div class="form__feedback_placeholder form__feedback_placeholder--error form-group">
              <i class="material-icons">error</i>L'email inserita è già utilizzata da qualcuno.
            </div>
            <div class="form-group form-check">
              <label class="form-check-label">
                <input class="form-check-input" type="checkbox" name="restaurateur"> Ristoratore
              </label>
              <div class="invalid-tooltip">
                Il nome non deve essere vuoto.
              </div>
            </div>
            <div class="form-group">
              <input class="form-control" type="text" name="fname" placeholder="Nome" required 
              pattern="[A-Za-z][A-Za-z ]{0,30}[A-Za-z]">
            </div>
            <div class="form-group">
              <input class="form-control" type="text" name="lname" placeholder="Cognome" required 
              pattern="[A-Za-z][A-Za-z ]{1,32}[A-Za-z]">
            </div>
            <div class="form-group">
              <input class="form-control" type="email" name="email" placeholder="Email" required>
            </div>
            <div class="form-group">
              <input class="form-control" type="password" name="password" placeholder="Password" required
              pattern="^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*_=+-.]).{8,}$">
              <div class="invalid-feedback">
                La password deve contenere:
                <ul>
                  <li>Almeno 8 caratteri</li>
                  <li>Almeno una maiuscola</li>
                  <li>Almeno una minuscola</li>
                  <li>Almeno un carattere numerico</li>
                  <li>Almeno un carattere speciale</li>
                </ul>
              </div>
            </div>
            <div class="form-group form-check">
              <label class="form-check-label">
                <input class="form-check-input" type="checkbox" name="data_privacy">Autorizzo il trattamento dei miei dati personali come previsto dalla Legge 196/2003
              </label>
            </div>
            <div class="form-group form-check">
              <label class="form-check-label">
                <input class="form-check-input" type="checkbox" name="tos"> Accetto i termini e le condizioni del servizio
              </label>
            </div>
            <button type="submit" class="btn btn-success form-control">Registrati</button>
          </form>
        </div>
        <div class="modal-footer">
          <a href="#">Sei già registrato?</a>
        </div>
      </div>
    </div>
  </div>
</header>`;

var footer = '<footer id="page_footer">FOOTER</footer>';
