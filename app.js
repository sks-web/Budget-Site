// Budget Controller
var budgetController = (function () {
    var Expense = function (id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    };

    Expense.prototype.calcPercentage = function(totalIncome) {
        if (totalIncome > 0) {
            this.percentage = Math.round((this.value/ totalIncome)* 100);   
        } else {
            this.percentage = -1;
        }

    }

    Expense.prototype.getPercentage = function() {
        return this.percentage;
    }

    var Income = function (id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    };

    // Calcuate total incomes and Expenses
    var calculateTotal = function (type) {
        var sum = 0;
        data.allItems[type].forEach(function (cur) {
            sum += parseFloat(cur.value);
        });
        data.total[type] =parseFloat(sum).toFixed(2);
    };

    var data = {
        allItems: {
            exp: [],
            inc: []
        },
        total: {
            exp: 0,
            inc: 0
        },
        totalBudget: 0,
        percentage: -1
    };

    return {
        addItems: function (typ, des, val) {
            var ID, newItems;
            /**
             * [1,2,3,4,5]
             */
            // Create ID for Data
            if (data.allItems[typ].length > 0) {
                ID = data.allItems[typ][data.allItems[typ].length - 1].id + 1;
            } else {
                ID = 0;
            }

            // Create new Constructor for Expense and Income
            if (typ === "exp") {
                newItems = new Expense(ID, des, val);
            } else {
                newItems = new Income(ID, des, val);
            }

            data.allItems[typ].push(newItems);
            return newItems;
        },

        deleteItem: function (type, id) {
            var ids, index;

            ids = data.allItems[type].map(function (current) {
                return current.id;
            });

            index = ids.indexOf(id);

            if (index !== -1) {
                data.allItems[type].splice(index, 1);
            }

        },

        calculateBudget: function () {

            // Calculate total incomes and expenses
            calculateTotal("inc");
            calculateTotal("exp");

            // Calcuate the total budget
            data.totalBudget = (data.total.inc - data.total.exp).toFixed(2);

            // Calculate total percentage 
            if (data.total.inc > 0) {
                data.percentage = Math.round((data.total.exp / data.total.inc) * 100);
            } else {
                data.percentage = -1;
            }
        },

        calculatePercentages: function() {
            data.allItems.exp.forEach(function(cur) {
                cur.calcPercentage(data.total.inc);
            });
        },

        getPercentage: function() {
            var allPerc = data.allItems.exp.map(function(cur) {
                return cur.getPercentage();
            });
            return allPerc;
        },

        getBudget: function () {
            // return all budget from database
            return {
                totalInc: data.total.inc,
                totalExp: data.total.exp,
                totalBudget: data.totalBudget,
                percentage: data.percentage
            }
        },

        testing: function () {
            console.log(data);

        }
    }

})();


