import axios from 'axios';
import {proxy} from '../config'
export default class Search{
    
    constructor(query,page =3) {
        this.query = query;
        this.page  = page;
    }
    
    async  getResults(){
       
          
        try{ 
            const result = await axios(`${proxy}https://recipesapi.herokuapp.com/api/search?q=${this.query}&page=${this.page}`);
            this.result = result.data.recipes;
            // console.log(this.result);

        }catch(err){
            console.log(`error has occured`);
        }
   }


}

