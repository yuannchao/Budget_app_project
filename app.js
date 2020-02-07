
// BUDGET CONTROLLER
var budgetController = (function(){

    function Expense(id , descript , value){
        this.id = id,
        this.descript = descript,
        this.value = value,
        this.percentage = -1
    };

    Expense.prototype.calcPercentage = function(totalIncome){
        if(totalIncome > 0){
            this.percentage = Math.round((this.value / totalIncome) *100) ; 
        }else{
            this.percentage = -1 ; 
        }
        
    };

    Expense.prototype.getPercentage = function(){
        return this.percentage ; 
    };

    function Income(id , descript , value){
        this.id = id,
        this.descript = descript,
        this.value = value
    };

    var data = {
        allItems: {inc: [],exp: []},
        totals: {inc: 0,exp: 0},
        budget: 0,
        percentage: -1
    }

    function calculateTotal(type){
        var sum = 0;
        data.allItems[type].forEach(function(element){
            sum += element.value ; 
        });
        data.totals[type] = sum ; 
    }

    return {
        addItem: function(typ , des , val){
            var newItem , ID;
            ID = 0; // every new item has an ID

            // ID = lastID +1
            if(data.allItems[typ].length > 0){
                ID = data.allItems[typ][data.allItems[typ].length-1].id + 1 ;
            }else{
                ID = 0;
            };
            
            // create new item based on 'inc' or 'exp' type
            if(typ === 'inc'){
                newItem = new Income(ID , des , val);
            }else if(typ === 'exp'){
                newItem = new Expense(ID , des , val);
            };

            // add it in data structure
            data.allItems[typ].push(newItem);
            return newItem
        },
        deleteItem: function(typ , id){
            var ids, index;

            ids = data.allItems[typ].map(function(element){
                return element.id;
            });

            index = ids.indexOf(id);
            // start to remove element
            if(index !== -1){
                data.allItems[typ].splice(index , 1);
            };
        },
        calculateBudget: function(){
            // calculate total income and expense
            calculateTotal('exp');
            calculateTotal('inc');
            // calculate the budget: income - expense
            data.budget = data.totals.inc - data.totals.exp ; 
            // calculate the percentage
            if(data.totals.inc > 0){
                data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
            }else{
                data.percentage =  -1;
            } 
        },
        calculatePercentage: function(){
            data.allItems.exp.forEach(function(element){
                element.calcPercentage(data.totals.inc);
            });
        },
        getPercentage: function(){
            var allPerc = data.allItems.exp.map(function(element){
                return element.getPercentage();
            });
            return allPerc ;
        },
        getBudget: function(){
            return {
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percentage: data.percentage
            }
        },
        test: function(){
            console.log(data);
        },
    };
    
})();


