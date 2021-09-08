import 'jasmine';

import { DEFAULT_SCORE } from '../src/modules/Constant';
import { Nature, User } from '../src/modules/User';


var userA:User
var userB:User 


describe("UserImplementation",function() { 
    beforeAll(function(){
        User.count = 0;
        userA = new User(); 
        userB = new User();
    })
    it("should initiate default values of 1 user", function() {
        
        expect(userA.id).toEqual(1);
        expect(userA.feed).toEqual([]);
        expect(userA.follows).toEqual([]);
        expect(userA.followers).toEqual([]);
        expect(userA.score).toEqual(DEFAULT_SCORE);
        expect(userA.nature).toEqual(Nature.MALICIOUS || Nature.AVERAGE || Nature.TRUTHFULL);
           
    });

    it("should increment the id when a new user is instanciated", function(){
        expect(userB.id).toEqual(2);
        expect(User.count).toEqual(2);
    })

   

});