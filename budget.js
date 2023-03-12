/*---Budget Controller----*/
var budgetController = (function() {
  //create and expense object
  var Expense = function(ID,Description, Value){
    this.ID = ID;
    this.Description = Description;
    this.Value = Value;
    this.Percentage = -1;

  }
  //create prototype function for the expense object
  Expense.prototype.calcPercentage = function(totalincome){
    if(totalincome > 0){
      this.Percentage = Math.round((this.Value/totalincome)*100);

    }
    else{
      this.Percentage = -1;
    }

  }
    //create prototype function for the expense object
  Expense.prototype.getPercentage = function(){
    return this.Percentage;
  }
  //creat income object for our items
  var Income = function(ID,Description, Value){
    this.ID = ID;
    this.Description = Description;
    this.Value = Value;
  }
  var calculateTotals = function(type){
    var sum =0;
    data.allItems[type].forEach(function(cur){
      sum += cur.Value;
    });
    data.Totals[type] = sum;
  };

  //create an array to input items in this datastructure
    var data = {
      allItems:{
        exp:[],
        inc:[]
      },
      Totals:{
        exp:0,
        inc:0
      },
      budget:0,
      percentage:-1
    };

    return {
      addItem:function(type,des,val){
        var newItem, ID;
        //create new id
        if(data.allItems[type].length > 0){
            ID = data.allItems[type][data.allItems[type].length - 1].ID + 1;
        }
        else{
          ID = 0;
        }
      //create new item bassed on inc or exp
        if(type === 'exp'){
          newItem = new Expense(ID,des,val);
        }else if(type === 'inc'){
          newItem = new Income(ID,des,val);
        }
        //push it into the datastructure
        data.allItems[type].push(newItem);
        //return thr new element
        return newItem;
      },
      deleteItem:function(type, ID){//id is the element id in the datastructure array
        var ids,index;
        ids = data.allItems[type].map(function(current){
          return current.ID;//return the current id of the element in the datastructure
        });
        index = ids.indexOf(ID);//select indexof the element returned above
        if(index !== -1){
          data.allItems[type].splice(index, 1);//delete the item selected above using the splice method
        }
      },
      calculateBudget:function(){
        calculateTotals('exp');
        calculateTotals('inc');
        data.budget = data.Totals.inc - data.Totals.exp;
        data.percentage = Math.round((data.Totals.exp/data.Totals.inc)*100);
      },
      getBudget:function(){
        return{
        budget:data.budget,
        totalinc:data.Totals.inc,
        totalexp:data.Totals.exp,
        percentage:data.percentage
      };
      },
      calculatePercentages:function(){
        data.allItems.exp.forEach(function(cur){
          cur.calcPercentage(data.Totals.inc);//the calcPercentage in the expense object and the totalincome parameter
        });

      },
      getPercentages:function(){
        var allpercent = data.allItems.exp.map(function(cur){
          return cur.getPercentage();//the getPercentage in the expense object
        });
        return allpercent;//store the data
      },

      testing:function(){
        console.log(data);
      }


    };

})();







/*----UI Controller-----*/