// UI CONTROLLER
var UIController = (function(){

    var DOMstrings = {
        inputType: '.add__type',
        inputDescript: '.add__description',
        inputValue: '.add__value',
        addBtn: '.add__btn',
        incomeContainer: '.income__list',
        expensesContainer: '.expenses__list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expenseLabel: '.budget__expenses--value',
        percentageLabel: '.budget__expenses--percentage',
        container: '.container',
        expensePercLabel: '.item__percentage',
        dateLabel: '.budget__title--month'
    };

    function formatNumber(num , type){
        var numSplit, int, dec, sign;
        num = Math.abs(num);
        num = num.toFixed(2);

        numSplit = num.split('.');

        int = numSplit[0];
        if(int.length >3){
            int = int.substr(0 , int.length-3) + ',' + int.substr(int.length-3 , 3)
        }
        dec = numSplit[1];

        // type ==='exp'? sign = '-' : sign = '+';
        // return sign + ' ' + int +'.'+ dec ; 
        return (type === 'exp' ? '-' : '+') + ' ' + int + '.' + dec;
    }

    function nodeListForEach(list , callback){
        for(var i = 0 ; i < list.length ; i ++){
            callback(list[i] , i)
        }
    }

    return {
        getInput: function(){
            return {
                type: $(DOMstrings.inputType).val() , // will be either 'inc' or 'exp'
                descript: $(DOMstrings.inputDescript).val() ,
                value: Number($(DOMstrings.inputValue).val())
            };
        },
        getDomstrings: function(){
            return DOMstrings;
        },
        addListItem: function(obj , type){

            var html, newHtml, element;

            // 1. create HTML string with placeholder text
            if (type === 'inc') {
                element = DOMstrings.incomeContainer;
                
                html = '<div class="item clearfix" id="inc-%id%"> <div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            } else if (type === 'exp') {
                element = DOMstrings.expensesContainer;
                
                html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }
            
            // 2. replace the placeholder text
            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%description%', obj.descript);
            newHtml = newHtml.replace('%value%', formatNumber(obj.value , type));
            
            // 3. insrt the HTML into the DOM
            $(element).append(newHtml); // jquery 
            // document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
        },
        deleteListItem: function(selectorID){
            // var el = document.getSelection(selectorID);
            // el.parentNode.removeChild(el);
            $('#'+selectorID).remove()

        },
        clearField: function(){
            var fields, fieldsArr;

            fields = $(DOMstrings.inputDescript + ', ' + DOMstrings.inputValue) ;
            // fields = document.querySelectorAll(DOMstrings.inputDescript + ', ' + DOMstrings.inputValue) ;

            fieldsArr = Array.prototype.slice.call(fields) ; 
            fieldsArr.forEach(function(element){
                element.value = '' ;
            });

            fieldsArr[0].focus();
        },
        displayBudget: function(obj){
            var type;
            obj.budget > 0 ? type ='inc' : type ='exp' ; 

            $(DOMstrings.budgetLabel).text(formatNumber(obj.budget , type));
            $(DOMstrings.incomeLabel).text(formatNumber(obj.totalInc , 'inc'));
            $(DOMstrings.expenseLabel).text(formatNumber(obj.totalExp, 'exp'));
            $(DOMstrings.percentageLabel).text(obj.percentage);

            if(obj.percentage > 0){
                $(DOMstrings.percentageLabel).text(obj.percentage + '%');
            }else{
                $(DOMstrings.percentageLabel).text('---')
            };
        },
        displayPercentage: function(percentage){

            var fields = $(DOMstrings.expensePercLabel) ; 

            nodeListForEach(fields , function(element , index){

                if(percentage[index] > 0){
                    element.textContent = percentage[index] + '%';
                    // element.text(percentage[index] + '%');
                }else{
                    element.textContent = '---';
                    // element.text('---');
                }
            });
        },
        displayMonth: function(){
            var now, year, months, month;
            now = new Date();
            year = now.getFullYear();

            months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
            month = now.getMonth();

            $(DOMstrings.dateLabel).text(months[month] + ' ' + year) ; 
        },
        changeType: function(){
            var fields = $(DOMstrings.inputType + ', '+ DOMstrings.inputDescript + ', ' + DOMstrings.inputValue);

            nodeListForEach(fields , function(element){
                element.classList.toggle('red-focus');
            });
            
            // $(DOMstrings.addBtn).classList.toggle('red');
            document.querySelector(DOMstrings.addBtn).classList.toggle('red');
        },
    };



})();


// 
var controller = (function(budgetCtrl , UICtrl){

    var setupEventListeners = function(){
        var DOM = UICtrl.getDomstrings();
        $(DOM.addBtn).click(ctrlAddItem);

        $('html').keypress(function(event){
            if(event.which === 13 || event.keyCode === 13){
                ctrlAddItem();
            }
        });

        $(DOM.container).click(ctrlDeleteItem);
        $(DOM.inputType).change(UICtrl.changeType);
    };

    
    var ctrlAddItem = function(){
        var input , newItem;
        // 1. get the input data
        input = UICtrl.getInput();
        
        if(input.descript !== "" && !isNaN(input.value) && input.value > 0){
            // 2. add the item to the budget controller
            newItem = budgetCtrl.addItem(input.type , input.descript , input.value)
            // 3. add the item to the UI
            UICtrl.addListItem(newItem , input.type);
            // 4. clear the fields
            UICtrl.clearField();
            // 5. calculate and update the budget
            updateBudget();
            // 6. calculate and update the percentage
            updatePercentage();
        }

     
    };

    function ctrlDeleteItem(event){
        var itemID, splitID, type, ID;
        // find item's id in html
        itemID =  event.target.parentNode.parentNode.parentNode.parentNode.id;

        if(itemID){
            // example: inc-1
            splitID = itemID.split('-');
            type = splitID[0];
            ID = Number(splitID[1]);

            // 1. delete the item from data structure
            budgetCtrl.deleteItem(type , ID);
            // 2. delet the item form UI
            UICtrl.deleteListItem(itemID);
            // 3. update and show the new budget
            updateBudget();
            //  4. update percentage
            updatePercentage();
        }
    };

    function updateBudget(){
        // 1. calculate the budget
        budgetCtrl.calculateBudget();
        // 2. return the budget
        var budget = budgetCtrl.getBudget();
        // 3. display the budge on the UI
        UICtrl.displayBudget(budget);
    };

    function updatePercentage(){
        // 1. calculate the Percentage
        budgetCtrl.calculatePercentage();
        // 2. read Percentage from the budget
        var percentage = budgetCtrl.getPercentage();
        // 3. update the Percentage on the UI
        UICtrl.displayPercentage(percentage);
    }

    return {
        init: function(){
            alert('Budget App has started!');
            UICtrl.displayMonth();
            UICtrl.displayBudget({
                budget: 0,
                totalInc: 0,
                totalExp: 0,
                percentage: -1
            });
            setupEventListeners();
        }
    }


}(budgetController , UIController));


controller.init();