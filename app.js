//++++++++++++++++++++++++++++++++++++++++++++++++++++++
// BUDGET CONTROLLER
//++++++++++++++++++++++++++++++++++++++++++++++++++++++

var budgetController = (function () {

    var Expense = function (id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    };

    Expense.prototype.calcPercentage = function (totalIncome) {
        if (totalIncome > 0) {
            this.percentage = Math.round((this.value / totalIncome) * 100);
        } else {
            this.percentage = -1;
        };
    };

    Expense.prototype.getPercentage = function () {
        return this.percentage;
    }

    var Income = function (id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    };

    var calculateTotal = function (type) {
        var sum = 0;
        data.allItems[type].forEach(function (cur) {
            sum += cur.value;
        });
        data.totals[type] = sum;
    };

    var data = {
        allItems: {
            exp: [],
            inc: []
        },
        totals: {
            exp: 0,
            inc: 0
        },
        budget: 0,
        percentage: -1
    };

    return {
        addItem: function (type, des, val) {
            var newItem, ID;

            if (data.allItems[type].length > 0) {
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1; //Create an unique ID for each of the data entries
            } else {
                ID = 0;
            }


            if (type === "exp") {                                           // Create new item based on the entry type
                newItem = new Expense(ID, des, val);
            } else if (type === "inc") {
                newItem = new Income(ID, des, val)
            }
            //Push it into our data structure
            data.allItems[type].push(newItem);
            //Return the new elemnt
            return newItem;
        },

        deleteItem: function (type, id) {
            var ids, index;

            ids = data.allItems[type].map(function (current) {
                return current.id;
            });
            index = ids.indexOf(id);

            if (index !== -1) {
                data.allItems[type].splice(index, 1)
            }

        },

        calculateBudget: function () {
            // Calculate total income and expanses
            calculateTotal("exp");
            calculateTotal("inc");

            // Calculate the budget: income - expenses
            data.budget = data.totals.inc - data.totals.exp;


            // Calculate the percentage of income that we spent
            if (data.totals.inc > 0) {
                data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
            } else {
                data.percentage = -1;
            }
        },

        calculatePercentages: function () {
            data.allItems.exp.forEach(function (cur) {
                cur.calcPercentage(data.totals.inc);
            });
        },

        getPercentages: function () {
            var allPerc = data.allItems.exp.map(function (cur) {
                return cur.getPercentage();
            });
            return allPerc;
        },

        getBudget: function () {
            return {
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percentage: data.percentage
            }

        },

        testing: function () {
            console.log(data);
        }
    };

})();

//++++++++++++++++++++++++++++++++++++++++++++++++++++++
// UI CONTROLLER
//++++++++++++++++++++++++++++++++++++++++++++++++++++++

var UIController = (function () {

    var DOMstrings = {                                              //To keep all the DOM queries in one place so it is easier to manage them later on.
        inputType: ".add__type",
        inputDescription: ".add__description",
        inputValue: ".add__value",
        inputBtn: ".add__btn",
        incomeContainer: ".income__list",
        expensesContainer: ".expenses__list",
        budgetLable: ".budget__value",
        incomeLabel: ".budget__income--value",
        expensesLabel: ".budget__expenses--value",
        percentageLabel: ".budget__expenses--percentage",
        container: ".container",
        expensesPercLabel: ".item__percentage"
    };
    var formatNumber = function(num, type){
        var numSplit, int, dec, type;

        num = Math.abs(num);
        num = num.toFixed(2);

        numSplit = num.split(".");

        int = numSplit[0];
        if (int.length > 3) {
            int = int.substr(0, int.length - 3) + "," + int.substr(int.length - 3, 3)
        }
        dec = numSplit[1];

        return (type === "exp" ? "-" : "+") + " " + int + "." + dec;
    };

    return {
        getInput: function () {
            return {
                type: document.querySelector(DOMstrings.inputType).value,               // Get the entry type value. It can be either inc(+) or exp(-)
                description: document.querySelector(DOMstrings.inputDescription).value,         // Get the description entry. 
                value: parseFloat(document.querySelector(DOMstrings.inputValue).value)                      // Get the actual amount of money
            };
        },

        addListItem: function (obj, type) {
            var html, newHTML, element;
            // Create HTML string with ome placeholder text

            if (type === "inc") {
                element = DOMstrings.incomeContainer;
                html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            } else if (type === "exp") {
                element = DOMstrings.expensesContainer;
                html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }

            // Replace the placeholder text with some data
            newHTML = html.replace("%id%", obj.id);
            newHTML = newHTML.replace("%description%", obj.description);
            newHTML = newHTML.replace("%value%", formatNumber(obj.value, type));

            //Insert HTML to DOM
            document.querySelector(element).insertAdjacentHTML("beforeend", newHTML)



        },

        deleteListItem: function (selectorID) {
            var el = document.getElementById(selectorID);
            el.parentNode.removeChild(el);



        },

        clearFields: function () {                                                                            //Clear input fields after the entry
            var fields, fieldsArr;

            fields = document.querySelectorAll(DOMstrings.inputDescription + ", " + DOMstrings.inputValue);

            fieldsArr = Array.prototype.slice.call(fields);

            fieldsArr.forEach(function (current, index, array) {
                current.value = "";

            });

            fieldsArr[0].focus();

        },

        displayBudget: function (obj) {
            var type;
            obj.budget > 0 ? type = "inc" : type = "exp";

            document.querySelector(DOMstrings.budgetLable).textContent = formatNumber(obj.budget, type);
            document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber(obj.totalInc, "inc");
            document.querySelector(DOMstrings.expensesLabel).textContent = formatNumber(obj.totalExp, "exp");

            if (obj.percentage > 0) {
                document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage + "%";
            } else {
                document.querySelector(DOMstrings.percentageLabel).textContent = "----"
            }

        },

        displayPercentages: function (percentages) {

            var fields = document.querySelectorAll(DOMstrings.expensesPercLabel);

            var nodeListForEach = function (list, callback) {
                for (var i = 0; i < list.length; i++) {
                    callback(list[i], i)
                }

            };

            nodeListForEach(fields, function (current, index) {
                if (percentages[index] > 0) {
                    current.textContent = percentages[index] + "%";
                } else {
                    current.textContent = "---";
                }
            });
        },

        getDOMstrings: function () {
            return DOMstrings;
        }
    };
})();

