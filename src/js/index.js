import Search from './models/Search';
import * as searchView from './views/searchView';
import * as recipeView from './views/recipeView';
import * as listView from './views/listView';
import * as likesView from './views/likesView';
import {elements,renderLoader,clearLoader, elementStrings}  from './views/base';
import Recipe from './models/Recipe'
import List from './models/List'
import Likes from './models/Likes';
/**Global state of the app 
 * - search object 
 * - current recipe object 
 * - shopping list object 
 * - liked recipes 
 */
const state = {};
/** 
 * Search Controller
 * 
*/


const controlSearch =async ()=>{
    // get the query from view 
    const query = searchView.getInput();  
    
    
    if(query){
    //creat new search object and add to state 
    state.search = new Search(query);


    //prepare UI for results 
    searchView.clearInput();
    searchView.clearResults();
    renderLoader(elements.searchRes);
        try{

        //do the search 
        await state.search.getResults();


        //render the result to UI
        clearLoader();
        searchView.renderResults(state.search.result);




        }catch(err){
            console.log('something went wrong with the loader')
            clearLoader();
            
        }
 
    } 
} 

elements.searchForm.addEventListener('submit',e =>{
    e.preventDefault();
    controlSearch();
});


elements.serchResPages.addEventListener('click',e=>{
    const btn = e.target.closest('.btn-inline');


    if(btn){
        const goTopage = parseInt(btn.dataset.goto , 10);

         searchView.clearResults();
        
        searchView.renderResults(state.search.result,goTopage);


    }
    // console.log(btn);

});


/** 
 * Recipe Controller
 * 
*/

const controlRecipe = async()=>{
    const id = window.location.hash.replace('#','');
    // console.log(id);
    if(id){

         //prepare the ui for changes 
         recipeView.clearRecipe();
        renderLoader(elements.recipe);
       
        //Highlight selected search item 
        if(state.search)
        searchView.highlightSelected(id);

        //create new recipe objects 
        state.recipe = new Recipe(id);

        try{
        //get recipe data 
        await state.recipe.getRecipe();
        state.recipe.parseIngredients()


        //calculate serving and time 
        state.recipe.calcTime();

        state.recipe.calcServings();

        //Render recipe 
        clearLoader();
        recipeView.renderRecipe(
            state.recipe,
            true// state.likes.isLiked(id)
            );

   
        }catch(err){
            console.log('something went wrong in recipe')
        }
    

    }
};

// window.addEventListener('hashchange',controlRecipe);
// window.addEventListener('load',controlRecipe)

['hashchange','load'].forEach(event => {
    window.addEventListener(event,controlRecipe);
});

/**
 * LIST CONTROLLER
 * 
 * */ 

const controlList = ()=> { 
    // create a new list if there is none yet 
    if(!state.list){
        state.list = new List();
    }

    //Add each ingredient to the list 
    state.recipe.ingredients.forEach(el => { 
      const item  = state.list.addItem(el.count,el.unit,el.ingredient);
   
      listView.renderItem(item);
    });


}







//Handling list button click's 
elements.shopping.addEventListener('click', e =>{
   
    const id = e.target.closest('.shopping__item').dataset.itemid;


    if(e.target.matches('.shopping__delete,.shopping__delete *')){

        //deleting from the UI
        listView.deleItem(id);

        //deleting from the list model
        state.list.deleteItem(id);
    }else if(e.target.matches('.shopping__count-value')){
        //read the data
        const val =parseFloat(e.target.value,10);


        state.list.updateCount(id,val);
        
    }

});

/**
 * LIKE CONTROLLER
 * 
 * */ 

const controlLike = ()=>{

    if(!state.likes)
        state.likes = new Likes();
    
    const currentID = state.recipe.id;

    //not yet liked the current recipe's 
    if(!state.likes.isLiked(currentID)){

        //Add like to the state 
        const newLike = state.likes.addLike(
            currentID,
            state.recipe.title,
            state.recipe.author,
            state.recipe.img
        )
        //Toggle the like button
        likesView.toogleLikeBtn(true);
        //Add to the UI list 

        likesView.renderLike(newLike);
        // console.log(state.likes);

    }else{ 
         //remove like to the state 
        state.likes.deleteLike(currentID);

        //Toggle the like button
        likesView.toogleLikeBtn(false);

        //remove to the UI list 
        likesView.deleteLike(currentID);
        // console.log(state.likes);
    
    }

};


// Restore likes 
window.addEventListener('load',()=>{

      state.likes = new Likes();

      state.likes.readStorage();

      likesView.toggleLikeMenu(state.likes.getNumLikes());

      state.likes.likes.forEach(element => {
          likesView.renderLike(element);
      });
})




likesView.toggleLikeMenu(state.likes.getNumLikes());



// Handling recipe button click's 
elements.recipe.addEventListener('click',e=>{
    if(e.target.matches('.btn-decrease, .btn-decrease *')){
       
        //Decrease button is clicked 
       if(state.recipe.servings > 1)
        state.recipe.updateServings('dec') ;
        recipeView.updateServingsIngredients(state.recipe);
    }else if(e.target.matches('.btn-increase, .btn-increase *')){
    
        //increase  button is clicked 
        state.recipe.updateServings('inc') ;
        recipeView.updateServingsIngredients(state.recipe);
    
    }else if(e.target.matches('.recipe__btn--add, .recipe__btn--add *')){
      
        controlList();
   
    }else if(e.target.matches('.recipe__love, .recipe__love *')){
      
        controlLike();
  
    }

    // console.log(state.recipe);
});

