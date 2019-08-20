//++++++++++++++++++++++++++++++++++++++++++++++++++++++
// BUDGET CONTROLLER
//++++++++++++++++++++++++++++++++++++++++++++++++++++++

var budgetController = (function(){

    var Expense = function(id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    };

    var Income = function(id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    };

    var data = {
        allItems: {
            exp: [],
            inc: []
        },
        totals: {
            exp: 0,
            inc: 0
        }

    };

    return {
        addItem: function(type, des, val){
            var newItem, ID;
            
            if (data.allItems[type].length > 0) {
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1; //Create an unique ID for each of the data entries
            } else {
                ID = 0;
            }
            

            if (type === "exp") {                                           // Create new item based on the entry type
                newItem = new Expense(ID, des, val);
            }else if (type === "inc") {
                newItem = new Income (ID, des, val)
            }
                                                                            //Push it into our data structure
            data.allItems[type].push(newItem);
                                                                            //Return the new elemnt
            return newItem;
        },

        testing: function (){
            console.log(data);
        }
    };

})();

//++++++++++++++++++++++++++++++++++++++++++++++++++++++
// UI CONTROLLER
//++++++++++++++++++++++++++++++++++++++++++++++++++++++

var UIController = (function(){
    
    var DOMstrings = {                                              //To keep all the DOM queries in one place so it is easier to manage them later on.
        inputType: ".add__type",
        inputDescription: ".add__description",
        inputValue: ".add__value",
        inputBtn: ".add__btn"
    }

    return {
        getInput: function(){
            return {
                type: document.querySelector(DOMstrings.inputType).value,               // Get the entry type value. It can be either inc(+) or exp(-)
                description: document.querySelector(DOMstrings.inputDescription).value,         // Get the description entry. 
                value: document.querySelector(DOMstrings.inputValue).value                      // Get the actual amount of money
            };
        },
        getDOMstrings: function(){
            return DOMstrings;
        }
    };

})();

//++++++++++++++++++++++++++++++++++++++++++++++++++++++
// GLOBAL APP CONTROLLER
//++++++++++++++++++++++++++++++++++++++++++++++++++++++

var controller = (function(budgetCtrl, UICtrl){

    var setupEventListeners = function(){                           //Added init function to centrlize all code that needs to start when the app starts               
        var DOM = UICtrl.getDOMstrings();
        document.querySelector(DOM.inputBtn).addEventListener("click", ctrlAddItem); //

        document.addEventListener("keypress", function(event){   //Add the result when Enter key is pressed also
            if (event.keyCode === 13 || event.which === 13) {    // Use both to be more precise. .which is for ASCII code. 
                ctrlAddItem();
            }
        });
    };



    var ctrlAddItem = function (){                             //Function that captures and handles the input
        var input, newItem;

        //1. Get the input data
        input = UICtrl.getInput();

        //2. Add the item to the budget controller

        newItem = budgetCtrl.addItem(input.type, input.description, input.value);

        //3. Add the new item to the user interface

        //4. Calc the budget

        //5. Display the budget
        
    };


    return {
        init: function(){
            console.log("Application has started");
            setupEventListeners();
        }
    };
})(budgetController, UIController);

controller.init();