// UI Controller
var UIController = (function () {

    var DOMString = {
        inputType: ".add__type",
        inputDescription: ".add__description",
        inputValue: ".add__value",
        inputButton: ".add__btn",
        incomeContainer: ".income__list",
        expenseContainer: ".expenses__list",
        budgetValue: ".budget__value",
        totalIncomeValue: ".budget__income--value",
        totalExpenseValue: ".budget__expenses--value",
        percentage: ".budget__expenses--percentage",
        container: ".container",
        expensesPercentLabel: ".item__percentage",
        updateDate: ".budget__title--month"
    };

    var nodeListForEach = function(list, callback) {
        for(var i =0; i< list.length;i++){
            callback(list[i], i);
        }
    };

    // Public part****
    return {
        getInput: function () {
            return {
                type: document.querySelector(DOMString.inputType).value, // will be either inc or exp
                description: document.querySelector(DOMString.inputDescription).value, // will the description
                value: parseFloat(document.querySelector(DOMString.inputValue).value).toFixed(2)
            }
        },

        displayBudget: function (obj) {
            document.querySelector(DOMString.budgetValue).textContent = obj.totalBudget;
            document.querySelector(DOMString.totalIncomeValue).textContent = obj.totalInc;
            document.querySelector(DOMString.totalExpenseValue).textContent = obj.totalExp;
            if (obj.percentage > 0) {
                document.querySelector(DOMString.percentage).textContent = obj.percentage + "%";
            } else {
                document.querySelector(DOMString.percentage).textContent = "---";
            }
        },

        displayPercentages: function(percentages){
            var fields = document.querySelectorAll(DOMString.expensesPercentLabel); 

            nodeListForEach(fields, function(current, index){
                if (percentages[index]>0) {
                    current.textContent = percentages[index]+"%";   
                } else {
                    current.textContent = "---";
                }
            });
        },

        addListItems: function (obj, type) {
            var html, element, newHtml;

            // Create html code for parsing and placeholder
            if (type === "inc") {
                element = DOMString.incomeContainer;

                html = '<div class="item clearfix" id="inc-%id%">' +
                    '<div class="item__description">%description%</div>' +
                    '<div class="right clearfix">' +
                    '<div class="item__value">+ %value%</div>' +
                    '<div class="item__delete">' +
                    '<button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button>' +
                    '</div>' +
                    '</div>' +
                    '</div>';
            } else if (type === "exp") {
                element = DOMString.expenseContainer;

                html = '<div class="item clearfix" id="exp-%id%">' +
                    '<div class="item__description">%description%</div>' +
                    '<div class="right clearfix">' +
                    '<div class="item__value">- %value%</div>' +
                    '<div class="item__percentage">21%</div>' +
                    '<div class="item__delete">' +
                    '<button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button>' +
                    '</div>' +
                    '</div>' +
                    '</div>'
            }

            // Replace all the values in placeholder
            newHtml = html.replace("%id%", obj.id);
            newHtml = newHtml.replace("%description%", obj.description);
            newHtml = newHtml.replace("%value%", obj.value);

            // Adding the html to UI.
            document.querySelector(element).insertAdjacentHTML("beforeend", newHtml);
        },

        deleteItem: function(elementID) {
            var element = document.getElementById(elementID);
            element.parentNode.removeChild(element);

        },

        clearFields: function () {
            var fields;
            fields = document.querySelectorAll(DOMString.inputDescription + "," + DOMString.inputValue);
            fieldArr = Array.prototype.slice.call(fields);
            fieldArr.forEach(function (current, index, array) {
                current.value = "";
            });
            fieldArr[0].focus();
        },

        updateMonth: function(){
            var month, year, monthArray, now;
            
            now = new Date();

            monthArray = ["January", "Febuary", "March", "April", "June", "July", "August", "September", "Octobar", "November", "December"]

            year = now.getFullYear();
            month = now.getMonth();

            document.querySelector(DOMString.updateDate).textContent = monthArray[month]+" "+year;
            
        },

        changeType: function(){
            var fields = document.querySelectorAll(
                DOMString.inputValue+","+
                DOMString.inputType+","+
                DOMString.inputDescription
            );
            
            nodeListForEach(fields, function(cur){
                cur.classList.toggle("red-focus");
            });

            document.querySelector(DOMString.inputButton).classList.toggle("red");
        },

        getDOMString: function () {
            return DOMString;
        }
    }

})();


// Universal Controller
var controller = (function (budgetCtrl, UICtrl) {

    var setEventListner = function () {
        var DOM = UICtrl.getDOMString();
        document.querySelector(DOM.inputButton).addEventListener("click", ctrlAddItem);

        document.addEventListener("keypress", function (event) {
            if (event.keyCode === 13 || event.which === 13) {
                ctrlAddItem();
            }
        });

        document.querySelector(DOM.container).addEventListener("click", ctrlDeleteItem);

        document.querySelector(DOM.inputType).addEventListener("change", UICtrl.changeType);
    };

    var updatePercentages = function() {
        // 1. Calcuate Percentaages
        budgetCtrl.calculatePercentages();
        // 2. Read percentages from budget controller
        var percentages = budgetCtrl.getPercentage();
        // 3. Update the UI
        UICtrl.displayPercentages(percentages);
        
    }

    var ctrlAddItem = function () {
        // 1. Get the field input data
        var input = UICtrl.getInput();

        if (input.description !== "" && !isNaN(input.value) && input.value > 0) {
            // 2. Add the item to the budget Controller
            var newItem = budgetCtrl.addItems(input.type, input.description, input.value);
            // 3. Add the items to the UI
            UICtrl.addListItems(newItem, input.type);
            // 4. Clearing fields of the input
            UICtrl.clearFields();
            // 5. Calculate the budget
            calculateBudget();
            // 6 Update the percentages
            updatePercentages();

        } else {
            alert("Please enter the value or don't put any zero in value.");
        }
    };

    var ctrlDeleteItem = function (event) {
        var itemID, splitID, type, ID;
        // Delete from the database
        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;
        console.log(itemID);

        if (itemID) {
            splitID = itemID.split("-");
            type = splitID[0];
            ID = parseInt(splitID[1]);
            budgetCtrl.deleteItem(type, ID);
        }
        // Delete from UI
        UICtrl.deleteItem(itemID);

        //Update the budget
        calculateBudget();

        // Update percentages
        updatePercentages();
        
    };

    var calculateBudget = function () {

        // 1. Calculate Budget
        budgetCtrl.calculateBudget();

        // 2. Return the budget
        var budget = budgetCtrl.getBudget();

        // 3. Display the budget on the UI
        UICtrl.displayBudget(budget);

    };

    // Public part*****
    return {
        init: function () {
            console.log("Application has started");
            UICtrl.updateMonth();
            UICtrl.displayBudget({
                totalInc: 0,
                totalExp: 0,
                totalBudget: 0,
                percentage: ""
            });
            setEventListner();
        }

    }

})(budgetController, UIController);

controller.init();