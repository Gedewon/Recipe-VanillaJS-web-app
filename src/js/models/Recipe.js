import axios from 'axios';
import {proxy} from '../config'

export default class Recipe{
    constructor(id) {
        this.id = id ;
    }
    async getRecipe(){
        try{

            const result = await axios(`${proxy}https://recipesapi.herokuapp.com/api/get?rId=${this.id}`)
            this.result = result;
            this.title = result.data.recipe.title;
            this.author = result.data.recipe.publisher;
            this.img = result.data.recipe.image_url;
            this.url = result.data.recipe.source_url;
            this.ingredients = result.data.recipe.ingredients;
            
            
        }catch(error){
            console.log(error);
        }
    }
    calcTime(){
        const numIng = this.ingredients.length;
        const periods =Math.ceil(numIng/3);
        this.time = periods * 15 ; 
    }
    calcServings(){
        this.servings = 4;
    }

    parseIngredients(){
        const unitsLong = ['tablespoons','tablespoon','ounce','ounces','teaspoon','teaspoons','cups','pounds'];
        const unitsShort = ['tbsp','tbsp','oz','oz','tsp','tsp','cup','pound'];


        const newIngredients = this.ingredients.map(el=>{
            //uniform units 
            let ingredient = el.toLowerCase();
            unitsLong.forEach((unit,i)=>{
                ingredient = ingredient.replace(unit,unitsShort[i])

            });

            //remove ()
          ingredient =  ingredient.replace(/ *\([^)]*\) */g, "");


            //parse into count ,unit and ingredients 
         const arrIng = ingredient.split(' ');
         const unitIndex = arrIng.findIndex(el2=>
            unitsShort.includes(el2)
         );

         let objIng;
         if(unitIndex > -1){
             //There is a unit 
             const arrCount = arrIng.slice(0,unitIndex)
             
              let count;
             if(arrCount.length == 1){
                count = eval(arrIng[0].replace('-','+'));
             }else{
                 count = eval(arrIng.slice(0,unitIndex).join('+'));
             }

             objIng = {
                count,
                unit: arrIng[unitIndex],
                ingredient: arrIng.slice(unitIndex+1).join(' ')
             }

         }else if(parseInt(arrIng[0],10)){
            //There is No unit,but 1at element is number 
            objIng = {
                count : parseInt(arrIng[0],10),
                unit: '',
                ingredient: arrIng.slice(1).join(' ')
            }
       
        }else if (unitIndex === -1){
             //There is No units and no number in the first digite 
            objIng = { 
                count : 1,
                unit : '',
                ingredient
            }
            
            }
            
            return objIng;
        });
        this.ingredients = newIngredients;
    }

    updateServings(type) { 
        // serving 
        const newServings = type === 'dec' ? this.servings-1: this.servings+1;

        //Ingredients 
        this.ingredients.forEach(ing => {
            ing.count  *= (newServings/this.servings);
        });



        this.servings = newServings;
        
    }
}