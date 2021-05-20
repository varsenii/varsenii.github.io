class FastFoodAPI{
    static addClient(client){
        if(this.#emailIsUnique(client.email)){
            var clients = JSON.parse(localStorage.getItem("clients"));
            var id = FastFoodAPI._getMaxClientId() + 1;
            client.setId(id);
            clients.push(client);
            localStorage.setItem("clients", JSON.stringify(clients));
        } else {
            return false;
        }
    }

    static getClient(client_id){
        var clients = JSON.parse(localStorage.getItem("clients"));
        for(let client of clients)
            if(client.id == client_id)
                return client;
        return null;
    }

    static modifyClient(clientId, data) {
        var clients = JSON.parse(localStorage.getItem("clients"));
        for (let client of clients)
            if (client.id === clientId) {
                if (data.email !== client.email && !this.#emailIsUnique(data.email)) {
                   return false;
                }
                for (const attribute in data) {
                    client[attribute] = data[attribute];
                }
                localStorage.setItem("clients", JSON.stringify(clients));
                return true;
            }
        return false;
    }

    static removeClient(clientId) {
        var clients = JSON.parse(localStorage.getItem("clients"));
        for (let i = 0; i < clients.length; i++) {
            if (clients[i].id === clientId) {
                clients.splice(i, 1);
                localStorage.setItem("clients", JSON.stringify(clients));
            }
        }
    }

    static getClientPassword(userId) {
        var client = this.getClient(userId);
        if (client)
            return client.password; 
        return null;
    }

    static modifyClientPassword(userId, password) {
        var clients = JSON.parse(localStorage.getItem("clients"));
        for (let client of clients) {
            if (client.id === userId) {
                client.password = password;
                localStorage.setItem("clients", JSON.stringify(clients));
                break;
            }
        }
    }

    static addRestaurateur(restaurateur){
        if (this.#emailIsUnique(restaurateur.email)) {
            var restaurateurs = JSON.parse(localStorage.getItem("data"));
            var id = FastFoodAPI._getMaxRestaurateurId() + 1;
            restaurateur.setId(id)
            restaurateurs.push(restaurateur);
            localStorage.setItem("restaurateurs", JSON.stringify(restaurateurs));
        } else {
            return false;
        }
    }

    static getRestaurateur(restaurateurId){
        var restaurateurs = JSON.parse(localStorage.getItem("restaurateurs"));
        for(let rest of restaurateurs)
            if(rest.id == restaurateurId)
                return rest;
        return null;
    }

    static modifyRestaurateur(restaurateurId, data) {
        var restaurateurs = JSON.parse(localStorage.getItem("restaurateurs"));
        for (let restaurateur of restaurateurs)
            if (restaurateur.id === restaurateurId) {
                if (data.email !== restaurateur.email && !this.#emailIsUnique(data.email)) {
                   return false;
                }
                for (const attribute in data) {
                    restaurateur[attribute] = data[attribute];
                }
                localStorage.setItem("restaurateurs", JSON.stringify(restaurateurs));
                return true;
            }
        return false;
    }

    static removeRestaurateur(restaurateurId) {
        var restaurateurs = JSON.parse(localStorage.getItem("restaurateurs"));
        for (let i = 0; i < restaurateurs.length; i++) {
            if (restaurateurs[i].id === restaurateurId) {
                restaurateurs.splice(i, 1);
                localStorage.setItem("restaurateurs", JSON.stringify(restaurateurs));
            }
        }
    }

    static getRestaurateurPassword(restaurateurId) {
        var restaurateur = this.getRestaurateur(restaurateurId);
        if (restaurateur)
            return restaurateur.password; 
        return null;
    }

    static modifyRestaurateurPassword(restaurateurId, password) {
        var restaurateurs = JSON.parse(localStorage.getItem("restaurateurs"));
        for (let restaurateur of restaurateurs) {
            if (restaurateur.id === restaurateurId) {
                restaurateur.password = password;
                localStorage.setItem("restaurateurs", JSON.stringify(restaurateurs));
                break;
            }
        }
    }

    static getRestaurant(rest_id){
        var restaurants = JSON.parse(localStorage.getItem("restaurants"));
        for(let rest of restaurants){
            if(rest.id == rest_id) {
                return rest;
            }
        }
        return null;
    }

    static addRestaurant(restaurant){
        var restaurants = JSON.parse(localStorage.getItem("restaurants"));
        restaurants.push(restaurant);
        localStorage.setItem("restaurants", JSON.stringify(restaurants));
    }

    static modifyRestaurant(restId, info) {
        var restaurants = JSON.parse(localStorage.getItem("restaurants"));
        for (let rest of restaurants) {
            if (rest.id === restId) {
                for (const attr in info) {
                    rest[attr] = info[attr]
                }
                break;
            }
        }
        localStorage.setItem("restaurants", JSON.stringify(restaurants));
    }

    static getProducts(products_ids){
        var all_products = JSON.parse(localStorage.getItem('products'));
        var products = [];
        if(products_ids == undefined)
            return all_products;
        for(let product of all_products)
            if(products_ids.includes(product.id))
                products.push(product);
        return products;
    }

    static getProduct(id){
        var prodotti = JSON.parse(localStorage.getItem('products'));
        for(let prodotto of prodotti)
            if(prodotto.id == id)
                return prodotto;
        return prodotto;
    }

    static getIngredients(ids){
        var ingredients = JSON.parse(localStorage.getItem("ingredients"))
        var output = [];
        for(const ingredient of ingredients)
            if(ids.includes(ingredient.id))
                output.push(ingredient);
        return output;
    }

    static login(email, password){
        var clients = JSON.parse(localStorage.getItem("clients"));
        var restaurateurs = JSON.parse(localStorage.getItem("restaurateurs"));
        for(let restaurateur of restaurateurs){
            if(restaurateur.email === email && restaurateur.password === password)
                return {
                            user_id: restaurateur.id, 
                            user_type: "restaurateur", 
                            restaurant: restaurateur.restaurant
                        };
        }
        for(let client of clients){
            if(client.email == email && client.password == password)
                return {user_id: client.id, user_type: "client"};
        }
        return null;
    }

    static changeClientPassword(clientId, password) {
        var users = JSON.parse(localStorage.getItem("clients"));
        users.push(JSON.parse(localStorage.getItem("restaurateurs")));
        for (const user of users) {
            if (clientId === user.id) {
                user.password = password;
            }
        }
    }

    static _getMaxRestaurateurId() {
        var restaurateurs = JSON.parse(localStorage.getItem("restaurateurs"));
        var max_id = -1;
        for(let rest of restaurateurs)
            if(rest.id > max_id)
                max_id = rest.id;
        return max_id;
    }

    static _getMaxClientId(){
        var clients = JSON.parse(localStorage.getItem("clients"));
        var max_id = -1;
        for(let client of clients)
            if(client.id > max_id)
                max_id = client.id;
        return max_id;
    }

    static #emailIsUnique(email){
        var restaurateurs = JSON.parse(localStorage.getItem("restaurateurs"));
        var clients = JSON.parse(localStorage.getItem("clients"));
        var users = clients.concat(restaurateurs);
        for (const user of users) {
            if (user.email === email) {
                return false
            }
        }
        return true;
    }
}

function RestaurantNumberIsUnique(number) {
    var restaurants = JSON.parse(localStorage.getItem("restaurants"));
    for (const iterator of object) {
        
    }
}


class User{
    constructor(nome, cognome, email, password, trattamento_dati, termini_servizio, id){
        this.nome = nome;
        this.cognome = cognome;
        this.email = email;
        this.password = password;
        this.trattamento_dati = trattamento_dati;
        this.termini_servizio = termini_servizio;
    }

    setId(id){
        this.id = id;
    }
}