var UIController = (function(){
  var DOMStrings = {
    //we put all our selected variables from the html here
      //this is a private function
    inputType:'.add_type',
    inputdes:'.add_description',
    inputvalue:'.add_value',
    inputBtn:'.add_btn',
    incomeContainer:'.income_list',
    expensesContainer:'.expenses_list',
    budgetLabel:'.budget_value',
    incomeLabel:'.budget_income--value',
    expensesLabel:'.budget_expenses--value',
    percentageLabel:'.budget_expenses--percentage',
    percLabel:'.item_percentage',
    datelabel:'.budget_title--month',
    contain:'.container'
  }

  var formatNumber = function(num ,type){
    var numesplit,int,dec;
    num = Math.abs(num);
    num = num.toFixed(2);
    numsplit = num.split('.');
    int = numsplit[0];
    if(int.length > 2){
      int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, 3);
    }

    dec = numsplit[1];
    return (type === "exp"? '-': '+') + ' ' + int + '.' + dec;
  }

  return{

    getInput:function () {
      return{//call the selected variables here and get the values
        type: document.querySelector(DOMStrings.inputType).value,
        description: document.querySelector(DOMStrings.inputdes).value,
        value: parseFloat(document.querySelector(DOMStrings.inputvalue).value),
      };

    },


    addListItem:function(obj, type){
      var html,newHtml,element;
      //create HTML strings with placeholder
      if(type === 'inc'){
        element = DOMStrings.incomeContainer;
      html =  '<div class="item clearfix" id="inc-%ID%"><div class="item_description">%description%</div><div class="right clearfix"><div class="item_value">%value%</div><div class="item_delete"><button class="item_delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'

  }else if(type === 'exp'){

  element = DOMStrings.expensesContainer;
  html = '<div class="item clearfix" id="exp-%ID%"><div class="item_description">%description%</div><div class="right clearfix"><div class="item_value">%value%</div><div class="item_percentage">21%</div><div class="item_delete"><button class="item_delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'

  }
      //replace the placeholder text with some actual datastructure
      newHtml = html.replace('%ID%',obj.ID);
      newHtml = newHtml.replace('%description%',obj.Description);
      newHtml = newHtml.replace('%value%',formatNumber(obj.Value, type));
      //insert the html into the dom
      var e = document.querySelector(element);
      e.insertAdjacentHTML('beforeend',newHtml)
    },
    deleteListItem:function(selectorId){
      var el = document.getElementById(selectorId);//select the element passed ie;itemId
      el.parentNode.removeChild(el);//remove the chield of that element
    },
    //delete input fields
    clearFields:function(){
      var fields,arrFields;
      fields = document.querySelectorAll(DOMStrings.inputdes + ',' +DOMStrings.inputvalue);
      arrFields = Array.prototype.slice.call(fields);
      arrFields.forEach(function(current,index,array){
        current.value = "";
      });
      arrFields[0].focus();//return focus to the des field input

    },
    //display to the ui
    displayBudget:function(obj){
      var type;
      obj.budget > 0 ? type='exp' :type = 'inc';
      document.querySelector(DOMStrings.budgetLabel).textContent = formatNumber(obj.budget,type);
      document.querySelector(DOMStrings.expensesLabel).textContent = formatNumber(obj.totalexp,'exp');
      document.querySelector(DOMStrings.incomeLabel).textContent = formatNumber(obj.totalinc,'inc');

      if(obj.percentage > 0){
        document.querySelector(DOMStrings.percentageLabel).textContent = obj.percentage + '%';
      }
      else{
          document.querySelector(DOMStrings.percentageLabel).textContent = '--';
      }

    },
    //display percentages of each item in the expenses
    displayPercentages:function(percentages){
      var fields = document.querySelectorAll(DOMStrings.percLabel);

      var nodeListForEach = function(list,callback){
        for(var i = 0;i< list.length; i++){
          callback(list[i], i);
        };
      };

      nodeListForEach(fields, function(current,index){
        if(percentages[index] > 0){
          current.textContent = percentages[index] + '%';
        }
        else{
          current.textContent = '--';
        }

      });
    },
    getmonth:function(){
      var yr,now,Month;
      Month = ['January','February','March','April','May','June','July','August','September','October','November','December'];
      now =  new Date();
      yr =  now.getFullYear();
      month = now.getMonth();
      document.querySelector(DOMStrings.datelabel).textContent = Month[month] + ' ' + yr;
    },
    changedType:function(){
      var fields = document.querySelectorAll(
        DOMStrings.inputType + ',' +
        DOMStrings.inputdes + ',' +
        DOMStrings.inputvalue
      );
      var nodeListForEach = function(list,callback){
        for(var i = 0;i< list.length; i++){
          callback(list[i], i);
        };
      }
        nodeListForEach(fields, function(cur){
          cur.classList.toggle('red-focus');
        });
      document.querySelector(DOMStrings.inputBtn).classList.toggle("red");
    },

    getDOMStrings:function(){//so we can share this property to other controllers since its a private function
      return DOMStrings;
    }
  }
})();








/*----GLOBAL APP ControllerS---*/
var Controller = (function(budgetctrl, UIctrl){

  var setUpEventListeners = function(){
    var DOM = UIctrl.getDOMStrings();//we access the shared private function using this method
    document.querySelector(DOM.inputBtn).addEventListener('click',ctrlAddItem)
    document.addEventListener('keypress',function(event){
      if(event.keyCode=== 13 || event.which===13){
            ctrlAddItem();
      }
    });
    //dete items in the datastructure
    document.querySelector(DOM.contain).addEventListener('click',ctrlDeleteItem);
      document.querySelector(DOM.inputType).addEventListener('change',UIctrl.changedType);
  }

  var updateBudget = function () {
    //calculate the budget
    budgetctrl.calculateBudget();
    //return the budget_title
    var budget = budgetctrl.getBudget();

    //display the budget on the UI
    UIctrl.displayBudget(budget);
  };
  var updatePercentages = function(){
    //1 calculate calculatePercentages
    budgetctrl.calculatePercentages();

    //2 read percentages from the budget controllers
    var per = budgetctrl.getPercentages();
    //3 update the ui with the new percentage
    UIctrl.displayPercentages(per);
  };


  var ctrlAddItem = function(){
    var input, newItem;

    //1.get field input data;
      var input = UIctrl.getInput();//note UIctrl is used because we passed it as the parameter that points to the UIController
      //console.log(input);
      if(input.description !== "" && input.value != "NAN" && input.value > 0){
        //2.add the item to the budget Controller
        newItem = budgetctrl.addItem(input.type, input.description, input.value)
        //3.add the item to the ui
        UIctrl.addListItem(newItem, input.type);
        //delete input arrFields
        UIctrl.clearFields();
        //4.calc the budget_title &
        //5.display the budget on the ui
        updateBudget();
        //6 calculate and update percentages
        updatePercentages();
      }
  }
  var ctrlDeleteItem = function(event){
    var itemId,splitId,type,id;
    itemId = event.target.parentNode.parentNode.parentNode.parentNode.id;


    if(itemId || event.keyCode=== 46 || event.which===46){
      splitId = itemId.split('-');//splits the output to "income" "0" etc
      type = splitId[0];
      id = parseInt(splitId[1]);
      //1:delete the item from the data structure
      budgetctrl.deleteItem(type, id);
      //2:delete the item from the ui
      UIctrl.deleteListItem(itemId);
      //3:update and show the new budget
      updateBudget();//====update after recalculation
      //4 calculate and update percentages
      updatePercentages();
    }


  }

  return {
    init:function () {
      console.log('init initiated');
      UIctrl.getmonth();
      //return everything to 0
      UIctrl.displayBudget({
      budget:0,
      totalinc:0,
      totalexp:0,
      percentage:-1
    });

      setUpEventListeners();
    }
  };

})(budgetController, UIController);//we give the location of the pointed field ;pointers in parameters

Controller.init();
