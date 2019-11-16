var mysql = require("mysql");
var inquirer = require("inquirer");

var connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "root",
    database: "bamazon"
});

connection.connect(function(err){
    if(err) throw err;
    getStock();
});

function wannaBuy(weGot){
    inquirer.prompt([{
        type: "list",
        name: "product",
        message: "What do you want to buy?",
        choices: weGot.product,
    }]).then(answers => {
        if(answers.product===weGot.product[0]){
            console.log(`GTFO!!!`);
            connection.end();
        }
        else{
            var n = weGot.product.indexOf(answers.product);
            howMany(weGot.product[n], weGot.quantity[n]);
        }
    });
}

function howMany(product, quantity){
    inquirer.prompt([{
        name: "quantity",
        message: "Okay, how many?",
        default: "1",
    }]).then(answers => {
        console.log(`Quantity: ${answers.quantity}`);
        if(answers.quantity<1){
            console.log(`That's too few! Try again, dummy!!!\n\n\n`);
            getStock();
        }
        else if(answers.quantity>quantity){
            console.log(`That's too many! Try again, dummy!!!\n\n\n`);
            getStock();
        }
        else{
            console.log(`OK! Purchasing ${answers.quantity} of ${product}!!!`);
            subStock(product, answers.quantity);
        }
    });
}

function getStock(){
    var available = {
        product: [],
        quantity: []
    };
    var stringPrice;
    available.product[0] = "Nuthin!!!";
    available.quantity[0] = 0;
    connection.query("select * from products", function(err, response){
        console.log(`ALL PRODUCTS:\n`)
        console.log(`NAME....................................DEPT....................................PRICE.....QUANTITY\n`);
        for(let i=0; i<response.length; i++){
            stringPrice = response[i].price.toString(10);
            console.log(`${response[i].product_name.padEnd(40, '.')}${response[i].department_name.padEnd(40, '.')}${stringPrice.padEnd(10, '.')}${response[i].stock_quantity}`);
            if(response[i].stock_quantity>0){
                available.product.push(response[i].product_name);
                available.quantity.push(response[i].stock_quantity);
            }
        }
        console.log(`\n\n\n`)
        wannaBuy(available);
    });   
}

function subStock(product, quantity){
    var price
    var newQuantity
    connection.query("select * from products where product_name = ?", [product], function(err, response){
        price = response[0].price * quantity;
        newQuantity = response[0].stock_quantity - quantity;
        connection.query("update products set stock_quantity = ? where product_name = ?", [newQuantity, product], function(err, response){
            console.log(`Total Price: ${price}. Thanks for you business!!!\n\n\n`);
            getStock();
        });
    });
}