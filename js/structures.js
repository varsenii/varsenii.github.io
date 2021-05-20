class Notifier{
    static loginError(){
      $("#login_form .form__feedback_placeholder").css("display", "flex");
    }
  
    static emailIsNotUnique(){
      $("#register_form .error_placeholder").css("display", "flex");
    }
  
    static register_success(){
      var message = 
      `<div class="alert alert-success alert-dismissible fixed_centered">
        <a class="close" href="#" data-dismiss="alert">&times;</a>
        Registrazione avvenuta con successo
      </div>`;
      $("body").append(message);
  
      window.setTimeout(function(){
        $(".alert").alert("close");
      },
      5000);
    }

    static loginRequired() {
        $(".container_wrapper").html("<h1>Ti devi loggare per visualizzare questa pagina");
    }

    static restaurateurOnly() {
        $(".central_container").addClass("central_container--trasparent")
        $(".central_container").html("<h1>Accesso solo ai restoratori</h1>");
    }

    // Change password page _____________________________________________
    static old_password_error() {
        
    }
}

class Cart{

    static addOrder(order){
        var cart = this._getCart();
        cart.push(order);
        sessionStorage.setItem("cart", JSON.stringify(cart));
    }

    static getOrders(){
        return this._getCart();
    }

    static isEmpty(){
        var cart = JSON.parse(sessionStorage.getItem("cart"));
        if(cart == null)
            return true;
        return false;
    }
    
    static _getCart(){
        var cart = JSON.parse(sessionStorage.getItem("cart"));
        if(cart == null)
            cart = [];
        return cart;
    }
}

class Order{

    constructor(product, quantity){
        this.product = product;
        this.quantity = parseInt(quantity);
    }

    getQuantity(){
        return this.quantity;
    }

    getProduct(){
        return this.product;
    }
}

class Session {

    static isLoggedIn() {
        var session = Session.#getSession();
        if (session) {
            return true;
        }
        return false;
    }

    static isRestaurateur() {
        var session = Session.#getSession(); 
        if (session && session.user_type === "restaurateur") {
            return true;
        }
        return false;
    }

    static getUserType() {
        var session = Session.#getSession();
        if (session)
            return session.user_type;
        return null;
    }

    static getUserID() {
        var session = Session.#getSession();
        if (session)
            return session.user_id;
        return null;
    }

    static getRestaurantId() {
        var session = Session.#getSession(); 
        if (session && session.user_type === "restaurateur") {
            return JSON.parse(sessionStorage.getItem("session")).restaurant;
        }
        return null;
    }

    static getCurrentRestaurant() {
        return JSON.parse(sessionStorage.getItem("current_restaurant"));
    }

    static #getSession() {
        return JSON.parse(sessionStorage.getItem("session"));
    }

    static logout() {
        sessionStorage.removeItem("session");
        location.reload();
    }
    
}