//++++++++++++++++++++++++++++++++++++++++++++++++++++++
// GLOBAL APP CONTROLLER
//++++++++++++++++++++++++++++++++++++++++++++++++++++++

var controller = (function (budgetCtrl, UICtrl) {

    var setupEventListeners = function () {                           //Added init function to centrlize all code that needs to start when the app starts               
        var DOM = UICtrl.getDOMstrings();
        document.querySelector(DOM.inputBtn).addEventListener("click", ctrlAddItem); //

        document.addEventListener("keypress", function (event) {   //Add the result when Enter key is pressed also
            if (event.keyCode === 13 || event.which === 13) {    // Use both to be more precise. .which is for ASCII code. 
                ctrlAddItem();
            }
        });

        document.querySelector(DOM.container).addEventListener("click", ctrlDeleteItem);
    };


    var updateBudget = function () {
        //1. Calculate the budget
        budgetCtrl.calculateBudget();

        //2. Return the budget
        var budget = budgetCtrl.getBudget();

        //3. Display the budget
        UICtrl.displayBudget(budget);


    };
    var updatePercentages = function () {
        //1. Calculate the percentages
        budgetCtrl.calculatePercentages();

        //2. Read them from the budget controller
        var percentages = budgetCtrl.getPercentages();

        //3. Update the UI with the new percentages
        UICtrl.displayPercentages(percentages);

    },


        ctrlAddItem = function () {                             //Function that captures and handles the input
            var input, newItem;

            //1. Get the input data
            input = UICtrl.getInput();

            if (input.description !== "" && !isNaN(input.value) && input.value > 0) {

                //2. Add the item to the budget controller
                newItem = budgetCtrl.addItem(input.type, input.description, input.value);

                //3. Add the new item to the user interface
                UICtrl.addListItem(newItem, input.type);

                //4. For the fields cleaning
                UICtrl.clearFields();

                //5. Calculate and update budget
                updateBudget();

                //6. Calculate and update percentages
                updatePercentages();
            }
        };

    var ctrlDeleteItem = function (event) {
        var itemID, splitID, type, ID;

        itemID = (event.target.parentNode.parentNode.parentNode.parentNode.id);
        if (itemID) {
            splitID = itemID.split("-");
            type = splitID[0];
            ID = parseInt(splitID[1]);

            //1. Delete the item from the data structure
            budgetCtrl.deleteItem(type, ID);

            //2. Delete the item from the UI
            UICtrl.deleteListItem(itemID);

            //3. Update and show new budget
            updateBudget();

            //4. Calculate and update percentages
            updatePercentages();

        }
    };


    return {
        init: function () {
            console.log("Application has started");
            UICtrl.displayBudget({
                budget: 0,
                totalInc: 0,
                totalExp: 0,
                percentage: -1
            });
            setupEventListeners();
        }
    };
})(budgetController, UIController);

controller.init();













