const hbs = require("express-handlebars")
const Handlebars = hbs.create({})
const products = require("./model/productModel")

Handlebars.handlebars.registerHelper('eq', function(arg1, arg2, options) {
    return (arg1 == arg2) ? options.fn(this) : options.inverse(this);
})

Handlebars.handlebars.registerHelper('for', function(total,block) {
    var accum = '';
    for(var i = 1; i <= total; i ++)
        accum += block.fn(i);
    return accum;
});


Handlebars.handlebars.registerHelper('arrive', function(params) {
    let now = Math.floor(new Date().getTime()/1000)
    if(params - now > 86400 && params - now < 172800){
        checkTime = "Tommorrow"
    }else if(params - now >= 0 && params - now <= 86400){
        checkTime = "Today"
    }else if(params - now < 0){
        checkTime = "Will be updated!"
    }else{
        checkTime = new Date(params * 1000).toLocaleDateString('en-IN', { weekday:"short", year:"numeric", month:"short", day:"numeric"})
    }
    return checkTime
});

Handlebars.handlebars.registerHelper('ordered', function(params) {
    return new Date(params * 1000).toLocaleDateString('en-IN', { weekday:"short", year:"numeric", month:"short", day:"numeric"})
});

Handlebars.handlebars.registerHelper('date', function(params) {
    return new Date(params * 1000).toLocaleDateString('en-IN')
});

Handlebars.handlebars.registerHelper("dateFormat",function(param){
    let newDate = new Date(param*1000)
    thisMonth = newDate.getMonth()+1 < 10 ? "0"+(newDate.getMonth()+1) : newDate.getMonth()+1 
    thisDay = newDate.getDate() < 10 ? "0"+(newDate.getDate()+1) : newDate.getDate()
    return newDate.getFullYear()+"-"+(thisMonth)+"-"+thisDay
})

Handlebars.handlebars.registerHelper('lte', function( a, b ){
	return (a <= b) ? "<span class='text-danger'>₹"+a+"</span>" : "<span class='text-dark'>₹"+a+"</span>"
});

Handlebars.handlebars.registerHelper('rating', function(a,placeholder){
	return (a<=5&&a>3) ? "<span class='review-badge border-radius-10 p-1 ps-2 "+placeholder+"-success'>"+a+"<i class='fa fa-star'></i> </span>" : 
    (a>=2&&a<=3) ? "<span class='review-badge border-radius-10 p-1 ps-2 "+placeholder+"-warning'>"+a+"<i class='fa fa-star'></i> </span>" :
    "<span class='review-badge border-radius-10 p-1 ps-2 "+placeholder+"-danger'>"+a+"<i class='fa fa-star'></i> </span>"
});

Handlebars.handlebars.registerHelper('inArray', function(array, value, options) {
    if (array.indexOf(value) !== -1) {
      return "checked"
    } else {
      return options.inverse(this);
    }
  });
  